'use client';

import { FC, useEffect, useState } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';
import { ChevronsUp } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Button } from '@/components/ui/Button';

const ScrollToTopButton: FC = () => {
    const segments = useSelectedLayoutSegments();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 300);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Button
            data-ddv-hide-during-fullscreen // When fullscreen in 3D Map of Digita Venue is enable ==> Css will take this dataset to set display: none
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
                'fixed bottom-4 left-4 z-50 h-[50px] w-[50px] rounded-full! bg-black text-xl text-white md:bottom-20 max-md:[body:has([data-mobile-bottom-control])_&]:bottom-20',
                {
                    'visible opacity-100': isVisible,
                    'invisible opacity-0': !isVisible,
                }
            )}
            style={{
                ...(segments[3]?.includes('show-') && {
                    bottom: 80,
                }),
            }}
        >
            <ChevronsUp size={24} />
        </Button>
    );
};

export default ScrollToTopButton;
