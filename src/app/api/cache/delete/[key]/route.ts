import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function GET(_: Request, { params }: RouteContext<'/api/cache/delete/[key]'>) {
    try {
        const { key } = await params;

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        console.log('🗑️  Deleting cache files for tag:', key, 'at', new Date().toISOString());

        const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');

        try {
            const files = readdirSync(cacheDir);
            const deletedFiles: string[] = [];

            for (const file of files) {
                try {
                    const filePath = join(cacheDir, file);
                    const content = readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);

                    // Check if this cache entry has the tag we're looking for
                    if (data.tags && data.tags.includes(key)) {
                        // Delete the file
                        unlinkSync(filePath);
                        deletedFiles.push(file);
                        console.log('✅ Deleted cache file:', file);
                    }
                } catch (parseError) {
                    // Skip invalid JSON files
                    continue;
                }
            }

            if (deletedFiles.length > 0) {
                console.log(
                    `✅ Successfully deleted ${deletedFiles.length} cache file(s) for tag: ${key}`
                );
                return NextResponse.json({
                    success: true,
                    deleted: key,
                    filesDeleted: deletedFiles.length,
                    files: deletedFiles,
                });
            } else {
                console.log(`⚠️  No cache files found with tag: ${key}`);
                return NextResponse.json(
                    {
                        success: false,
                        message: `No cache files found with tag: ${key}`,
                    },
                    { status: 404 }
                );
            }
        } catch (fsError) {
            console.error('❌ Error accessing cache directory:', fsError);
            return NextResponse.json(
                {
                    error: 'Cache directory not found or not readable',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Cache deletion error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
