import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function GET(
    _: Request,
    { params }: RouteContext<'/api/cache/clear-by-keyword/[keyword]'>
) {
    try {
        const { keyword } = await params;

        if (!keyword) {
            return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });
        }

        console.log(
            '🔍 Clearing cache files containing keyword:',
            keyword,
            'at',
            new Date().toISOString()
        );

        const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');

        try {
            const files = readdirSync(cacheDir);
            const deletedFiles: string[] = [];
            const matchedTags = new Set<string>();
            let errorCount = 0;

            // Convert keyword to lowercase for case-insensitive matching
            const searchKeyword = keyword.toLowerCase();

            for (const file of files) {
                try {
                    const filePath = join(cacheDir, file);
                    const content = readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);

                    // Check if any tag contains the keyword
                    if (data.tags) {
                        const hasMatchingTag = data.tags.some((tag: string) =>
                            tag.toLowerCase().includes(searchKeyword)
                        );

                        if (hasMatchingTag) {
                            // Track matched tags
                            data.tags.forEach((tag: string) => {
                                if (tag.toLowerCase().includes(searchKeyword)) {
                                    matchedTags.add(tag);
                                }
                            });

                            // Delete the file
                            unlinkSync(filePath);
                            deletedFiles.push(file);
                            console.log(
                                '✅ Deleted cache file:',
                                file,
                                'with matching tags:',
                                data.tags.filter((t: string) =>
                                    t.toLowerCase().includes(searchKeyword)
                                )
                            );
                        }
                    }
                } catch (fileError) {
                    // Count errors but continue with other files
                    errorCount++;
                    console.warn('⚠️  Could not process file:', file, fileError);
                    continue;
                }
            }

            if (deletedFiles.length > 0) {
                console.log(
                    `✅ Successfully cleared ${deletedFiles.length} cache file(s) containing keyword: "${keyword}"`
                );
                return NextResponse.json({
                    success: true,
                    keyword: keyword,
                    message: `Cleared cache entries containing keyword: "${keyword}"`,
                    filesDeleted: deletedFiles.length,
                    matchedTags: Array.from(matchedTags).sort(),
                    totalMatchedTags: matchedTags.size,
                    errors: errorCount,
                    files: deletedFiles,
                });
            } else {
                console.log(`⚠️  No cache files found containing keyword: "${keyword}"`);
                return NextResponse.json(
                    {
                        success: false,
                        keyword: keyword,
                        message: `No cache files found containing keyword: "${keyword}"`,
                        filesDeleted: 0,
                        matchedTags: [],
                        totalMatchedTags: 0,
                    },
                    { status: 404 }
                );
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
        console.error('❌ Cache clear by keyword error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
