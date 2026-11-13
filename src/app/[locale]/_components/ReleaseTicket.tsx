'use client';

import { useCallback, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

import { Lead } from '@/interfaces/Lead';
import { useReleaseTicketMutation } from '@/swr/features/listings';

import useCookie from '@/hooks/useCookie';

const ReleaseTicket = () => {
    const segment = useSelectedLayoutSegment();
    const { trigger: releaseTicketMutation } = useReleaseTicketMutation();
    const { getEncryptedCookie } = useCookie<Lead>('USER_LEAD');

    const releaseTicket = useCallback(async () => {
        const lead = await getEncryptedCookie();
        if (lead?.id) releaseTicketMutation({ leadId: lead.id });
    }, [getEncryptedCookie, releaseTicketMutation]);

    useEffect(() => {
        const shouldReleaseTicket = !['thank-you', 'redirection'].includes(segment ?? '');
        if (shouldReleaseTicket) releaseTicket();
    }, [segment, releaseTicket]);

    return null;
};

export default ReleaseTicket;
