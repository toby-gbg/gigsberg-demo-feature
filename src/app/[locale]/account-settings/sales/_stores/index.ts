import { atom } from 'nanostores';

import AccountSettingOrder from '@/interfaces/account-settings/AccountSettingOrder';

export const $selectedTicket = atom<AccountSettingOrder | null>(null);
export const $uploadTicketModal = atom<boolean>(false);
