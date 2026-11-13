import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request, { params }: RouteContext<'/api/invalidate/tag/[key]'>) {
    try {
        const { key } = await params;

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        // Check if ?delete=true query parameter is present
        const url = new URL(request.url);
        const shouldDelete = url.searchParams.get('delete') === 'true';

        console.log('🗑️  Invalidating cache for tag:', key, 'at', new Date().toISOString());
        revalidateTag(key, { expire: 0 });
        console.log('✅ Cache invalidated successfully for tag:', key);

        let deletedFiles: string[] = [];

        // If delete=true, also physically delete the cache files
        if (shouldDelete) {
            console.log('🗑️  Also deleting cache files for tag:', key);
            try {
                const cacheDir = join(process.cwd(), '.next', 'cache', 'fetch-cache');
                const files = readdirSync(cacheDir);

                for (const file of files) {
                    try {
                        const filePath = join(cacheDir, file);
                        const content = readFileSync(filePath, 'utf8');
                        const data = JSON.parse(content);

                        if (data.tags && data.tags.includes(key)) {
                            unlinkSync(filePath);
                            deletedFiles.push(file);
                            console.log('✅ Deleted cache file:', file);
                        }
                    } catch (parseError) {
                        // Skip invalid files
                        continue;
                    }
                }

                console.log(`✅ Deleted ${deletedFiles.length} cache file(s)`);
            } catch (fsError) {
                console.error('❌ Error deleting cache files:', fsError);
            }
        }

        return NextResponse.json({
            success: true,
            invalidated: key,
            deleted: shouldDelete,
            filesDeleted: deletedFiles.length,
            files: shouldDelete ? deletedFiles : undefined,
        });
    } catch (error) {
        console.error('❌ Revalidation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
