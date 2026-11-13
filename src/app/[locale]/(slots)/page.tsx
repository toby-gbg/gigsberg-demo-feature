'use server';

import { Metadata } from 'next';

import { generateIndexMetaTag } from '@/utils/seo';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]'>): Promise<Metadata> {
    return {
        ...generateIndexMetaTag(await searchParams),
    };
}

const HomePage = async () => {
    return null;
};

export default HomePage;
