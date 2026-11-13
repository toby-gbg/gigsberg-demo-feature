import type Website from '@/interfaces/Website';

export const getIsGradient = (
    website: Pick<Website, 'main_gradient_start' | 'main_gradient_end'> | null | undefined
): boolean => !!website && website.main_gradient_start !== website.main_gradient_end;
