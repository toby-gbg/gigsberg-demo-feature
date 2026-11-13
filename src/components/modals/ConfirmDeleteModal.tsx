import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
    isOpen: boolean;
    title?: string;
    description?: string;
    isMutating?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onOpenChange: (value: boolean) => void;
}

export default function ConfirmDeleteModal({
    isOpen,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    isMutating = false,
}: Props) {
    const t = useTranslations();
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                classNames={{
                    popup: 'max-w-150',
                }}
            >
                <DialogHeader className="pb-4">
                    <DialogTitle>{title ?? t('confirm_continue')}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={onConfirm}
                        className="w-full shrink"
                        disabled={isMutating}
                        aria-busy={isMutating}
                        prefixIcon={isMutating ? <Spinner className="size-4" /> : undefined}
                    >
                        {t('confirm')}
                    </Button>
                    <Button
                        onClick={onCancel}
                        className="w-full shrink"
                        disabled={isMutating}
                        variant="outline"
                    >
                        {t('cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
