'use client';

import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';

import { $footerCredits } from '@/stores';
import { fallbackTranslation } from '@/utils/common';
import { deduplicateCredits, filterValidCredits } from '@/utils/footer.util';

import Link from '@/components/Link';

const ImageLicenses = () => {
    const t = useTranslations();
    const footerCredits = useStore($footerCredits);
    const credits = deduplicateCredits(filterValidCredits(footerCredits));

    if (!credits || credits.length === 0) return null;

    return (
        <div className="text-caption text-on-header text-center text-xs break-all wrap-break-word">
            {fallbackTranslation(t('images_used_under'), 'images_used_under', 'Images used under')}{' '}
            <a
                className="hover:underline"
                target="_blank"
                href="https://creativecommons.org/licenses/by/4.0/"
            >
                CC license
            </a>
            :{' '}
            <div className="inline">
                {credits.map((credit, index) => (
                    <span key={index}>
                        {credit.imageCredits && credit.imageSource && (
                            <Link
                                href={credit.imageSource}
                                className="hover:underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {credit.imageCredits || 'Unknown'}
                            </Link>
                        )}

                        {index < credits.length - 1 && ', '}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ImageLicenses;
