'use client';

import { Fragment, useState } from 'react';
// import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { Sofa } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffectOnce } from 'react-use';

import { useListing } from '@/providers/ListingProvider';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';

// import { listingParamsParsers } from '../_searchParams';

export default function SelectQuantityModal() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const t = useTranslations();
    const { filters, setFilters, setOpenRestrictionModal } = useListing();
    // const [{ quantity }, handleSetParams] = useQueryStates(listingParamsParsers, {
    //     shallow: true,
    // });

    useEffectOnce(() => {
        if (filters.number_of_tickets?.[0] != null) return;
        setIsOpenModal(true);
    });

    // Handle quantity selection
    const handleQuantitySelect = (quantity?: number) => {
        // handleSetParams({ quantity: quantity ?? null });

        if (quantity) {
            setFilters((prev) => ({
                ...prev,
                number_of_tickets: [quantity, `${quantity} ${t('ticket', { count: quantity })}`],
                skip: false,
                page: 1,
            }));
        }

        setOpenRestrictionModal(true);
        setIsOpenModal(false);
    };

    return (
        <Dialog
            open={isOpenModal}
            onOpenChange={(value) => {
                setIsOpenModal(value);
                if (!value) setOpenRestrictionModal(true);
            }}
        >
            <DialogContent classNames={{ popup: 'max-w-xl' }}>
                <DialogHeader>
                    <DialogTitle>{t('select_ticket_quantity_title')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="font-semibold flex gap-1 items-center text-main-end">
                        <Sofa size={20} />
                        <p className="text-base">{t('you_will_seated_together')}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4">
                        {!isExpanded && (
                            <Fragment>
                                {new Array(5).fill(null).map((_, index) => (
                                    <ButtonQuantity
                                        key={index}
                                        onClick={() => handleQuantitySelect(index + 1)}
                                    >
                                        {index + 1}
                                    </ButtonQuantity>
                                ))}

                                <ButtonQuantity
                                    onClick={() => {
                                        setIsExpanded(!isExpanded);
                                    }}
                                >
                                    {'+6'}
                                </ButtonQuantity>
                            </Fragment>
                        )}

                        {isExpanded &&
                            new Array(12).fill(null).map((_, index) => (
                                <ButtonQuantity
                                    key={index}
                                    onClick={() => {
                                        handleQuantitySelect(index + 1);
                                    }}
                                >
                                    {index + 1}
                                </ButtonQuantity>
                            ))}
                    </div>
                    {/* Skip button */}
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            className="w-full py-6 border hover:border-main-start hover:bg-main-start/20 text-black text-base"
                            onClick={() => handleQuantitySelect()}
                        >
                            {t('any')}
                        </Button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}

const ButtonQuantity = ({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) => {
    return (
        <Button
            variant="outline"
            className="py-6 border hover:border-main-start hover:bg-main-start/20 text-black text-base"
            onClick={onClick}
        >
            {children}
        </Button>
    );
};
