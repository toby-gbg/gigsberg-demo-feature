import { Fragment, useCallback, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import Address from '@/interfaces/Address';
import { CheckoutStep, CheckoutStep1Form } from '@/interfaces/Checkout';
import { $addresses, setAddresses as setStoredAddresses } from '@/stores/addresses';
import { $addAddressModal } from '@/stores/modal';
import { mapAddressToSelectOption } from '@/utils/address.util';
import { useLazyGetAddresses } from '@/swr/features/address';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { useUser } from '@/providers/UserProvider';
import useCreateFieldWatcher from '@/hooks/useCreateFieldWatcher';

import { AddressSelectLabel } from '@/components/AddressSelectLabel';
import FloatingSelect from '@/components/FloatingSelect';
import StoreAddressModal from '@/components/modals/StoreAddressModal';
import StoreAddressForm from '@/components/StoreAddressForm';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

export default function CheckoutBillingAddress() {
    const t = useTranslations();

    const user = useUser();
    const storedAddresses = useStore($addresses);

    // Payment provider
    const { currentStep, setSelectedBillingAddress } = useCheckoutPayment();

    // Data provider
    const { setCountry, addresses, setAddresses } = useCheckoutData();

    // Form
    const {
        control,
        setValue,
        formState: { isSubmitting },
    } = useFormContext<CheckoutStep1Form>();

    // Get user's addresses
    const { trigger: getAddresses, isMutating: isLoadingAddresses } = useLazyGetAddresses();

    // Apply default address
    const applyDefaultAddress = useCallback(
        (addressList: Address[]) => {
            if (!addressList.length) return;

            const defaultAddr =
                addressList.find((a) => a.isDefault) ||
                addressList.find((a) => a.id === user?.default_address?.id) ||
                addressList[addressList.length - 1];

            if (defaultAddr) {
                setValue('address', defaultAddr);
                setCountry(defaultAddr.country);
                setSelectedBillingAddress(defaultAddr);
            }
        },
        [user?.default_address?.id, setCountry, setValue, setSelectedBillingAddress]
    );

    // Fetch user's addresses
    const fetchAddresses = useCallback(async () => {
        if (!user) return [];

        try {
            const result = await getAddresses({ pageSize: DEFAULT_LARGE_SIZE });
            const list = result.rows || [];
            setAddresses(list);
            setStoredAddresses(list);
            return list;
        } catch (error) {
            console.error('Failed to fetch addresses', error);
            return [];
        }
    }, [getAddresses, setAddresses, user]);

    useEffectOnce(() => {
        if (!user) return;

        if (storedAddresses.length > 0) {
            setAddresses(storedAddresses);
            applyDefaultAddress(storedAddresses);
        } else if (addresses.length > 0) {
            setStoredAddresses(addresses);
            applyDefaultAddress(addresses);
        } else {
            fetchAddresses().then(applyDefaultAddress);
        }
    });

    // Sync on User Change or Step Return
    useUpdateEffect(() => {
        if (!user) return;

        if (currentStep === CheckoutStep.YOUR_INFORMATION && addresses.length === 0) {
            fetchAddresses().then(applyDefaultAddress);
        }
    }, [user, currentStep, fetchAddresses, applyDefaultAddress]);

    // Watchers
    const useFieldWatcher = useCreateFieldWatcher<CheckoutStep1Form>();
    useFieldWatcher('address.country', (val) => val && setCountry(val));
    useFieldWatcher('country', (val) => val && setCountry(val));

    const triggerReloadAddress = (address: Address) => {
        setValue('address', address);
        setAddresses($addresses.get());
        setSelectedBillingAddress(address);
    };

    const addressOptions = useMemo(() => addresses.map(mapAddressToSelectOption), [addresses]);

    const onOpenAddAddress = () => $addAddressModal.set(true);

    return (
        <Fragment>
            <StoreAddressModal
                callback={triggerReloadAddress}
                entryPoint="checkout"
                hasExistingAddresses={addresses.length > 0}
            />

            <div className="col-span-12 mt-4">
                <p className="text-xl font-bold capitalize">{t('your_billing_address')}</p>
                <p className="text-sm text-gray-600 md:text-base">{t('help_us_confirm_payment')}</p>
            </div>

            {addresses.length ? (
                <div className="col-span-12 space-y-2">
                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, value } }) => {
                            return (
                                <FloatingSelect
                                    label={t('choose_billing_address')}
                                    isDisabled={isLoadingAddresses || isSubmitting}
                                    options={addressOptions}
                                    value={value?.id ? String(value.id) : ''}
                                    formatOptionLabel={(option) => (
                                        <AddressSelectLabel option={option} addresses={addresses} />
                                    )}
                                    onChange={(key) => {
                                        if (!key) return;

                                        const selectedAddress = addresses.find(
                                            (a) => a.id.toString() === key.toString()
                                        );

                                        if (selectedAddress) {
                                            onChange(selectedAddress);
                                            setSelectedBillingAddress(selectedAddress);
                                        }
                                    }}
                                    classNames={{ trigger: 'min-h-13.5 h-auto! pb-2' }}
                                />
                            );
                        }}
                    />

                    <button
                        type="button"
                        className="flex items-center gap-2 p-0 font-medium text-[#1867C3] transition-opacity hover:opacity-75"
                        onClick={onOpenAddAddress}
                    >
                        <CirclePlus size={20} />
                        {t('add_address')}
                    </button>
                </div>
            ) : (
                <StoreAddressForm />
            )}
        </Fragment>
    );
}
