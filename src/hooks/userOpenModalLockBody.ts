import { useEffect, useRef } from 'react';

type Options = {
    isModalOpen: boolean;
};

export function useOpenModalLockBody({ isModalOpen }: Options) {
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (!isModalOpen) return;

        // capture scroll position *immediately*
        scrollYRef.current = window.scrollY;

        const body = document.body;
        const html = document.documentElement;

        // lock everything right away
        body.style.position = 'fixed';
        body.style.top = `-${scrollYRef.current}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
        body.style.overflow = 'hidden';

        // extra safety for iOS / some Android browsers
        html.style.overflow = 'hidden';
        html.style.height = '100%';

        // cleanup when modal closes or component unmounts
        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.width = '';
            body.style.overflow = '';

            html.style.overflow = '';
            html.style.height = '';

            // restore exact scroll position
            window.scrollTo({
                top: scrollYRef.current,
                left: 0,
                behavior: 'instant', // to make it immediate
            });
        };
    }, [isModalOpen]);
}
