'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import Address, {
    type AddressBody,
    type AddressForm,
    type DefaultAddressEntryPoint,
} from '@/interfaces/Address';
import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import { $addresses, addAddress, setAddresses } from '@/stores/addresses';
import { $addAddressModal, $defaultAddressModal } from '@/stores/modal';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { useStoreAddressMutation, useUpdateAddressMutation } from '@/swr/features/address';
import { useIpCountry } from '@/swr/features/ip';

import useCookie from '@/hooks/useCookie';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

import StoreAddressForm from '../StoreAddressForm';

interface StoreAddressModalProps {
    callback?: (address: Address) => void;
    /** Where the modal was opened from — used for GA4. */
    entryPoint?: DefaultAddressEntryPoint;
    /**
     * When true, show "set as default?" after create.
     * First address is auto-defaulted by the API — pass false.
     */
    hasExistingAddresses: boolean;
    /** Set to edit this address. Omit to create. */
    address?: Address | null;
}

const toAddressForm = (address: Address): AddressForm => ({
    fullname: address.fullname ?? '',
    address_line1: address.address_line1 ?? '',
    address_line2: address.address_line2 ?? '',
    city: address.city ?? '',
    postcode: address.postcode ?? '',
    country: address.country,
    state:
        address.state ??
        (address.state_id
            ? {
                  id: address.state_id,
                  name: '',
                  abbreviation: '',
                  country_id: address.country_id,
              }
            : null),
});

