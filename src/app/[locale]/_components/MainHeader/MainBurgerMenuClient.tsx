'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@nanostores/react';
import { Menu, X } from 'lucide-react';

import { $isOpenMobileMenu, toggleMobileMenu } from '@/stores/modal';
import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';

import Link from '@/components/Link';

import MainLinks from './MainLinks';
import MainMenu from './MainMenu';

const MainBurgerMenuClient = () => {
    const isOpen = useStore($isOpenMobileMenu);
    const logo = useSite().website?.logo ?? '';

    const lockBody = () => {
        setTimeout(() => {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        }, 350);
    };
    const openBody = () => {
        setTimeout(() => {
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        }, 350);
    };

    useEffect(() => {
        if (isOpen) lockBody();
        else openBody();
    }, [isOpen]);

    const openMenu = () => toggleMobileMenu(true);
    const closeMenu = () => toggleMobileMenu(false);

    return (
        <div data-ddv-hide-during-fullscreen className="relative z-998! block xl:hidden">
            <button
                onClick={openMenu}
                className="p-2 text-on-header"
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
            >
                <Menu size={32} aria-hidden="true" />
            </button>

            <div
                className={cn('fixed inset-0 z-1000', !isOpen && 'pointer-events-none')}
                aria-hidden={!isOpen}
                inert={!isOpen}
            >
                <div
                    className={cn(
                        'absolute inset-0 bg-black/50 transition-opacity duration-300',
                        isOpen ? 'opacity-100' : 'opacity-0'
                    )}
                    onClick={closeMenu}
                />

                <div
                    id="mobile-menu"
                    role="navigation"
                    aria-label="Mobile navigation"
                    className={cn(
                        'fixed top-0 z-50 flex h-dvh w-[min(100%,19.5rem)] flex-col overflow-hidden border-r border-black/10 bg-header shadow-xl',
                        'ltr:left-0 rtl:right-0',
                        'transition-transform duration-300',
                        isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
                    )}
                >
                    <div className="px-4">
                        <div className="py-6 flex items-center justify-between border-b border-on-header">
                            <Link prefetch={false} href="/" onClick={closeMenu}>
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    width={140}
                                    height={40}
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                            <button
                                onClick={closeMenu}
                                aria-label="Close navigation menu"
                                className="rounded-full p-2 text-on-header transition hover:bg-on-header/10"
                            >
                                <X size={24} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* TODO: Wait for confirmation from Noa
                      <div className="px-4 pt-2 pb-3">
                        <HeaderSearchBar inDrawer />
                    </div>*/}

                    <div className="mt-2 flex min-h-0 flex-1 flex-col rounded-t-lg px-3 pt-1 pb-6">
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <MainMenu mode="burger" />
                        </div>
                        <MainLinks />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainBurgerMenuClient;
