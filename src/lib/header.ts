import rawPathnames from '@/constants/menus/pathname.json';

type Pathnames = Record<string, Partial<Record<string, string>>>;

const pathnames = rawPathnames as Pathnames;

export const isPathActive = (pathname: string, href: string, includeDescendants = true) => {
    if (!href) return false;

    return [href, ...Object.values(pathnames[href] ?? {})].some(
        (activePathname) =>
            pathname === activePathname ||
            (includeDescendants && pathname.startsWith(`${activePathname}/`))
    );
};
