'use client';

import { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

const HeaderSegmentCheck = ({ children }: { children: ReactNode }) => {
    const segment = useSelectedLayoutSegment();
    if (segment === 'checkout' || segment === 'redirection') return null;
    return children;
};

export default HeaderSegmentCheck;
