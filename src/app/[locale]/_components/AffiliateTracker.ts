'use client';

import { FC, useEffect } from 'react';

import { useCheckAffiliateMutation } from '@/swr/features/affiliate';

interface AffiliateTrackerProps {
    referer?: string;
}

const AffiliateTracker: FC<AffiliateTrackerProps> = ({ referer }) => {
    const { trigger: checkAffiliate, error } = useCheckAffiliateMutation();

    useEffect(() => {
        const url = window.location.href;

        console.log('Current URL:', url);
        console.log('Original Referrer:', referer); // Should show ticketmaster.com

        checkAffiliate({ url, referer });
    }, [checkAffiliate]);

    if (error) console.error('Affiliate tracking failed:', error);

    return null;
};

export default AffiliateTracker;
