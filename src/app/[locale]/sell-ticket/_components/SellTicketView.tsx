'use client';

import { useEffect, useState } from 'react';

import { CLICKED_STORAGE_KEY } from '../_constants/sellTicketsSeen';
import SellTicketSearchView from './SellTicketSearchView';
import SellTicketTutorial from './SellTicketTutorial';

interface SellStepperProps {
    hasListing: boolean;
}

export default function SellTicketView({ hasListing }: SellStepperProps) {
    const [showTutorial, setShowTutorial] = useState(!hasListing);

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowTutorial(false);
    };

    useEffect(() => {
        const clicked = localStorage.getItem(CLICKED_STORAGE_KEY) === 'true';
        if (clicked) handleNext();
    }, []);

    if (showTutorial) return <SellTicketTutorial onNextStep={handleNext} />;

    return <SellTicketSearchView />;
}
