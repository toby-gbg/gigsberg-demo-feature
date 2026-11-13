import { ClassValue } from 'clsx';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxFloatingLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxOption,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/Combobox';

interface Props {
    label?: string;
    value: ComboboxOption<number>[] | null | undefined;
    onChange?: (payload: { label: string; value: number }[]) => void;
    options: { label: string; value: number }[];
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        label?: ClassValue;
        optionItem?: ClassValue;
        searchInput?: ClassValue;
    };
}

export default function SellTicketMultiSelectOption({
    label,
    value,
    options,
    classNames,
    onChange,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const anchorRef = useComboboxAnchor();
    const isValue = (value && value.length > 0) || false;
    return (
        <div className={cn('w-full', classNames?.wrapper)}>
            <Combobox
                locale={locale}
                multiple
                items={options}
                value={value}
                onValueChange={onChange}
                isItemEqualToValue={(item, selected) => item.value === selected.value}
            >
                {label && (
                    <ComboboxFloatingLabel isValue={isValue} className={cn(classNames?.label)}>
                        {label}
                    </ComboboxFloatingLabel>
                )}
                <ComboboxChips
                    ref={anchorRef}
                    className={cn('bg-zinc-100 min-h-13.5 pt-5 pb-1', classNames?.trigger)}
                >
                    <ComboboxValue>
                        {(
                            value: {
                                label: string;
                                value: number;
                            }[]
                        ) => (
                            <div className="pt-1 pl-2 pr-2 flex w-full min-w-0 flex-row flex-wrap gap-2">
                                {(value ?? []).map((option) => (
                                    <ComboboxChip
                                        key={option.value}
                                        aria-label={option.label}
                                        title={option.label}
                                        className="flex h-auto max-w-full min-w-0 items-start gap-1 rounded-md bg-white px-2 py-0.5 text-xs text-black whitespace-normal"
                                    >
                                        <span className="min-w-0 flex-1 leading-5 wrap-break-word">
                                            {option.label}
                                        </span>
                                    </ComboboxChip>
                                ))}
                            </div>
                        )}
                    </ComboboxValue>
                </ComboboxChips>

                <ComboboxContent anchor={anchorRef}>
                    <ComboboxInput
                        autoFocus
                        placeholder={fallbackTranslation(t('search'), 'search', 'Search')}
                        showTrigger={false}
                        showClear={false}
                        prefixIcon={<Search />}
                    />

                    <ComboboxList>
                        <ComboboxCollection>
                            {(option) => (
                                <ComboboxItem
                                    key={option.value}
                                    value={option}
                                    className={cn(
                                        'min-w-0 items-start overflow-hidden',
                                        classNames?.optionItem
                                    )}
                                >
                                    <span
                                        className="block min-w-0 flex-1 whitespace-normal wrap-break-word"
                                        title={option.label}
                                    >
                                        {option.label}
                                    </span>
                                </ComboboxItem>
                            )}
                        </ComboboxCollection>
                        <ComboboxEmpty>
                            {fallbackTranslation(t('no_data'), 'no_data', 'No data')}
                        </ComboboxEmpty>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
