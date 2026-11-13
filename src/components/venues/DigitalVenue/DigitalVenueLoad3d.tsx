import classNames from 'classnames';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useDigitalVenue } from '@/providers/DigitalVenueProvider';

import { Button } from '@/components/ui/Button';

interface Props {
    isViewer3dLoaded: boolean;
    isViewer3dOpen: boolean;
    isViewer3dFullscreen: boolean;
    closeViewer3dModal: () => void;
}

export const DigitalVenueLoad3D = ({
    isViewer3dLoaded,
    isViewer3dOpen,
    isViewer3dFullscreen,
    closeViewer3dModal,
}: Props) => {
    const t = useTranslations();
    const { errorMessage, viewer3dContainerId, status } = useDigitalVenue();
    const isViewer3dUnavailable = status === 'unavailable';
    const isViewer3dError = status === 'error';
    const showViewer3dFeedback = isViewer3dOpen && !isViewer3dLoaded;
    return (
        <div
            data-ddv-viewer-open={isViewer3dOpen}
            onClick={(event) => {
                if (event.target === event.currentTarget) closeViewer3dModal();
            }}
            className={classNames(
                'bg-opacity-50 flex items-center justify-center overflow-y-auto bg-gray-800 backdrop-blur-sm transition-all duration-300',
                {
                    'fixed inset-0 z-1000 h-[100dvh] w-screen rounded-none bg-black':
                        isViewer3dFullscreen,
                    'absolute inset-0 z-[100]': !isViewer3dFullscreen,
                    'pointer-events-auto visible opacity-100': isViewer3dOpen,
                    'pointer-events-none invisible opacity-0': !isViewer3dOpen,
                }
            )}
        >
            <div
                className={classNames('relative overflow-hidden', {
                    'h-full w-full max-w-none': isViewer3dFullscreen,
                    'h-full w-full max-w-6xl': !isViewer3dFullscreen,
                })}
            >
                <Button
                    type="button"
                    onClick={closeViewer3dModal}
                    aria-label={t('close_3d_map_modal')}
                    style={{ top: isViewer3dLoaded ? '52px' : '12px' }}
                    className="group hover:bg-opacity-[99] absolute right-[10.25px] z-[999] flex size-[33px] items-center justify-center rounded-[4px] border border-[hsla(0,0%,100%,.2)] bg-[#00000095] p-0 pb-[0.5px] pl-[0.475px] transition-colors duration-200 hover:!scale-100 hover:bg-[#2c2022] rtl:right-auto rtl:left-3"
                >
                    <X
                        size={20}
                        className="text-white/80 transition-colors duration-200 group-hover:text-white/90"
                    />
                </Button>

                <div className="relative h-full">
                    <div
                        id={viewer3dContainerId}
                        className={classNames(
                            'h-full min-h-[150px] w-full overflow-hidden transition-opacity duration-200',
                            {
                                'opacity-100': isViewer3dLoaded,
                                'opacity-0': !isViewer3dLoaded,
                            }
                        )}
                    />
                    {showViewer3dFeedback && (
                        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                            {isViewer3dUnavailable ? (
                                <p className="text-lg leading-6 font-medium whitespace-pre-line text-white">
                                    {errorMessage || t('threed_view_not_available_for_section')}
                                </p>
                            ) : isViewer3dError ? (
                                <p className="text-sm leading-6 font-medium text-white">
                                    {errorMessage || t('unable_to_load_3d_venue_view')}
                                </p>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-white">
                                    <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    <span className="text-sm font-medium">
                                        {t('loading_3d_view')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
