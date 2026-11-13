'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, SearchX, TicketPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { cn } from '@/lib/cn';
import { fallbackTranslation, isUrl } from '@/utils/common';

import useFont from '@/hooks/useFont';
import useIntlRouter from '@/hooks/useIntlRouter';

import Container from '@/components/Container';
import FallbackImage from '@/components/FallbackImage';
import MainTitle from '@/components/MainTitle';
import SubTitle from '@/components/SubTitle';
import { Button } from '@/components/ui/Button';

interface EventPageNoResultProps {
    metadata?: EntityMetadata | null;
}

const EventPageNoResult: FC<EventPageNoResultProps> = ({ metadata }) => {
    const t = useTranslations();
    const { headlineFont } = useFont();
    const router = useIntlRouter();
    const pathname = usePathname();
    const isSellTicketPage = pathname.includes('sell-ticket');

    return (
        <Container className="mb-4 p-4 md:p-6">
            {/* Header Section */}
            <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Artist Avatar */}
                    {metadata?.entity?.image && (
                        <div className="md:w-16 md:h-16 size-12 shrink-0">
                            <FallbackImage
                                src={
                                    isUrl(metadata.entity.image)
                                        ? metadata.entity.image
                                        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${metadata.entity.image}`
                                }
                                fallbackImage={
                                    metadata?.entity?.subtypeImage &&
                                    isUrl(metadata.entity.subtypeImage)
                                        ? metadata.entity.subtypeImage
                                        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${metadata.entity.subtypeImage}`
                                }
                                fill
                                sizes="(min-width: 768px) 64px, 48px"
                                alt={metadata?.entity.name}
                                className="rounded-full"
                            />
                        </div>
                    )}

                    {metadata?.entity?.name && (
                        <MainTitle
                            className={cn('mb-0! font-bold text-primary text-2xl md:text-5xl', {
                                'text-xl! md:text-[32px]!': headlineFont,
                            })}
                            title={metadata?.entity.name}
                            fontClassName={headlineFont.className}
                        />
                    )}
                </div>
            </div>

            {isSellTicketPage ? (
                <div className="flex flex-col justify-center items-center gap-4">
                    <TicketPlus className="mb-4 w-40 h-40 text-gray-200" />
                    <SubTitle
                        title={fallbackTranslation(
                            t('sell_tickets'),
                            'sell_tickets',
                            'Sell Tickets'
                        )}
                        level="h4"
                        className="mb-2 font-semibold"
                    />
                    <p className="mb-6 text-[#636367] text-center">{t('sell_tickets_message')}</p>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center gap-4">
                    <SearchX className="mb-4 w-40 h-40 text-gray-200" />
                    <SubTitle title={t('noResults')} level="h4" className="mb-2 font-semibold" />
                    <p className="text-[#636367]">{t('no_result_message')}.</p>
                    <Button className="mt-6" onClick={() => router.back()}>
                        <ArrowLeft />
                        {t('back')}
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default EventPageNoResult;
