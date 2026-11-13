import { atom } from 'nanostores';

import Listing from '@/interfaces/Listing';

export const $ticketListing = atom<Listing | null>(null);
export const $ticketDetailModal = atom<boolean>(false);
