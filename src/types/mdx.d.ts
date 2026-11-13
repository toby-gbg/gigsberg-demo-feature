declare module '*.mdx' {
    import type { MDXContent } from 'mdx/types';

    const Content: MDXContent;
    export const metadata: unknown;
    export default Content;
}
