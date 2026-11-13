import { useTranslations } from 'next-intl';

import type Address from '@/interfaces/Address';

import type { FloatingSelectOption } from '@/components/FloatingSelect';

export function AddressSelectLabel({
    option,
    addresses,
}: {
    option: FloatingSelectOption;
    addresses: Address[];
}) {
    const t = useTranslations();

    const address = addresses.find((a) => String(a.id) === String(option.value));
    const isDefault = Boolean(address?.isDefault);

    return (
        <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <span className="min-w-0 flex-1 break-words whitespace-normal leading-4">
                {option.label}
            </span>

            {isDefault && (
                <span className="inline-flex shrink-0 items-center justify-center self-center rounded-sm border border-gray-400 px-2 py-1 text-[10px] font-medium text-gray-500">
                    {t('default', { gender: 'female' })}
                </span>
            )}
        </div>
    );
}
