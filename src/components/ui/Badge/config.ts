import type { LucideIcon } from 'lucide-react';
import {
    Eye,
    IdCard,
    PackageCheck,
    Rocket,
    ShieldCheck,
    SlidersHorizontal,
    TicketCheck,
} from 'lucide-react';

export type BadgeSetting =
    'price' | 'seat' | 'trust' | 'availability' | 'format' | 'restriction' | 'disabled';

export const BADGE_SETTINGS = [
    'price',
    'seat',
    'trust',
    'availability',
    'format',
    'restriction',
    'disabled',
] as const satisfies readonly BadgeSetting[];

export const BADGE_CONFIG_COLOR: Record<BadgeSetting, string> = {
    price: 'border-info-state-default bg-[rgba(21,112,239,0.1)] text-info-state-text',
    seat: 'border-[#d8b4fe] bg-[#f3e8ff] text-[#6b21a8]',
    trust: 'border-success-state-default bg-[rgba(3,152,85,0.1)] text-success-state-text',
    availability: 'border-warning-state-default bg-[rgba(220,104,3,0.1)] text-warning-state-text',
    format: 'border-[#38bdf8] bg-[#e0f2fe] text-[#0369a1]',
    restriction: 'border-[#fccd14] bg-[rgba(254,249,195,0.1)] text-[#854d0e]',
    disabled: 'border-neutral-500 bg-neutral-50 text-neutral-700',
};

export const BADGE_CONFIG_ICON: Record<BadgeSetting, LucideIcon> = {
    price: SlidersHorizontal,
    seat: Eye,
    trust: ShieldCheck,
    availability: Rocket,
    format: PackageCheck,
    restriction: IdCard,
    disabled: TicketCheck,
};
