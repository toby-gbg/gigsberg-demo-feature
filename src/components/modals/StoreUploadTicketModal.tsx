'use client';

import { $selectedTicket, $uploadTicketModal } from '@/app/[locale]/account-settings/sales/_stores';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffectOnce } from 'react-use';

import AccountSettingOrder from '@/interfaces/account-settings/AccountSettingOrder';
import { UploadOrderTicketForm } from '@/interfaces/Order';
import { getFileExtension } from '@/utils/common';
import { useUploadOrderTicketMutation } from '@/swr/features/orders';
import { ACCEPTED_IMAGE_FILE_FORMATS_HINT } from '@/constants/file-type';

import Dropzone from '@/components/Dropzone';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

interface Props {
    isOpen: boolean;
    selectedTicket: AccountSettingOrder | null;
}

export default function StoreUploadTicketModal({ isOpen, selectedTicket }: Props) {
    const t = useTranslations();

    const { handleSubmit, control, reset, setError, clearErrors } =
        useForm<UploadOrderTicketForm>();

    const { trigger: uploadAsync, isMutating: isLoading } = useUploadOrderTicketMutation({
        onSuccess: () => {
            toast.add({ title: t('upload_ticket_success'), type: 'success' });
            handleClose();
            reset();
        },
        onError: (error) => {
            setError('files', {
                type: error.data.errorKey,
                message: t(error.data.errorKey),
            });
        },
    });

    useEffectOnce(() => reset());

    const handleClose = () => {
        reset();
        clearErrors('files');
        $selectedTicket.set(null);
        $uploadTicketModal.set(false);
    };

    const onSubmit: SubmitHandler<UploadOrderTicketForm> = async ({ files }) => {
        if (!selectedTicket) return;
        if (files.length === 0) return;

        const isValidQuantity = files.length === selectedTicket.quantity || files.length === 1;

        if (!isValidQuantity) {
            setError('files', {
                type: 'quantity-mismatch',
                message: t('ticket_upload_quantity_error', {
                    quantity: selectedTicket.quantity,
                }),
            });
            return;
        }

        uploadAsync({ orderId: selectedTicket.id, files });
    };

    const customValidator = (file: File) => {
        const ext = getFileExtension(file).toLowerCase();

        if (!['.jpg', '.jpeg', '.jpe', '.png', '.heic', '.pdf'].includes(ext)) {
            return {
                code: 'file-invalid-type',
                message: t('files_valid_formats', {
                    // File valid formats: {formats}
                    formats: ACCEPTED_IMAGE_FILE_FORMATS_HINT,
                }),
            };
        }

        if (file.size > 10000000) {
            return {
                code: 'file-too-large',
                message: t('file_size_error', {
                    // File size must be ≤ {size} MB
                    size: '10',
                }),
            };
        }

        if (ext !== '.pdf' && file.size > 5000000) {
            return {
                code: 'file-too-large',
                // File must be ≤ 10 MB for .pdf and ≤ 5 MB for images
                message: t('ticket_upload_file_size_error'),
            };
        }

        return null;
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    reset();
                    clearErrors('files');
                    $selectedTicket.set(null);
                }
                $uploadTicketModal.set(isOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('upload_ticket')}</DialogTitle>
                </DialogHeader>
                <DialogBody className="pb-0 text-black">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        <Controller
                            name="files"
                            control={control}
                            rules={{
                                required: t('field_required'),
                            }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <Dropzone
                                    validator={customValidator}
                                    files={value}
                                    label={t('drop_your_tickets_here')}
                                    error={error}
                                    onFileRemove={(files) => {
                                        onChange(files);
                                        clearErrors('files');
                                    }}
                                    onDropRejected={(rejections) => {
                                        const firstError = rejections[0]?.errors[0];

                                        if (firstError) {
                                            setError('files', {
                                                type: firstError.code,
                                                message: firstError.message,
                                            });
                                        }
                                    }}
                                    onDropAccepted={(acceptedFiles) => {
                                        onChange(acceptedFiles);
                                        clearErrors('files');
                                    }}
                                />
                            )}
                        />
                        <div className="col-span-12">
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="ms-auto min-w-24"
                                    disabled={isLoading}
                                    isLoading={isLoading}
                                >
                                    {t('continue')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
