const protectedRoutes: string[] = ['/account-settings', '/sell-ticket'];

/** Token-gated email links under /account-settings that must stay public. */
export const publicAccountSettingsRoutes: string[] = [
    '/account-settings/accept-offer',
    '/account-settings/reject-offer',
];

export function isProtectedPath(pathname: string): boolean {
    if (publicAccountSettingsRoutes.some((route) => pathname.includes(route))) {
        return false;
    }

    return protectedRoutes.some((route) => pathname.includes(route));
}

export default protectedRoutes;
