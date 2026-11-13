import { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import AffiliateImage from '@/assets/img/affiliate/affiliate.jpg';
import DemoChartImage from '@/assets/img/affiliate/demo_chart.png';
import Headers from '@/lib/headers';
import { fallbackTranslation as fallbackTranslationUtil } from '@/utils/common';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';
import {
    AFFILIATE_CARDS,
    AFFILIATE_COMMISSION_PERCENTAGE,
    AFFILIATE_COOKIE_DAYS,
    AFFILIATE_TAGS,
    BRAND_NAME,
    RATING_MAX,
    RATING_VALUE,
} from '@/constants/affiliates';

import MainContainer from '@/components/MainContainer';
import { buttonVariants } from '@/components/ui/Button';

import AffiliateProgramForm from './_components/AffiliateProgramForm';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/affiliate-program'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'affiliate-program' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_affiliate_program', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

const fallbackTranslation = (translated: string, key: string, fallback: string) => {
    if (translated.includes(key)) return fallback;
    return fallbackTranslationUtil(translated, key, fallback);
};

export default async function AffiliateProgramPage() {
    const t = await getTranslations();

    const AFFILIATE_HIGHLIGHTS = [
        {
            label: 'commission',
            labelDesc: 'Commission',
            value: `${AFFILIATE_COMMISSION_PERCENTAGE}%`,
        },
        {
            label: 'cookie',
            labelDesc: 'Cookie',
            value: `${AFFILIATE_COOKIE_DAYS} ${AFFILIATE_COOKIE_DAYS > 1 ? fallbackTranslation(t('days'), 'days', 'days') : fallbackTranslation(t('day'), 'day', 'day')}`,
        },
        { label: 'tickets', labelDesc: 'Tickets', value: '100K+' },
        { label: 'Trustpilot', value: `${RATING_VALUE}/${RATING_MAX}` },
    ];

    const AFFILIATE_STATS = [
        {
            val: `${AFFILIATE_COMMISSION_PERCENTAGE}%`,
            title: fallbackTranslation(
                t('per_sale_commission'),
                'per_sale_commission',
                'Per Sale Commission'
            ),
            sub: fallbackTranslation(
                t('avg_ticket_text', { avgTicketAmount: '€350', conversionCost: '€27–€29' }),
                'avg_ticket_text',
                `Avg. ticket ~€350 = €27–€29 per conversion`
            ),
        },
        {
            val: `${AFFILIATE_COOKIE_DAYS} ${AFFILIATE_COOKIE_DAYS > 1 ? fallbackTranslation(t('days'), 'days', 'days') : fallbackTranslation(t('day'), 'day', 'day')}`,
            title: 'Cookie Window',
            sub: fallbackTranslation(
                t('earn_without_purchase'),
                'earn_without_purchase',
                'Earn even without an immediate purchase'
            ),
        },
        {
            val: fallbackTranslation(t('free'), 'free', 'Free'),
            title: fallbackTranslation(t('banners_media'), 'banners_media', 'Banners & Media'),
            sub: fallbackTranslation(
                t('creative_assets_description'),
                'creative_assets_description',
                'High-converting creative assets, ready to use'
            ),
        },
    ];

    const AFFILIATE_EXAMPLE_EARNINGS = [
        {
            earnVal: 42,
            style: {
                backgroundColor: '#1a5fff',
                top: '14%',
                left: '-10%',
                boxShadow: '0 8px 24px #1a5fff55',
            },
        },
        {
            earnVal: 78,
            style: {
                backgroundColor: '#0f52d4',
                top: '32%',
                left: '-18%',
                boxShadow: '0 8px 24px #0f52d455',
            },
        },
        {
            earnVal: 19,
            style: {
                backgroundColor: '#00b8a9',
                top: '52%',
                left: '-14%',
                boxShadow: '0 8px 24px #00b8a955',
            },
        },
        {
            earnVal: 61,
            style: {
                backgroundColor: '#1a5fff',
                top: '68%',
                left: '-8%',
                boxShadow: '0 8px 24px #1a5fff55',
            },
        },
    ];

    const AFFILIATE_BENEFITS = [
        {
            key: 'commission_percentage_highlight',
            label: (
                <span>
                    <strong>{AFFILIATE_COMMISSION_PERCENTAGE}% commission</strong> on every valid
                    sale
                </span>
            ),
        },
        {
            key: 'cookie_period_highlight',
            label: (
                <span>
                    <strong>{AFFILIATE_COOKIE_DAYS}-day cookie period</strong> — earn even if the
                    purchase isn&apos;t immediate
                </span>
            ),
        },
        {
            key: 'free_access_highlight',
            label: (
                <span>
                    <strong>Free access</strong> to high-converting banners and media assets
                </span>
            ),
        },
        {
            key: 'api_integration_highlight',
            label: (
                <span>
                    <strong>Easy API integration</strong> with full developer documentation
                </span>
            ),
        },
        {
            key: 'real_time_dashboard_highlight',
            label: (
                <span>
                    <strong>Real-time dashboard</strong> — track clicks, conversions and earnings
                </span>
            ),
        },
        {
            key: 'affiliate_manager_highlight',
            label: (
                <span>
                    <strong>Dedicated affiliate manager</strong> to support your growth
                </span>
            ),
        },
        {
            key: 'highlight_multi_language',
            label: (
                <span>
                    <strong>Multi-language & multi-currency</strong> — global inventory
                </span>
            ),
        },
        {
            key: 'trustpilot_rating_highlight',
            label: (
                <span>
                    <strong>
                        {RATING_VALUE}/{RATING_MAX} on Trustpilot
                    </strong>{' '}
                    — a platform your audience can trust
                </span>
            ),
        },
    ];

    return (
        <main id="affiliate_page">
            {/* HERO */}
            <section id="hero" className="bg-[#0b1d3a]">
                <MainContainer className="relative items-center gap-12 grid grid-cols-1 lg:grid-cols-7 xl:grid-cols-2 py-14 lg:py-20 min-h-[520px] overflow-hidden">
                    <div className="z-10 relative lg:col-span-4 xl:col-span-1 px-6 lg:px-0">
                        <div className="flex items-center bg-[#00d4c3]/10 mx-auto lg:mx-0 mb-6 px-[14px] py-[5px] border border-[#00d4c3]/30 rounded-full w-fit font-bold text-[#00d4c3] text-xs uppercase tracking-[0.1em]">
                            {fallbackTranslation(
                                t('brand_affiliate_programme_title', { brandName: BRAND_NAME }),
                                'brand_affiliate_programme_title',
                                `${BRAND_NAME} Affiliate Programme`
                            )}
                        </div>
                        <h1 className="pb-5 overflow-hidden font-extrabold text-[31px] text-white lg:text-[47px] xl:text-[52px] md:text-5xl text-center lg:text-start text-balance leading-[1.08]">
                            {!t('affiliate_intro_promote_income').includes(
                                'affiliate_intro_promote_income'
                            ) ? (
                                t.rich('affiliate_intro_promote_income', {
                                    br: () => <br />,
                                    highlight: (chunks) => (
                                        <span className="text-[#1a5fff]">{chunks}</span>
                                    ),
                                })
                            ) : (
                                <span>
                                    Promote live events
                                    <br />
                                    <span className="text-[#1a5fff]">
                                        while boosting
                                        <br />
                                        your income
                                    </span>
                                </span>
                            )}
                        </h1>
                        <p className="mx-auto lg:mx-0 mb-9 max-w-[430px] text-[17px] text-[rgba(255,255,255,0.58)] text-white/58 text-center lg:text-start leading-[1.65]">
                            {!t('affiliate_intro_join_programme').includes(
                                'affiliate_intro_join_programme'
                            ) ? (
                                t.rich('affiliate_intro_join_programme', {
                                    highlight: (chunks) => (
                                        <span className="font-semibold text-[#7aa8ff]">
                                            {chunks}
                                        </span>
                                    ),
                                    brandName: BRAND_NAME,
                                    percentage: AFFILIATE_COMMISSION_PERCENTAGE,
                                })
                            ) : (
                                <span>
                                    Join the{' '}
                                    <span className="font-semibold text-[#7aa8ff]">
                                        {BRAND_NAME} Affiliate Programme
                                    </span>{' '}
                                    and earn {AFFILIATE_COMMISSION_PERCENTAGE}% commission on every
                                    ticket sale — concerts, sports, festivals and more.
                                </span>
                            )}
                        </p>
                        <a
                            href="#contact"
                            className={buttonVariants({
                                className: 'mx-auto block w-fit bg-[#1a5fff] text-white lg:mx-0',
                            })}
                        >
                            {fallbackTranslation(t('apply_now'), 'apply_now', 'Apply Now')}
                        </a>
                        <div className="place-items-start md:place-items-center lg:place-items-start gap-7 grid grid-cols-2 md:grid-cols-4 mt-11 pt-9 border-white/10 border-t">
                            {AFFILIATE_HIGHLIGHTS.map((item) => (
                                <div
                                    key={item.value}
                                    className="flex flex-col items-center lg:items-start mx-auto lg:mx-0"
                                >
                                    <span className="font-semibold text-[22px] text-white">
                                        {item.value}
                                    </span>
                                    <span className="mt-1 text-[11px] text-white/60 uppercase tracking-[0.18em]">
                                        {fallbackTranslation(
                                            t(item.label),
                                            item.label,
                                            item.labelDesc || item.label
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="z-10 relative flex justify-center lg:col-span-3 xl:col-span-1">
                        <div className="relative w-full max-w-[460px]">
                            <div className="shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-white/10 rounded-[24px] aspect-[4/5] overflow-hidden">
                                <Image
                                    src={AffiliateImage}
                                    alt="Affiliate marketing"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b1d3a]/80" />
                            <div className="top-4 left-4 absolute flex flex-wrap items-center gap-2 w-[calc(100%-32px)]">
                                {AFFILIATE_TAGS.map((tag) => (
                                    <div
                                        key={tag.key}
                                        className="bg-[#0b1d3a]/70 backdrop-blur-sm px-3 py-1 border border-white/20 rounded-full font-semibold text-[12px] text-white"
                                    >
                                        {tag.emoji}{' '}
                                        {fallbackTranslation(t(tag.key), tag.key, tag.label)}
                                    </div>
                                ))}
                            </div>
                            <div className="top-10 md:top-0 left-14 md:left-4 absolute w-full h-full">
                                <div className="relative w-full h-full">
                                    {AFFILIATE_EXAMPLE_EARNINGS.map((earning) => (
                                        <span
                                            key={earning.earnVal}
                                            className="absolute px-3 md:px-[18px] py-2 md:py-[10px] rounded-full font-semibold text-white md:text-[16px] text-xs"
                                            style={earning.style}
                                        >
                                            +€{earning.earnVal}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="-right-10 md:-right-10 -bottom-12 md:bottom-6 absolute w-[220px]">
                                <div className="bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] p-4 border border-white/10 rounded-[24px] overflow-hidden scale-75 md:scale-100 lg:scale-80 xl:scale-100">
                                    <div className="font-bold text-[11px] text-gray-400">
                                        {fallbackTranslation(
                                            t('affiliate_earnings_title'),
                                            'affiliate_earnings_title',
                                            'Your affiliate earnings'
                                        )}
                                    </div>
                                    <div className="mb-3 font-extrabold text-[22px] text-black">
                                        €3,840
                                    </div>
                                    <div className="mr-[-20px] border border-white/10 rounded-[16px] overflow-hidden">
                                        <Image
                                            src={DemoChartImage}
                                            alt="Demo chart"
                                            className="h-auto max-h-[70px] w-full"
                                            width={200}
                                            height={70}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </MainContainer>
            </section>

            {/* BENEFITS */}
            <section id="benefits" className="px-6 lg:px-0 py-14 lg:py-20">
                <MainContainer className="gap-12 grid grid-cols-1 xl:grid-cols-2">
                    <div>
                        <div className="mb-2.5 font-bold text-[#1a5fff] text-xs uppercase tracking-[0.1em]">
                            {fallbackTranslation(t('what_you_get'), 'what_you_get', 'What you get')}
                        </div>
                        <h2 className="hidden xl:block pb-4 overflow-hidden font-bold text-3xl lg:text-4xl">
                            {!t('everything_to_start_earning_title').includes(
                                'everything_to_start_earning_title'
                            ) ? (
                                t.rich('everything_to_start_earning_title', { br: () => <br /> })
                            ) : (
                                <span>
                                    Everything You Need
                                    <br />
                                    to Start Earning
                                </span>
                            )}
                        </h2>
                        <h2 className="xl:hidden block pb-4 overflow-hidden font-bold text-[29px] md:text-3xl">
                            {!t('everything_to_start_earning_title').includes(
                                'everything_to_start_earning_title'
                            ) ? (
                                t.rich('everything_to_start_earning_title', {
                                    br: () => <span> </span>,
                                })
                            ) : (
                                <span>Everything You Need to Start Earning</span>
                            )}
                        </h2>
                        <p className="mb-8 text-gray-600">
                            {fallbackTranslation(
                                t('marketplace_description', { brandName: BRAND_NAME }),
                                'marketplace_description',
                                `${BRAND_NAME} is one of the largest secondary ticket marketplaces in the EU. Our affiliate programme gives you all the tools to monetise your audience simply and reliably.`
                            )}
                        </p>
                        <ul className="space-y-3">
                            {AFFILIATE_BENEFITS.map((benefit) => (
                                <li key={benefit.key} className="flex items-start gap-3">
                                    <span className="flex justify-center items-center bg-[#eef2ff] rounded-full w-7 min-w-7 h-7 text-[#1a5fff]">
                                        ✔
                                    </span>
                                    <span className="text-gray-700">
                                        {!t(benefit.key).includes(benefit.key)
                                            ? t.rich(benefit.key, {
                                                  ratingValue: RATING_VALUE,
                                                  ratingMax: RATING_MAX,
                                                  day: AFFILIATE_COOKIE_DAYS,
                                                  percentage: AFFILIATE_COMMISSION_PERCENTAGE,
                                                  highlight: (chunks) => <strong>{chunks}</strong>,
                                              })
                                            : benefit.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="gap-4 grid grid-cols-1 h-fit">
                        {AFFILIATE_STATS.map((stat) => (
                            <div
                                key={stat.val}
                                className="bg-[#0b1d3a] p-6 border border-[#1a3a6c] rounded-[16px]"
                            >
                                <div className="mb-2 font-extrabold text-[#7aa8ff] text-[28px]">
                                    {stat.val}
                                </div>
                                <div className="mb-1 font-semibold text-white text-sm">
                                    {stat.title}
                                </div>
                                <div className="text-white/50 text-xs">{stat.sub}</div>
                            </div>
                        ))}
                        <a
                            href="#contact"
                            className={buttonVariants({
                                className: 'w-full bg-[#1a5fff] text-white',
                            })}
                        >
                            {fallbackTranslation(
                                t('get_started_free'),
                                'get_started_free',
                                "Get Started — It's Free"
                            )}{' '}
                            →
                        </a>
                    </div>
                </MainContainer>
            </section>

            {/* WHO */}
            <section id="who" className="bg-[#0b1d3a] px-6 lg:px-0 py-14 lg:py-20">
                <MainContainer>
                    <div className="mb-12">
                        <div className="mb-2.5 font-bold text-[#00b8a9] text-xs uppercase tracking-[0.1em]">
                            {fallbackTranslation(
                                t('is_this_for_you'),
                                'is_this_for_you',
                                'Is this for you?'
                            )}
                        </div>
                        <h2 className="pb-4 overflow-hidden font-bold text-white text-3xl lg:text-4xl">
                            {fallbackTranslation(
                                t('affiliate_who_suits'),
                                'affiliate_who_suits',
                                'Who Does This Programme Suit?'
                            )}
                        </h2>
                        <p className="max-w-2xl text-white/70">
                            {fallbackTranslation(
                                t('programme_suitability'),
                                'programme_suitability',
                                'Our programme is designed for long-term partnership, not one-time transactions.'
                            )}
                        </p>
                    </div>
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                        {AFFILIATE_CARDS.map((card) => (
                            <div
                                key={card.title}
                                className="bg-[#FFFFFF0F] p-6 border border-white/10 rounded-lg transition-transform hover:-translate-y-1 duration-200"
                            >
                                <div className="bg-[#00b8a9] mb-4 rounded-full w-3 h-3"></div>
                                <h3 className="mb-2 font-semibold text-[15px] text-white">
                                    {fallbackTranslation(
                                        t(card.key_title),
                                        card.key_title,
                                        card.title
                                    )}
                                </h3>
                                <p className="text-sm text-white/70">
                                    {fallbackTranslation(
                                        t(card.key_desc, { brandName: BRAND_NAME }),
                                        card.key_desc,
                                        card.desc
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </MainContainer>
            </section>

            {/* FORM */}
            <section id="contact" className="bg-white px-6 lg:px-0 py-14 lg:py-20">
                <div className="mx-auto container">
                    <div className="mb-9 text-center">
                        <div className="mb-2.5 font-bold text-[#1a5fff] text-xs uppercase tracking-[0.1em]">
                            {fallbackTranslation(t('apply_now'), 'apply_now', 'Apply Now')}
                        </div>
                        <h2 className="pb-2 overflow-hidden font-bold text-3xl">
                            {fallbackTranslation(
                                t('join_affiliate_program'),
                                'join_affiliate_program',
                                'Join Our Affiliate Programme'
                            )}
                        </h2>
                        <p className="text-[15px] text-gray-600 leading-relaxed">
                            {fallbackTranslation(
                                t('form_description'),
                                'form_description',
                                'Fill in the form and an affiliate manager will be in touch within 1–2 business days.'
                            )}
                        </p>
                        <p className="mt-2.5 text-[13px] text-gray-400">
                            <strong className="text-gray-600">
                                {fallbackTranslation(
                                    t('please_note'),
                                    'please_note',
                                    'Please note'
                                )}
                                :
                            </strong>{' '}
                            {fallbackTranslation(
                                t('ppc_note', { brandName: BRAND_NAME }),
                                'ppc_note',
                                `if you run ppc campaigns, you may not use "${BRAND_NAME}" as a keyword or in ad copy.`
                            )}
                        </p>
                    </div>
                    <div className="bg-[#0b1d3a] shadow-[0_8px_32px_rgba(0,0,0,0.12)] mx-auto p-[16px] md:p-9 border border-[#1a3a6c] rounded-[20px] max-w-[640px]">
                        <AffiliateProgramForm />
                    </div>
                </div>
            </section>
        </main>
    );
}
