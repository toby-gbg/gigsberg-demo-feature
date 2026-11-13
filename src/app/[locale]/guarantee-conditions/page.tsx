import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/guarantee-conditions'>): Promise<Metadata> {
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'guarantee-conditions' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || 'Guarantee Conditions | Gigsberg',
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function GuaranteeConditions() {
    const t = await getTranslations();
    return (
        <div className="py-10 px-4 sm:px-6 lg:px-20">
            <div className="text-sm text-gray-700 space-y-4">
                <p>
                    {t('guarantee_line_1')}
                    <br />- {t('guarantee_bullet_1')}
                    <br />- {t('guarantee_bullet_2')}
                    <br />- {t('guarantee_bullet_3')}
                </p>
                <p>
                    {t('guarantee_line_2')}
                    <br />
                    Gigsberg GmbH, Gewerbestrasse 5, CH 6330 Cham,
                    <br />
                    <a href="mailto:support@gigsberg.com" className="text-blue-600">
                        support@gigsberg.com
                    </a>{' '}
                    <br />
                    WhatsApp:{' '}
                    <a
                        href="https://wa.me/16316869478"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        +1 631 686 9478
                    </a>
                </p>
                <p>
                    {t('guarantee_line_3')}{' '}
                    <a href="mailto:support@gigsberg.com" className="text-blue-600">
                        support@gigsberg.com
                    </a>{' '}
                    {t('guarantee_line_4')}
                </p>
                <p>{t('guarantee_line_5')}</p>
                <p>{t('guarantee_line_6')}</p>
            </div>
        </div>
    );
}
