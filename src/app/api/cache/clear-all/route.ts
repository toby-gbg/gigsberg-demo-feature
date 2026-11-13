import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        console.log('🗑️  Clearing ALL cache files at:', new Date().toISOString());

        const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');

        try {
            const files = readdirSync(cacheDir);
            const deletedFiles: string[] = [];
            const deletedTags = new Set<string>();
            let errorCount = 0;

            for (const file of files) {
                try {
                    const filePath = join(cacheDir, file);
                    const content = readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);

                    // Track tags before deletion
                    if (data.tags) {
                        data.tags.forEach((tag: string) => deletedTags.add(tag));
                    }

                    // Delete the file
                    unlinkSync(filePath);
                    deletedFiles.push(file);
                    console.log('✅ Deleted cache file:', file);
                } catch (fileError) {
                    // Count errors but continue with other files
                    errorCount++;
                    console.warn('⚠️  Could not delete file:', file, fileError);
                    continue;
                }
            }

            if (deletedFiles.length > 0) {
                console.log(`✅ Successfully cleared ${deletedFiles.length} cache file(s)`);
                return NextResponse.json({
                    success: true,
                    message: 'All cache cleared successfully',
                    filesDeleted: deletedFiles.length,
                    tagsCleared: Array.from(deletedTags).sort(),
                    totalTags: deletedTags.size,
                    errors: errorCount,
                    files: deletedFiles,
                });
            } else {
                console.log('⚠️  No cache files found to delete');
                return NextResponse.json({
                    success: true,
                    message: 'No cache files found to delete',
                    filesDeleted: 0,
                    tagsCleared: [],
                    totalTags: 0,
                });
            }
        } catch (fsError) {
            console.error('❌ Error accessing cache directory:', fsError);
            return NextResponse.json(
                {
                    error: 'Cache directory not found or not readable',
                    cacheDir: cacheDir,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Cache clear all error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
