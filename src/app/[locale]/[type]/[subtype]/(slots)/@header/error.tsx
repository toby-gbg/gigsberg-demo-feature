'use client';

import EventSectionError from '@/components/EventSectionError';
import MainContainer from '@/components/MainContainer';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Error() {
    return (
        <EventSectionError shouldShowErrorMessage>
            <div className="w-full bg-gray-300 h-45">
                <MainContainer>
                    <div className="relative flex flex-col justify-between py-7 lg:py-10">
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-50" />
                            <Skeleton className="h-6 w-100" />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </EventSectionError>
    );
}
