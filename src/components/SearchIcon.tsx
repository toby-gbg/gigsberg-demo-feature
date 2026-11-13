'use client';

import { FC } from 'react';
import { ClassValue } from 'clsx';
import { Building, Building2, CalendarCheck, Mic, Trophy } from 'lucide-react';

import { cn } from '@/lib/cn';

interface SearchIconProps {
    label?: string;
    className?: ClassValue;
}

const iconMap = {
    performers: Mic,
    cities: Building2,
    venues: Building,
    tours: Trophy,
    events: CalendarCheck,
} as const;

const SearchIcon: FC<SearchIconProps> = ({ label, className }) => {
    const IconComponent = iconMap[label as keyof typeof iconMap];

    if (!IconComponent) return null;

    return (
        <IconComponent className={cn('mb-1 text-white ltr:mr-px rtl:ml-px', className)} size={20} />
    );
};

export default SearchIcon;
