import { useTranslations } from 'next-intl';

import Link from '@/components/Link';

import { useCheckoutData } from '../_providers/CheckoutDataProvider';

interface Props {
    content: string;
}

export default function CheckoutTerm({ content }: Props) {
    const t = useTranslations();
    const { website } = useCheckoutData();
    const name = website?.name ?? '';

    return (
        <p className="font-medium text-gray-600 text-xs text-center">
            <span>{content}</span>,{' '}
            {t.rich('agree_to_term_policy', {
                name,
                term: (chunks) => (
                    <Link
                        prefetch={false}
                        href="/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-1 text-blue-600 underline whitespace-nowrap"
                    >
                        {chunks}
                    </Link>
                ),
                policy: (chunks) => (
                    <Link
                        prefetch={false}
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rtl:mr-1 ltr:ml-1 text-blue-600 underline whitespace-nowrap"
                    >
                        {chunks}
                    </Link>
                ),
            })}
        </p>
    );
}
