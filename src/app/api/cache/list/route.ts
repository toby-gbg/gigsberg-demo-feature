import { NextResponse } from 'next/server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        console.log('📋 Listing all cache tags at:', new Date().toISOString());

        const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');

        try {
            const files = readdirSync(cacheDir);
            const allTags = new Set<string>();
            const cacheEntries: Array<{
                file: string;
                tags: string[];
                revalidate: number | null;
            }> = [];

            for (const file of files) {
                try {
                    const filePath = join(cacheDir, file);
                    const content = readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);

                    if (data.tags) {
                        data.tags.forEach((tag: string) => allTags.add(tag));
                        cacheEntries.push({
                            file: file,
                            tags: data.tags,
                            revalidate: data.revalidate || null,
                        });
                    }
                } catch (e) {
                    // Skip invalid files
                }
            }

            console.log('✅ Found', allTags.size, 'unique cache tags');

            return NextResponse.json({
                success: true,
                totalEntries: cacheEntries.length,
                totalTags: allTags.size,
                tags: Array.from(allTags).sort(),
                entries: cacheEntries,
            });
        } catch (fsError) {
            console.error('❌ Error reading cache directory:', fsError);
            return NextResponse.json(
                {
                    error: 'Cache directory not found or not readable',
                    cacheDir: cacheDir,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Cache list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
