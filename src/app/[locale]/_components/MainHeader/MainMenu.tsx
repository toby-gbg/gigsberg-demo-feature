'use client';

import { useMemo, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { toggleMobileMenu } from '@/stores/modal';
import { cn } from '@/lib/cn';
import { isPathActive } from '@/lib/header';
import { fallbackTranslation } from '@/utils/common';
import { HeaderMenu } from '@/constants/menus';
import defaultMenu from '@/constants/menus/default';

import { useSite } from '@/providers/SiteProvider';

import Link from '@/components/Link';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/Accordion';

interface HeaderMenuNavigationProps {
    mode?: 'burger' | 'normal';
}

type MenuItem = {
    name: string;
    href: string;
};

const MainMenuMobileItem = ({ href, name, parentHref }: MenuItem & { parentHref: string }) => {
    const t = useTranslations();
    const pathname = usePathname();
    const active = isPathActive(pathname, href, href !== parentHref);

    if (!href) return <span className="block px-3 py-3 text-sm text-on-header">{t(name)}</span>;

    return (
        <Link
            prefetch={false}
            href={href}
            onClick={() => toggleMobileMenu(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'relative flex items-center rounded-2xl px-3 py-3 text-sm transition',
                active ? 'text-on-header' : 'text-on-header hover:bg-on-header/10'
            )}
        >
            {active && (
                <span
                    className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-on-header ltr:left-3 rtl:right-3"
                    aria-hidden="true"
                />
            )}
            <span className={cn('truncate ltr:pl-4 rtl:pr-4')}>{t(name)}</span>
        </Link>
    );
};

const MainMenuDesktopItem = ({
    item,
    pathname,
}: {
    item: HeaderMenu[number];
    pathname: string;
}) => {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const active =
        isPathActive(pathname, item.href, false) ||
        item.subMenu.some(({ href }) => isPathActive(pathname, href, href !== item.href));

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => setIsOpen(true)}
            onBlur={(event) =>
                !event.currentTarget.contains(event.relatedTarget) && setIsOpen(false)
            }
        >
            <Link
                prefetch={false}
                href={item.href}
                aria-expanded={item.subMenu.length > 0 ? isOpen : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                    'relative flex cursor-pointer items-center gap-x-1 text-sm text-on-header transition-all max-[1475px]:gap-x-0.5 max-[1475px]:text-xs',
                    active &&
                        'after:absolute after:-right-1 after:-bottom-1 after:-left-1 after:h-0.75 after:rounded-full after:bg-[rgb(var(--main-gradient-end))] max-[1475px]:after:h-0.5'
                )}
            >
                <span className="capitalize">
                    {fallbackTranslation(t(item.name), item.name, item.name)}
                </span>
            </Link>

            {item.subMenu.length > 0 && (
                <div
                    className={cn(
                        'absolute top-full z-60 w-72 rounded-md bg-white py-2 shadow-xl transition ltr:left-0 rtl:right-0 max-[1475px]:w-56',
                        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                    )}
                >
                    {item.subMenu.map((subItem) => {
                        const subItemActive = isPathActive(
                            pathname,
                            subItem.href,
                            subItem.href !== item.href
                        );

                        return (
                            <Link
                                key={`${subItem.name}-${subItem.href}`}
                                prefetch={false}
                                href={subItem.href}
                                aria-current={subItemActive ? 'page' : undefined}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    'relative flex min-h-10 w-full items-center justify-start py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950 ltr:pr-5 ltr:pl-9 ltr:text-left rtl:pr-9 rtl:pl-5 rtl:text-right max-[1475px]:min-h-4 max-[1475px]:text-xs max-[1475px]:ltr:pl-6 max-[1475px]:rtl:pr-6',
                                    subItemActive &&
                                        'font-medium text-zinc-950 before:absolute before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[rgb(var(--main-gradient-end))] ltr:before:left-4 rtl:before:right-4 max-[1475px]:ltr:before:left-3 max-[1475px]:rtl:before:right-3'
                                )}
                            >
                                {fallbackTranslation(t(subItem.name), subItem.name, subItem.name)}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const MainMenuMobile = ({ menuItems }: { menuItems: HeaderMenu }) => {
    const t = useTranslations();
    const pathname = usePathname();
    const defaultExpandedKeys = useMemo(
        () =>
            menuItems
                .map(({ href, name, subMenu }, index) =>
                    isPathActive(pathname, href) ||
                    subMenu.some((item) => isPathActive(pathname, item.href))
                        ? `menu-type-${name}-${index}`
                        : null
                )
                .filter((key): key is string => Boolean(key)),
        [menuItems, pathname]
    );

    return (
        <nav className="mb-5 w-full" aria-label="Mobile navigation menu">
            <Accordion
                className="w-full gap-1 overflow-visible border-none bg-transparent p-0 shadow-none"
                defaultValue={defaultExpandedKeys}
                multiple
            >
                {menuItems.map(({ href, name, subMenu }, index) => {
                    const itemId = `menu-type-${name}-${index}`;

                    return (
                        <AccordionItem
                            key={itemId}
                            value={itemId}
                            aria-label={t(name)}
                            className="w-full border-none bg-transparent px-0 py-0 shadow-none"
                        >
                            <AccordionTrigger className="h-auto min-h-0 w-full rounded-lg px-3 py-3 text-left text-sm font-normal text-on-header hover:bg-on-header/10 aria-expanded:bg-on-header/5 [&>svg]:hidden">
                                <span className="min-w-0 truncate capitalize">{t(name)}</span>
                                <ChevronDown className="size-4 rotate-0 text-on-header transition-transform group-aria-expanded/accordion-trigger:rotate-180" />
                            </AccordionTrigger>
                            <AccordionContent className="px-0 pt-0 pb-1">
                                <div className="flex flex-col gap-1 rounded-2xl p-1">
                                    {subMenu.map((item) => (
                                        <MainMenuMobileItem
                                            key={`${name}-${item.name}-${item.href}`}
                                            {...item}
                                            parentHref={href}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </nav>
    );
};

const MainMenu = ({ mode = 'normal' }: HeaderMenuNavigationProps) => {
    const { config } = useSite().domainInfo || {};
    const pathname = usePathname();

    const isBurger = mode === 'burger';
    const menuItems: HeaderMenu = config?.features?.headerMenu ?? defaultMenu;

    if (isBurger) return <MainMenuMobile menuItems={menuItems} />;

    return (
        <div className="hidden shrink-0 xl:block">
            <nav className="container mx-auto flex justify-center gap-4 min-[1475px]:gap-6">
                {menuItems.map((item) => (
                    <MainMenuDesktopItem key={item.name} item={item} pathname={pathname} />
                ))}
            </nav>
        </div>
    );
};

export default MainMenu;
