import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(_: Request, { params }: RouteContext<'/api/cache/view/[key]'>) {
    try {
        const { key } = await params;

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        console.log('🔍 Looking for cache with tag:', key, 'at', new Date().toISOString());

        const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');

        try {
            const files = readdirSync(cacheDir);

            for (const file of files) {
                const filePath = join(cacheDir, file);
                const content = readFileSync(filePath, 'utf8');

                try {
                    const data = JSON.parse(content);

                    // Check if this cache entry has the tag we're looking for
                    if (data.tags && data.tags.includes(key)) {
                        console.log('✅ Found cache for tag:', key);

                        // Get file stats
                        const stats = statSync(filePath);
                        const fileModifiedTime = stats.mtime;
                        const now = new Date();
                        const ageInSeconds = Math.floor(
                            (now.getTime() - fileModifiedTime.getTime()) / 1000
                        );
                        const isStale = data.revalidate ? ageInSeconds > data.revalidate : false;

                        // Decode the body if it exists and is base64
                        let decodedBody = null;
                        if (data.data && data.data.body) {
                            try {
                                const buffer = Buffer.from(data.data.body, 'base64');
                                decodedBody = JSON.parse(buffer.toString('utf8'));
                            } catch (e) {
                                decodedBody = data.data.body;
                            }
                        }

                        console.log(
                            `📊 Cache age: ${ageInSeconds}s, Revalidate: ${data.revalidate}s, Stale: ${isStale}`
                        );

                        return NextResponse.json({
                            success: true,
                            tag: key,
                            file: file,
                            tags: data.tags,
                            revalidate: data.revalidate || null,
                            fileModifiedAt: fileModifiedTime.toISOString(),
                            ageInSeconds: ageInSeconds,
                            isStale: isStale,
                            lastModified: data.lastModified || null,
                            data: decodedBody,
                        });
                    }
                } catch (parseError) {
                    // Skip invalid JSON files
                    continue;
                }
            }

            console.log('❌ No cache found for tag:', key);

            // Return available tags
            const allTags = new Set<string>();
            for (const file of files) {
                try {
                    const filePath = join(cacheDir, file);
                    const content = readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);
                    if (data.tags) {
                        data.tags.forEach((tag: string) => allTags.add(tag));
                    }
                } catch (e) {
                    // Skip
                }
            }

            return NextResponse.json(
                {
                    success: false,
                    message: `No cache found with tag: ${key}`,
                    availableTags: Array.from(allTags).sort(),
                },
                { status: 404 }
            );
        } catch (fsError) {
            console.error('❌ Error reading cache directory:', fsError);
            return NextResponse.json(
                {
                    error: 'Cache directory not found or not readable',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Cache view error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
