'use client';

import { useEffect, useRef, useState } from 'react';

import type { ComboboxOption } from '@/components/ui/Combobox';
import {
    Combobox,
    ComboboxContent,
    ComboboxGroup,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';

interface NavigationItem {
    id: string;
    title: string;
    secondary: boolean;
}

interface SideNavNavigationProps {
    navigationLabel: string;
    mobileLabel: string;
    secondaryGroupLabel?: string;
}

const SideNavNavigation = ({
    navigationLabel,
    mobileLabel,
    secondaryGroupLabel,
}: SideNavNavigationProps) => {
    const [items, setItems] = useState<NavigationItem[]>([]);
    const [activeId, setActiveId] = useState('');
    const navigationRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const headings = Array.from(
            document.querySelectorAll<HTMLHeadingElement>('#legal-document h2[data-legal-heading]')
        );
        const navigationItems = headings.flatMap((heading) => {
            const secondary = Boolean(heading.closest('[data-legal-group="secondary"]'));
            const sectionNumber = heading.textContent?.trim().match(/^\d+/)?.[0];

            if (secondary && !sectionNumber) return [];
            if (secondary) heading.id = `seller-policy-${sectionNumber}`;

            return {
                id: heading.id,
                title: heading.textContent?.trim() ?? '',
                secondary,
            };
        });

        setItems(navigationItems);
        setActiveId(navigationItems[0]?.id ?? '');

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

                if (visible) setActiveId(visible.target.id);
            },
            { rootMargin: '-90px 0px -65% 0px', threshold: 0.01 }
        );

        headings.forEach((heading) => observer.observe(heading));

        if (window.location.hash) {
            requestAnimationFrame(() =>
                document.querySelector(window.location.hash)?.scrollIntoView()
            );
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        navigationRef.current
            ?.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [activeId]);

    const navigate = (id: string) => {
        window.history.replaceState(null, '', `#${id}`);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const firstSecondaryItem = items.findIndex((item) => item.secondary);
    const primaryOptions: ComboboxOption<string>[] = items
        .filter((item) => !item.secondary)
        .map((item) => ({ value: item.id, label: item.title }));
    const secondaryOptions: ComboboxOption<string>[] = items
        .filter((item) => item.secondary)
        .map((item) => ({ value: item.id, label: item.title }));
    const options = [...primaryOptions, ...secondaryOptions];
    const selectedOption = options.find((option) => option.value === activeId) ?? null;
    const showSecondaryGroup = Boolean(secondaryGroupLabel && secondaryOptions.length);

    return (
        <>
            <div className="mb-5 lg:hidden">
                <label id="legal-section-label" className="mb-2 block text-sm font-semibold">
                    {mobileLabel}
                </label>
                <Combobox
                    items={options}
                    value={selectedOption}
                    onValueChange={(option) => option && navigate(option.value)}
                >
                    <ComboboxTrigger
                        aria-labelledby="legal-section-label"
                        className="justify-between"
                    >
                        <ComboboxValue placeholder={mobileLabel} />
                    </ComboboxTrigger>
                    <ComboboxContent>
                        <ComboboxList>
                            <ComboboxGroup>
                                <ComboboxLabel>{navigationLabel}</ComboboxLabel>
                                {primaryOptions.map((option) => (
                                    <ComboboxItem key={option.value} value={option}>
                                        {option.label}
                                    </ComboboxItem>
                                ))}
                            </ComboboxGroup>
                            {showSecondaryGroup && (
                                <ComboboxGroup>
                                    <ComboboxLabel>{secondaryGroupLabel}</ComboboxLabel>
                                    {secondaryOptions.map((option) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    ))}
                                </ComboboxGroup>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>

            <aside
                ref={navigationRef}
                className="sticky top-4 hidden max-h-[calc(100svh-3rem)] overflow-auto lg:block"
            >
                <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
                    {navigationLabel}
                </p>
                <ol>
                    {items.map((item, index) => (
                        <li key={item.id}>
                            {secondaryGroupLabel && index === firstSecondaryItem && (
                                <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    {secondaryGroupLabel}
                                </p>
                            )}
                            <a
                                href={`#${item.id}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigate(item.id);
                                }}
                                className={`block border-l-2 px-3 py-2 text-sm leading-5 transition-colors ${
                                    activeId === item.id
                                        ? 'border-main-end bg-main-start/5 font-semibold text-main-end'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-950'
                                }`}
                            >
                                {item.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </aside>
        </>
    );
};

export default SideNavNavigation;
