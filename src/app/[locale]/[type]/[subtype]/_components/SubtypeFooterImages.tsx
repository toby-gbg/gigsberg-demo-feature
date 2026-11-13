'use client';

import { EventTicket } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';
import Slide from '@/interfaces/HpSlide';
import PopularPerformer from '@/interfaces/Performer';

import useFooterImages from '@/hooks/useFooterImages';

interface SubtypeFooterImagesProps {
    slides?: Slide[];
    events: Pagination<EventTicket>;
    performers: PopularPerformer[];
}

const SubtypeFooterImages = ({ slides, events, performers }: SubtypeFooterImagesProps) => {
    useFooterImages({ slides, events, performers, clearOnUnmount: false });

    return null;
};

export default SubtypeFooterImages;
