import { atom } from 'nanostores';

import { EventTicket } from '@/interfaces/Event';

export const $eventNotifyMeModal = atom<boolean>(false);
export const $eventNotifiyMe = atom<EventTicket | null>(null);
