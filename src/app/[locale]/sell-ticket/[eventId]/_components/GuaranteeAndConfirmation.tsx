'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import Address from '@/interfaces/Address';
import { SellForm } from '@/interfaces/Sell';
import { selectWrapperClassName } from '@/config/classname';
import { $addresses, setAddresses } from '@/stores/addresses';
import { $addAddressModal } from '@/stores/modal';
import { cn } from '@/lib/cn';
import { mapAddressToSelectOption } from '@/utils/address.util';
import { useGetAddresses } from '@/swr/features/address';
import { FILE_SIZE } from '@/constants/file-size';
import { ACCEPTED_IMAGE_FILE_FORMATS_HINT, ACCEPTED_IMAGE_FILE_TYPES } from '@/constants/file-type';
import { DEFAULT_LARGE_SIZE, DEFAULT_PAGE } from '@/constants/pagination';

import { useUser } from '@/providers/UserProvider';

import { AddressSelectLabel } from '@/components/AddressSelectLabel';
import Dropzone from '@/components/Dropzone';
import FloatingSelect from '@/components/FloatingSelect';
import StoreAddressModal from '@/components/modals/StoreAddressModal';
import StoreAddressForm from '@/components/StoreAddressForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const GuaranteeAndConfirmation = () => {
    const t = useTranslations();

    const {
        control,
        getValues,
        setValue,
        setError,
        clearErrors,
        formState: { isSubmitting },
    } = useFormContext<SellForm>();

    const user = useUser();
    const addresses = useStore($addresses);
    const {
        data: addressData,
        isValidating: isLoadingAddresses,
        isLoading,
    } = useGetAddresses({
        pageNumber: DEFAULT_PAGE,
        pageSize: DEFAULT_LARGE_SIZE,
    });

    const addressOptions = useMemo<{ label: string; value: number | string }[]>(
        () => addresses.map(mapAddressToSelectOption),
        [addresses]
    );

    const isUserHaveAddress = user && addressOptions.length > 0;
    const handleAddressCreated = (address: Address) => {
        setValue('address_id', address.id, { shouldValidate: true });
    };
    const handleUploadFiles = (
        newFiles: File[],
        currentValue: File[] | undefined,
        onChange: (files: File[]) => void,
        fieldName: 'identify_document' | 'purchase_document'
    ) => {
        clearErrors(fieldName);
        const shouldCheckRequired =
            fieldName === 'purchase_document' ||
            (fieldName === 'identify_document' && !user?.is_id_verified);
        if (shouldCheckRequired && (!newFiles || newFiles.length === 0)) {
            setError(fieldName, { type: 'manual', message: t('file_required') });
            onChange(currentValue ?? []);
            return;
        }

        if (newFiles.some((file) => file.size > FILE_SIZE['12MB'])) {
            setError(fieldName, { type: 'manual', message: t('file_size_error', { size: '12' }) });
            return;
        }

        const existingFiles = currentValue ?? [];
        const isDuplicate = (file: File) =>
            existingFiles.some(
                (existingFile) =>
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
            );

        if (newFiles.some(isDuplicate)) {
            setError(fieldName, { type: 'manual', message: t('file_duplicate_error') });
            return;
        }

        onChange([...existingFiles, ...newFiles].slice(-3));
    };

    useEffect(() => {
        if (!addresses.length && addressData) setAddresses(addressData.rows);
    }, [addressData, addresses.length]);

    useEffect(() => {
        const defaultAddress =
            addresses.find((address) => address.isDefault) ??
            addresses.find((address) => address.id === user?.default_address?.id);

        if (defaultAddress && !getValues('address_id')) setValue('address_id', defaultAddress.id);
    }, [addresses, getValues, setValue, user?.default_address?.id]);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="col-span-12">
                <h2 className="text-xl font-semibold">
                    {user?.is_id_verified
                        ? t('provide_proof_purchase')
                        : t('provide_proof_identity_purchase')}
                </h2>
                {!user?.is_id_verified && (
                    <p className="text-sm text-gray-600">{t('upload_national_id_or_passport')}</p>
                )}
            </div>
            {!user?.is_id_verified && (
                <Controller
                    control={control}
                    name="identify_document"
                    rules={{ required: t('field_required') }}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-sm font-medium text-gray-800">
                                {t('proof_of_id')} <span className="text-red-500">*</span>
                            </p>
                            <Dropzone
                                label={t('proof_of_id')}
                                hint={ACCEPTED_IMAGE_FILE_FORMATS_HINT}
                                multiple
                                files={value}
                                accept={ACCEPTED_IMAGE_FILE_TYPES}
                                onDrop={(files) =>
                                    handleUploadFiles(files, value, onChange, 'identify_document')
                                }
                                onFileRemove={onChange}
                                error={error}
                            />
                        </div>
                    )}
                />
            )}
            <Controller
                control={control}
                name="purchase_document"
                rules={{ required: t('field_required') }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <div
                        className={cn(
                            'col-span-12 md:col-span-6',
                            user?.is_id_verified && 'md:col-span-12'
                        )}
                    >
                        <p className="tgxt-gray-800 mb-1 text-sm font-medium">
                            {t('proof_of_purchase')} <span className="text-red-500">*</span>
                        </p>
                        <Dropzone
                            label={t('proof_of_purchase')}
                            hint={ACCEPTED_IMAGE_FILE_FORMATS_HINT}
                            multiple
                            files={value}
                            accept={ACCEPTED_IMAGE_FILE_TYPES}
                            onDrop={(files) =>
                                handleUploadFiles(files, value, onChange, 'purchase_document')
                            }
                            onFileRemove={onChange}
                            error={error}
                        />
                    </div>
                )}
            />

            {isLoading ? (
                <div className="col-span-12">
                    <div className="flex flex-col justify-center items-center py-4">
                        <Spinner className="text-main-start" />
                    </div>
                </div>
            ) : (
                <>
                    {isUserHaveAddress && (
                        <Controller
                            control={control}
                            name="address_id"
                            rules={{ required: t('field_required') }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <div className="col-span-12">
                                    <div className="flex items-center justify-between">
                                        <label className="mb-1 block text-sm font-medium text-gray-800">
                                            {t('choose_address')}{' '}
                                            <span className="text-red-500">*</span> :
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => $addAddressModal.set(true)}
                                            className="text-primary p-0 text-sm transition-opacity hover:opacity-75"
                                        >
                                            {t('new')}
                                        </button>
                                    </div>
                                    <FloatingSelect
                                        options={addressOptions}
                                        value={value}
                                        isLoading={isLoadingAddresses}
                                        placeholder={t('select_your_address')}
                                        formatOptionLabel={(option) => (
                                            <AddressSelectLabel
                                                option={option}
                                                addresses={addresses}
                                            />
                                        )}
                                        onChange={(selectedValue) => {
                                            onChange(
                                                selectedValue ? Number(selectedValue) : undefined
                                            );
                                        }}
                                        classNames={{
                                            wrapper: selectWrapperClassName,
                                            trigger: 'h-10 min-h-10 bg-transparent pt-0',
                                            spinner: 'h-10 min-h-10',
                                        }}
                                        errorMessage={error?.message}
                                    />

                                    <div className="mt-4 rounded border border-gray-300 bg-gray-100 p-4 font-bold">
                                        <p>{t('listing_review_message')}</p>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                    {!isUserHaveAddress && (
                        <div className="col-span-12">
                            <h2 className="mb-3 text-xl font-semibold">{t('store_address')}</h2>
                            <div className="grid gap-4">
                                <StoreAddressForm />
                            </div>
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="col-span-12 ms-auto h-12"
                        disabled={isSubmitting}
                    >
                        <span className="text-white">{t('send')}</span>
                    </Button>
                </>
            )}

            <StoreAddressModal
                callback={handleAddressCreated}
                entryPoint="sell_ticket"
                hasExistingAddresses={addresses.length > 0}
            />
        </div>
    );
};

export default GuaranteeAndConfirmation;