const StoreAddressModal = ({
    callback,
    entryPoint = 'account',
    hasExistingAddresses,
    address: editingAddress = null,
}: StoreAddressModalProps) => {
    const t = useTranslations();

    const { data: ipCountry, mutate: refreshIpCountry } = useIpCountry();
    const methods = useForm<AddressForm>({
        defaultValues: {
            ...(ipCountry && { country: ipCountry }),
        },
    });
    const {
        formState: { dirtyFields, touchedFields },
        handleSubmit,
        reset,
        setValue,
    } = methods;

    // Modals
    const isOpenAddressModal = useStore($addAddressModal);
    const setIsOpenAddressModal = (val: boolean) => $addAddressModal.set(val);
    const isOpenDefaultAddressModal = useStore($defaultAddressModal);
    const setIsOpenDefaultAddressModal = (val: boolean) => $defaultAddressModal.set(val);
    const isEdit = Boolean(editingAddress);

    useEffect(() => {
        if (isOpenAddressModal) void refreshIpCountry();
    }, [isOpenAddressModal, refreshIpCountry]);

    useEffect(() => {
        if (!isOpenAddressModal) return;

        if (editingAddress) {
            reset(toAddressForm(editingAddress));
            return;
        }

        reset({
            fullname: '',
            address_line1: '',
            address_line2: '',
            city: '',
            postcode: '',
            state: null,
        });
    }, [editingAddress, isOpenAddressModal, reset]);

    useEffect(() => {
        if (
            editingAddress ||
            !isOpenAddressModal ||
            !ipCountry ||
            dirtyFields.country ||
            touchedFields.country
        )
            return;

        setValue('country', ipCountry, { shouldDirty: false });
    }, [
        dirtyFields.country,
        editingAddress,
        ipCountry,
        isOpenAddressModal,
        setValue,
        touchedFields.country,
    ]);

    // Save address temporarily while waiting for user to choose whether to set as default.
    const [pendingAddress, setPendingAddress] = useState<{
        body: AddressBody;
        formMeta: Pick<AddressForm, 'country' | 'state'>;
    } | null>(null);

    const { getEncryptedCookie } = useCookie<PromotionItem>('CHECKOUT_ITEM');

    const { trigger: storeAddress, isMutating: isLoading } = useStoreAddressMutation({
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });
    const { trigger: updateAddress, isMutating: isUpdating } = useUpdateAddressMutation({
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });
    const isSaving = isLoading || isUpdating;

    // GA4
    const trackPromptShown = () => {
        GoogleAnalyticsTracker.triggerEvent('default_address_prompt_shown', {
            entry_point: entryPoint,
        });
    };

    const trackPromptSelection = (setAsDefault: boolean) => {
        GoogleAnalyticsTracker.triggerEvent('default_address_prompt_response', {
            entry_point: entryPoint,
            selection: setAsDefault ? 'yes' : 'no',
        });
    };

    const saveAddress = async (
        body: AddressBody,
        formMeta: Pick<AddressForm, 'country' | 'state'>
    ) => {
        const item = await getEncryptedCookie();
        if (item) {
            GoogleAnalyticsTracker.triggerGA4PromotionEvent('add_shipping_info', {
                items: [item],
            });
        }

        const address = await storeAddress(body);
        if (!address) return;

        const createdAddress: Address = {
            ...address,
            country: formMeta.country,
            state: formMeta.state,
            isDefault: body.isDefault ?? !hasExistingAddresses,
        };

        addAddress(createdAddress);
        callback?.(createdAddress);

        reset();
        setIsOpenAddressModal(false);
        toast.add({ id: 'store-address', title: t('success'), type: 'success' });

        return createdAddress;
    };

    const closeAddressModal = () => {
        reset();
        setIsOpenAddressModal(false);
    };

    const onSubmit: SubmitHandler<AddressForm> = async ({ country, state, ...data }) => {
        const hasState = ['CA', 'US'].includes(country?.code);
        const resolvedState = hasState ? state : undefined;
        const formMeta = { country, state: resolvedState };

        if (editingAddress) {
            const body: AddressBody = {
                ...data,
                country_id: country.id,
                state_id: resolvedState?.id ?? null,
            };
            const updated = await updateAddress({ id: editingAddress.id, body });
            if (!updated) return;

            const nextAddress: Address = {
                ...editingAddress,
                ...updated,
                country: updated.country ?? formMeta.country,
                state: hasState ? (updated.state ?? formMeta.state ?? null) : null,
                state_id: body.state_id ?? null,
                is_favorite: updated.is_favorite ?? editingAddress.is_favorite,
                isDefault: updated.isDefault ?? editingAddress.isDefault,
            };

            setAddresses(
                $addresses.get().map((item) => (item.id === nextAddress.id ? nextAddress : item))
            );
            callback?.(nextAddress);
            closeAddressModal();
            toast.add({
                id: 'update-address',
                title: t('address_update_success'),
                type: 'success',
            });
            return;
        }

        const body: AddressBody = {
            ...data,
            country_id: country.id,
            state_id: resolvedState?.id,
        };

        // First address: API auto-defaults — no prompt.
        if (!hasExistingAddresses) {
            await saveAddress(body, formMeta);
            return;
        }

        // Subsequent addresses: ask whether to set as default.
        setPendingAddress({ body, formMeta });

        // GA4
        trackPromptShown();

        setIsOpenDefaultAddressModal(true);
    };

    const handleSubmitSetDefaultAddress = async (setAsDefault: boolean) => {
        if (!pendingAddress) return;
        const { body, formMeta } = pendingAddress;

        // GA4
        trackPromptSelection(setAsDefault);

        const createdAddress = await saveAddress({ ...body, isDefault: setAsDefault }, formMeta);
        if (!createdAddress) return;

        setPendingAddress(null);
        setIsOpenDefaultAddressModal(false);
        setIsOpenAddressModal(false);
    };

    return (
        <>
            <Dialog open={isOpenAddressModal} onOpenChange={setIsOpenAddressModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? t('edit_address') : t('add_address')}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="pb-0">
                        <FormProvider {...methods}>
                            <form
                                className="pt-5 grid grid-cols-1 gap-4 lg:grid-cols-12"
                                onSubmit={(e) => {
                                    e.stopPropagation();
                                    handleSubmit(onSubmit)(e);
                                }}
                                noValidate
                            >
                                <StoreAddressForm />
                                <Button
                                    type="submit"
                                    disabled={isSaving || isOpenDefaultAddressModal}
                                    className="col-span-12 ltr:ml-auto rtl:mr-auto text-sm"
                                    aria-busy={isSaving}
                                    isLoading={isSaving}
                                >
                                    {isEdit ? t('save') : t('add_address')}
                                </Button>
                            </form>
                        </FormProvider>
                    </DialogBody>
                </DialogContent>
            </Dialog>
            <Dialog
                open={isOpenDefaultAddressModal}
                onOpenChange={(isOpen) => {
                    if (!isOpen && isOpenAddressModal) setIsOpenDefaultAddressModal(false);
                }}
            >
                <DialogContent
                    classNames={{
                        popup: 'max-w-150',
                    }}
                >
                    <DialogHeader className="mb-4">
                        <DialogTitle>{t('set_as_default_address')}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => void handleSubmitSetDefaultAddress(true)}
                            disabled={isLoading}
                            className="w-full text-white shrink"
                            aria-busy={isLoading}
                            isLoading={isLoading}
                        >
                            {t('yes')}
                        </Button>
                        <Button
                            onClick={() => void handleSubmitSetDefaultAddress(false)}
                            disabled={isLoading}
                            className="w-full shrink border border-[#D8D9E0]"
                            variant="outline"
                        >
                            {t('no')}
                        </Button>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StoreAddressModal;
