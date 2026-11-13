import { atom } from 'nanostores';

// Authentication
export const $downloadAppModal = atom<boolean>(false);

// Checkout
export const $addAddressModal = atom<boolean>(false);
export const $guaranteeModal = atom<boolean>(false);

// International Event
export const $internationalEventModal = atom<boolean>(false);
export const $internationalEventUrl = atom<string | null>(null);

// Account Settings
export const $defaultAddressModal = atom<boolean>(false);

// Mobile Menu
export const $isOpenMobileMenu = atom<boolean>(false);

// setters
export const toggleMobileMenu = (open: boolean = true) => $isOpenMobileMenu.set(open);
export const toggleDownloadAppModal = (open: boolean = true) => $downloadAppModal.set(open);
