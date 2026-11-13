'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import Tour, { SubtypeImageTile } from '@/interfaces/Tour';
import { isUrl } from '@/utils/common';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import ImageTile from '@/components/ImageTile';
import SubTitle from '@/components/SubTitle';

interface DiscoverySectionProps {
    items?: Tour[] | SubtypeImageTile[];
    title?: string;
    imageType?: 'tours' | 'subtypes';
}

const DiscoverySection = ({ items, title, imageType = 'tours' }: DiscoverySectionProps) => {
    const t = useTranslations();

    if (!items?.length) return null;

    return (
        <section className="mb-10 space-y-3">
            <SubTitle className="mb-5" title={title ?? t('popular_tournaments')} />
            <CarouselSection>
                {items.map((item) => {
                    const isURL = isUrl(item.image ?? '');
                    const imageSrc = isURL
                        ? item.image
                        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageType}/${item.image}`;
                    return (
                        <CarouselItem key={item.id}>
                            <Link prefetch={false} href={item.url ?? '/'}>
                                <ImageTile
                                    content={item.name}
                                    imageSrc={imageSrc}
                                    fallbackType={item?.type_name ?? item?.type_name_url}
                                    imageAlt={item.name}
                                />
                            </Link>
                        </CarouselItem>
                    );
                })}
            </CarouselSection>
        </section>
    );
};

export default DiscoverySection;
