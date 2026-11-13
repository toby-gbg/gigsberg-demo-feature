import { useTranslations } from 'next-intl';

import HpSlide from '@/interfaces/HpSlide';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';

import HeroCtaLink from './HeroCtaLink';

interface TrackHeroCtaClickParams {
    ctaType: 'primary' | 'secondary';
    slide: HpSlide;
    slidePosition: number;
}

interface Props {
    slide: HpSlide;
    slidePosition: number;
}

export default function HeroCta({ slide, slidePosition }: Props) {
    const t = useTranslations();

    const primaryHref = slide.event_url
        ? slide.event_url
        : slide.link
          ? slide.link.startsWith('/')
              ? slide.link
              : `/${slide.link}`
          : `/${slide.typeNameUrl}-tickets/${slide.subtypeNameUrl}/${slide.performerNameUrl}-tickets`;

    const secondaryHref = slide.link
        ? slide.link.startsWith('/')
            ? slide.link
            : `/${slide.link}`
        : `/${slide.typeNameUrl}-tickets/${slide.subtypeNameUrl}/${slide.performerNameUrl}-tickets`;

    const trackHeroCtaClick = ({ ctaType, slide, slidePosition }: TrackHeroCtaClickParams) => {
        GoogleAnalyticsTracker.triggerEvent('hero_cta_click', {
            cta_type: ctaType,
            slide_position: slidePosition,
            slide_id: slide.id,
            event_id: slide.eventId,
            performer_id: slide.performerId,
        });
    };

    return (
        <div className="flex gap-4 md:gap-8 w-full flex-row flex-wrap">
            <HeroCtaLink
                variant="primary"
                href={primaryHref}
                onClickCapture={() =>
                    trackHeroCtaClick({
                        ctaType: 'primary',
                        slide,
                        slidePosition,
                    })
                }
            >
                {fallbackTranslation(t('see_tickets'), 'see_tickets', 'See tickets')}
            </HeroCtaLink>

            {slide.events_count > 1 && (
                <HeroCtaLink
                    variant="secondary"
                    href={secondaryHref}
                    onClickCapture={() =>
                        trackHeroCtaClick({
                            ctaType: 'secondary',
                            slide,
                            slidePosition,
                        })
                    }
                >
                    {fallbackTranslation(
                        t('all_events_cta', { count: slide.events_count }),
                        'all_events_cta',
                        `All events (${slide.events_count})`
                    )}
                </HeroCtaLink>
            )}
        </div>
    );
}
