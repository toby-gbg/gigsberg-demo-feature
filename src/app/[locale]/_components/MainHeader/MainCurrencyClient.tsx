// MainCurrencyClient.tsx
'use client';

import { FC, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { BProgress } from '@bprogress/core';
import parse from 'html-react-parser';

import Currency, { C } from '@/interfaces/Currency';
import { setRequestedCurrency } from '@/stores';
import { cn } from '@/lib/cn';
import { storeCurrencyInCookies } from '@/utils/cookies';

import Dropdown, { DropdownElementProps } from '@/components/Dropdown';

interface Props {
    mode?: 'burger' | 'normal';
    onClick?: () => void;
    mobileOnly?: boolean;
    currencies: C;
    currencyCode: string;
}

const MainCurrencyItem: FC<DropdownElementProps<Currency>> = ({
    code,
    symbol,
    onClick,
    initialCurrencyCode = 'USD',
}) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isSelected = code === initialCurrencyCode;

    const handleSelect = useCallback(() => {
        storeCurrencyInCookies(code);
        setRequestedCurrency(code);

        startTransition(() => {
            BProgress.start();
            router.refresh();
        });

        onClick?.();
    }, [code, onClick]);

    useEffect(() => {
        if (!isPending) BProgress.done();
    }, [isPending]);

    return (
        <button
            type="button"
            onClick={handleSelect}
            className={cn(
                'flex items-center gap-x-2 hover:bg-gray-200 p-1.5 rounded-lg w-full h-full hover:font-bold transition-all duration-150 cursor-pointer',
                { 'bg-gray-200 font-bold': isSelected }
            )}
        >
            <span className="text-xs">{parse(symbol)}</span>
            <span className="text-xs">{code}</span>
        </button>
    );
};

const MainCurrencyClient: FC<Props> = ({
    mode = 'normal',
    mobileOnly,
    onClick,
    currencies,
    currencyCode,
}) => {
    const currentCurrency = currencies?.[currencyCode];
    if (!currentCurrency) return null;

    const isBurger = mode === 'burger';

    return (
        <Dropdown<Currency>
            elements={Object.values(currencies ?? {})}
            symbol={parse(currentCurrency?.symbol ?? '').toString()}
            title={currentCurrency?.code ?? currencyCode}
            Element={MainCurrencyItem}
            containerClassName={cn('z-250 w-[54px]', { 'block xl:hidden': mobileOnly })}
            className="grid-cols-3 max-[375px]:grid-cols-2"
            controlledContentClassName="max-[375px]:w-55! max-[375px]:min-w-auto!"
            showArrow
            rightOrLeftMode
            trigger={isBurger ? 'click' : 'hover'}
            closeOnChoose
            onClick={onClick}
            hideValue
            isControlledSpacing
            initialCurrencyCode={currencyCode ?? 'USD'}
            toggleClassName="justify-end"
        />
    );
};

export default MainCurrencyClient;
