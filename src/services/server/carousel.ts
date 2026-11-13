import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readdir, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import HpSlide from '@/interfaces/HpSlide';
import Headers from '@/lib/headers';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getUserToken } from './users';

// Typical phone CSS width (iPhone-class)
const MOBILE_WIDTH = 400;
// Carousel frame is Tailwind h-120 = 480px
const MOBILE_HEIGHT = 480;
// Matches object-position: 80% center on the carousel
const OBJECT_POSITION_X = 0.8;
const OBJECT_POSITION_Y = 0.5;
const QUALITY = 30;
const FILE_HASH_LENGTH = 16;
const FORMAT = 'avif';
const MOBILE_IMAGE_TTL = 7 * 24 * 60 * 60 * 1000;

const generations = new Map<string, Promise<string | null>>();
let lastPrunedAt = 0;

export async function getMobileLcpImage(image: string): Promise<string | null> {
    let promise = generations.get(image);
    if (!promise) {
        promise = generateMobileLcpImage(image);
        generations.set(image, promise);
    }
    try {
        return await promise;
    } finally {
        if (generations.get(image) === promise) generations.delete(image);
    }
}

async function generateMobileLcpImage(image: string): Promise<string | null> {
    try {
        // Cache by asset path; upstream should version filenames when image content changes.
        const hash = createHash('sha256')
            .update(image)
            .update(
                `${MOBILE_WIDTH}x${MOBILE_HEIGHT}:${OBJECT_POSITION_X}:${OBJECT_POSITION_Y}:${QUALITY}:${FORMAT}`
            )
            .digest('hex')
            .slice(0, FILE_HASH_LENGTH);
        const fileName = `${hash}.${FORMAT}`;
        const filePath = path.join(process.cwd(), 'temp', fileName);

        try {
            await stat(filePath);
            await utimes(filePath, new Date(), new Date());
            return `/temp/${fileName}`;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }

        // Fetch the source through Next's hourly data cache on a cache miss.
        const src = `${process.env.NEXT_PUBLIC_IMAGE_URL}/hp_slides/${image}`;
        const res = await fetch(src, { next: { revalidate: Cache.HOUR } });
        if (!res.ok) throw new Error(`Carousel image fetch failed: ${res.status}`);
        const input = Buffer.from(await res.arrayBuffer());

        // Crop to the mobile frame while matching the desktop image position.
        const { width = 0, height = 0 } = await sharp(input).metadata();
        if (!width || !height) {
            return null;
        }

        const ratio = MOBILE_WIDTH / MOBILE_HEIGHT;
        let left = 0;
        let top = 0;
        let cropWidth = width;
        let cropHeight = height;

        if (width / height > ratio) {
            cropWidth = Math.round(height * ratio);
            left = Math.round((width - cropWidth) * OBJECT_POSITION_X);
        } else {
            cropHeight = Math.round(width / ratio);
            top = Math.round((height - cropHeight) * OBJECT_POSITION_Y);
        }

        // Resize and encode the crop for mobile delivery.
        const buffer = await sharp(input)
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize(MOBILE_WIDTH, MOBILE_HEIGHT)
            .avif({ quality: QUALITY })
            .toBuffer();

        const tempDir = path.join(process.cwd(), 'temp');
        await mkdir(tempDir, { recursive: true });
        const stagingPath = `${filePath}.${randomUUID()}.tmp`;

        // Write atomically so requests never see a partial image.
        try {
            await writeFile(stagingPath, buffer);
            await rename(stagingPath, filePath);
        } finally {
            await rm(stagingPath, { force: true });
        }

        // Remove old variants occasionally to limit disk growth.
        await pruneMobileLcpImages(tempDir, fileName);

        return `/temp/${fileName}`;
    } catch (e) {
        console.error('Failed to get mobile LCP image from server!', e);
        return null;
    }
}

async function pruneMobileLcpImages(tempDir: string, currentFile: string) {
    const now = Date.now();
    if (now - lastPrunedAt < 60 * 60 * 1000) return;
    lastPrunedAt = now;
    try {
        await Promise.all(
            (await readdir(tempDir))
                .filter((file) => file !== currentFile && /^[a-f0-9]{16}\.avif$/.test(file))
                .map(async (file) => {
                    const filePath = path.join(tempDir, file);
                    if ((await stat(filePath)).mtimeMs < now - MOBILE_IMAGE_TTL)
                        await rm(filePath, { force: true });
                })
        );
    } catch (error) {
        lastPrunedAt = 0;
        console.error('Failed to clean up stale mobile LCP images', error);
    }
}

export const carouselApi = {
    async getHomeSlides(): Promise<HpSlide[]> {
        const currencyCode = await getCurrencyFromCookies();
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const token = await getUserToken();
        return apiService.get<HpSlide[]>(apiEndpoints.carousel, {
            params: { currencyCode },
            headers: {
                'x-website-domain': hostname,
                ...(locale && { 'x-explicit-locale': locale }),
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
    },
    async getTypeSlides({
        type,
        currencyCode,
    }: {
        type: string;
        currencyCode: string;
    }): Promise<HpSlide[]> {
        const hostname = await Headers.getHostname();
        const locale = await Headers.getExplicitLocale();
        const token = await getUserToken();
        return apiService.get<HpSlide[]>(apiEndpoints.carousel, {
            params: { type, currencyCode },
            headers: {
                'x-website-domain': hostname,
                ...(locale && { 'x-explicit-locale': locale }),
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
    },
};
