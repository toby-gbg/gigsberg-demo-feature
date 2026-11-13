import { Suspense } from 'react';
import { ChevronDown } from 'lucide-react';

import type Website from '@/interfaces/Website';

import HeaderHelp from './HeaderHelp';
import HeaderLogin from './HeaderLogin';
import HeaderSegmentCheck from './HeaderSegmentCheck';
import MainBurgerMenu from './MainBurgerMenu';
import MainCountry from './MainCountry';
import MainCTA from './MainCTA';
import MainCurrency from './MainCurrency';
import MainLogo from './MainLogo';
import MainMenu from './MainMenu';
import MainSearch from './MainSearch';

const MainHeader = ({ website }: { website?: Website | null }) => {
    return (
        <HeaderSegmentCheck>
            <header className="flex flex-col bg-header text-white text-sm">
                <div className="flex justify-between items-center gap-4 mx-auto xl:p-2 min-[1475px]:px-2 xl:px-5 w-full max-w-screen min-[1475px]:max-w-384 min-[1920px]:max-w-450 min-[2560px]:max-w-600">
                    <div className="flex xl:flex-row flex-col items-center gap-0 xl:gap-4 pt-2 xl:pt-0 w-full xl:w-auto">
                        <div className="flex justify-between items-center px-2 xl:px-0 w-full">
                            <MainBurgerMenu />
                            <MainLogo />

                            <div
                                data-ddv-hide-during-fullscreen
                                className="z-100 flex flex-col justify-end items-end gap-1.5"
                            >
                                <Suspense
                                    fallback={
                                        <div className="xl:hidden flex justify-center items-center mt-auto h-6">
                                            <ChevronDown size={16} />
                                        </div>
                                    }
                                >
                                    <MainCurrency mobileOnly mode="burger" />
                                </Suspense>

                                <Suspense
                                    fallback={
                                        <div className="xl:hidden flex justify-center items-center h-4">
                                            <ChevronDown size={16} />
                                        </div>
                                    }
                                >
                                    <MainCountry mobileOnly mode="burger" website={website} />
                                </Suspense>
                            </div>
                        </div>
                        <MainSearch />
                        <MainMenu />
                    </div>

                    <div className="hidden xl:flex items-center gap-2">
                        <HeaderLogin />

                        <div className="flex items-center gap-2 mx-2 w-44.5 shrink-0">
                            <Suspense
                                fallback={
                                    <div className="flex items-center gap-1.5 w-14 h-6">
                                        <div className="w-7.75 h-full"></div>
                                        <ChevronDown size={16} />
                                    </div>
                                }
                            >
                                <MainCurrency />
                            </Suspense>

                            <Suspense
                                fallback={
                                    <div className="flex items-center gap-1.5 w-10.5 h-4">
                                        <div className="w-5! h-full"></div>
                                        <ChevronDown size={16} />
                                    </div>
                                }
                            >
                                <MainCountry website={website} />
                            </Suspense>

                            <HeaderHelp />
                        </div>

                        <MainCTA />
                    </div>
                </div>
            </header>
        </HeaderSegmentCheck>
    );
};

export default MainHeader;
