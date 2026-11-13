/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX({
    options: {
        remarkPlugins: ['remark-frontmatter', ['remark-mdx-frontmatter', { name: 'metadata' }]],
    },
});

const nextConfig: NextConfig = {
    output: 'standalone',
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    reactStrictMode: false,
    productionBrowserSourceMaps: false, // Don't expose client source maps in production
    poweredByHeader: false,
    compiler: {
        // Target modern browsers to remove unnecessary polyfills
        removeConsole:
            process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
    experimental: {
        // Enable filesystem caching for `next dev`
        turbopackFileSystemCacheForDev: true,
        // Enable filesystem caching for `next build`
        turbopackFileSystemCacheForBuild: true,
    },
    typedRoutes: true,
    images: {
        qualities: [50, 75],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 3600, // Cache images for 1 hour instead of 1 minute
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize for common device sizes
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/temp/:filename*',
                headers: [
                    {
                        // 1 hour browser, 1 day CDN, 2 days stale-while-revalidate — LCP slide can change in 1–2 days
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=172800',
                    },
                ],
            },
            {
                source: '/:path((?!_next/static|_next/image|favicon.ico|temp).*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, must-revalidate',
                    },
                ],
            },
            {
                source: '/.well-known/apple-developer-merchantid-domain-association',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/plain',
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(withMDX(nextConfig));
