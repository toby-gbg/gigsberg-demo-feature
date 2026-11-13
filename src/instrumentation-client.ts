// Chrome on iPhone skips "back" over history entries that were not created during a tap.
// Next.js creates the entry only after the new page has loaded. So we create it during the tap,
// and when Next.js later adds its own entry, we overwrite ours instead of adding a second one.

const TAP_ENTRY = '__gbTapEntry';
const nativePush = window.history.pushState.bind(window.history);
const nativeReplace = window.history.replaceState.bind(window.history);

const onTapEntry = () => window.history.state?.[TAP_ENTRY] === true;

// This file runs before Next.js starts, so Next.js's own history calls go through here.
window.history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
    if (onTapEntry()) return nativeReplace(data, unused, url); // page finished loading (or was redirected): reuse our entry
    return nativePush(data, unused, url);
};

export function onRouterTransitionStart(
    url: string,
    navigationType: 'push' | 'replace' | 'traverse'
) {
    if (navigationType !== 'push') return;
    const target = new URL(url, window.location.href);
    if (target.origin !== window.location.origin || target.href === window.location.href) return;
    // Deliberately no Next.js data here: if a user ever lands on this entry, Next.js reloads the page.
    const state = { [TAP_ENTRY]: true };
    if (onTapEntry())
        nativeReplace(state, '', target.href); // second tap before the first page loaded
    else nativePush(state, '', target.href);
}
