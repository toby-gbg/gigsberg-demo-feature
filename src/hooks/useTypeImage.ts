'use client';

import { useParams } from 'next/navigation';

import { removeTicketsSuffix } from '@/utils/common';
import typeImages from '@/constants/typeImages';

const useTypeImage = (typeImage?: string): string | undefined => {
    const { type } = useParams<{ type: string }>();

    return typeImages[removeTicketsSuffix(typeImage ?? type)];
};

export default useTypeImage;
