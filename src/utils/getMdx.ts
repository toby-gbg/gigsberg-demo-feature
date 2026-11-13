import type { MDXContent } from 'mdx/types';

interface MdxDocument<T> {
    Content: MDXContent;
    metadata: T;
}

export const getMdx = async <T>(locale: string, path: string): Promise<MdxDocument<T>> => {
    const { default: Content, metadata } = await import(`../content/${path}/en-GB.mdx`);
    return { Content, metadata: metadata as T };

    // try {
    //     const { default: Content, metadata } = await import(`../content/${path}/${locale}.mdx`);
    //     return { Content, metadata: metadata as T };
    // } catch {
    //     const { default: Content, metadata } = await import(`../content/${path}/en-GB.mdx`);
    //     return { Content, metadata: metadata as T };
    // }
};
