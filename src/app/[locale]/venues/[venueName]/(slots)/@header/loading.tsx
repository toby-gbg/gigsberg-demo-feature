import Image from 'next/image';

import SectionOverlay from '@/assets/img/Section_Overlay.png';

import MainContainer from '@/components/MainContainer';
import SocialLinks from '@/components/SocialLinks';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VenueHeaderLoading() {
    return (
        <section>
            <div className="relative flex flex-col bg-header-start text-on-header border-y border-gray-500/50">
                <Image
                    src={SectionOverlay}
                    alt="Background"
                    fill
                    sizes="100vw"
                    className="opacity-25 object-center object-cover mix-blend-hard-light"
                    priority
                />
                <MainContainer>
                    <div className="relative flex flex-col justify-between py-7 lg:py-10">
                        <div className="flex justify-between items-end w-full">
                            <div className="w-full flex flex-col gap-2">
                                <Skeleton className="h-12 2xl:h-14 w-full max-w-xl rounded-lg" />
                                <Skeleton className="h-5 xl:h-6 w-full max-w-3xl rounded-lg" />
                            </div>
                            <SocialLinks className="hidden md:flex text-on-header" />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </section>
    );
}
