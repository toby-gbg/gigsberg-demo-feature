import { ReactNode } from 'react';

export type FAQCategory = {
    title: string | ReactNode;
    elements: FAQ[];
};

export type FAQ = {
    question: string | ReactNode;
    answer: string | ReactNode;
};
