'use client';

import { usePathname, useSearchParams, useSelectedLayoutSegments } from 'next/navigation';
import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Route from '@/interfaces/Route';
import { toggleMobileMenu } from '@/stores/modal';
import { cn } from '@/lib/cn';
import { splitText } from '@/utils/common';
import PROFILE_ROUTES from '@/constants/routes/profile';

import { useSite } from '@/providers/SiteProvider';
import { useUser, useUserActions } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import Dropdown, { DropdownElementProps } from '@/components/Dropdown';
import Link from '@/components/Link';
import { toast } from '@/components/ui/Toast';

interface HeaderLoginProps {
    mode?: 'burger' | 'normal';
}

const HeaderLoginElement = ({ action, icon, url, onClick }: DropdownElementProps<Route>) => {
    const t = useTranslations();
    const [segment] = useSelectedLayoutSegments();
    const router = useIntlRouter();
    const { resetCredentials } = useUserActions();

    const handleClick = () => {
        // WLB-3226: Close the mobile menu and dropdown before navigating or logging out.
        toggleMobileMenu(false);
        onClick?.();

        if (action === 'logout') {
            resetCredentials();
            toast.add({ title: t('logout_success'), type: 'success' });
            // Extra-information opens its own login modal and returns to the same URL.
            const onExtraInformation = window.location.pathname.includes(
                '/edit-order/extra-information'
            );
            if (
                !onExtraInformation &&
                (segment === 'account-settings' || segment === 'sell-ticket')
            ) {
                router.push('/');
            }
        } else if (url) {
            router.push(url);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-x-2 hover:bg-gray-200 p-2 rounded-lg w-full hover:font-bold hover:text-black! transition shrink-0"
        >
            <span className="text-xs">{icon}</span>
            <span className="text-xs text-nowrap">{t(action)}</span>
        </button>
    );
};

const HeaderLogin = ({ mode = 'normal' }: HeaderLoginProps) => {
    const t = useTranslations();
    const domainInfo = useSite().domainInfo;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams.toString();

    const user = useUser();

    const filteredProfileRoutes = PROFILE_ROUTES.filter((item) => {
        if (item.scope === 'seller' && domainInfo?.config.features?.disableTicketSelling) {
            return false;
        }
        return true;
    });

    if (user) {
        return (
            <Dropdown<Route>
                title={splitText(user.first_name || user.fullname)}
                elements={filteredProfileRoutes}
                Element={HeaderLoginElement}
                containerClassName="z-270"
                className={'z-350 w-35!'}
                controlledContentClassName={cn('min-w-auto!', {
                    'bottom-[110%]! shadow-sm': mode === 'burger',
                })}
                Icon={User}
                trigger={mode === 'normal' ? 'hover' : 'click'}
                rightOrLeftMode={false}
                closeOnChoose
                isControlledSpacing
            />
        );
    }

    const currentPath = search ? `${pathname}?${search}` : pathname;

    return (
        <Link
            href={
                `/login` +
                (pathname !== '/' && pathname !== '/login'
                    ? `?redirectUrl=${encodeURIComponent(currentPath)}`
                    : '')
            }
            className="flex items-center gap-x-1.5 text-on-header text-xs min-[1475px]:text-sm hover:underline"
            onClick={() => {
                toggleMobileMenu(false);
            }}
        >
            <User size={16} />
            <span className="text-nowrap">{t('login_create_account')}</span>
        </Link>
    );
};

export default HeaderLogin;
