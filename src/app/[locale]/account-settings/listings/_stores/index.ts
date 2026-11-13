import { atom } from 'nanostores';

import { AccountSettingListing } from '@/interfaces/Listing';

export const $editListingModal = atom<boolean>(false);
export const $editListing = atom<AccountSettingListing | null>(null);

export const $deleteListingModal = atom<boolean>(false);
export const $deleteListing = atom<AccountSettingListing | null>(null);
