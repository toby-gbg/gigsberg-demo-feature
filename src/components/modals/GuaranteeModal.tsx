'use client';

import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';

import { $guaranteeModal } from '@/stores/modal';

import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';

interface Props {
    onClose: () => void;
}

export default function GuaranteeModal({ onClose }: Props) {
    const t = useTranslations();
    const isOpen = useStore($guaranteeModal);

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogBody>
                    <div className="text-sm text-gray-700 space-y-4 max-h-[70vh] overflow-y-auto">
                        <p>
                            {t('guarantee_line_1')}
                            <br />- {t('guarantee_bullet_1')}
                            <br />- {t('guarantee_bullet_2')}
                            <br />- {t('guarantee_bullet_3')}
                        </p>
                        <p>
                            {t('guarantee_line_2')}
                            <br />
                            Gigsberg GmbH, Gewerbestrasse 5, CH 6330 Cham,
                            <br />
                            <a href="mailto:support@gigsberg.com" className="text-blue-600">
                                support@gigsberg.com
                            </a>{' '}
                            <br />
                            WhatsApp:{' '}
                            <a
                                href="https://wa.me/16316869478"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                +1 631 686 9478
                            </a>
                        </p>
                        <p>
                            {t('guarantee_line_3')}{' '}
                            <a href="mailto:support@gigsberg.com" className="text-blue-600">
                                support@gigsberg.com
                            </a>{' '}
                            {t('guarantee_line_4')}
                        </p>
                        <p>{t('guarantee_line_5')}</p>
                        <p>{t('guarantee_line_6')}</p>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
