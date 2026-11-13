import { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface Props {
    children: ReactNode;
}

export default function DropdownWrapper({ children }: Props) {
    const t = useTranslations();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('actions')}
                className={buttonVariants({ isIconOnly: true, variant: 'ghost' })}
            >
                <MoreVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-1000 w-64 min-w-64">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
