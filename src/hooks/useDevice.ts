import { useEffect, useState } from 'react';

export function useDeviceType() {
    const [deviceType, setDeviceType] = useState(getDeviceType());

    function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
        if (typeof window === 'undefined') return 'desktop'; // default for SSR
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    useEffect(() => {
        const handleResize = () => setDeviceType(getDeviceType());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
}
