import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/components/ui/Button';

import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './Dialog';

const meta = {
    title: 'UI/Dialog',
    component: Dialog,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
    children: null,
};

const ControlledStatePlayground = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-start justify-center p-8">
            <Button onClick={() => setIsOpen(true)}>Open dialog</Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen} disablePointerDismissal>
                <DialogContent popupProps={{ 'aria-labelledby': 'dialog-playground-title' }}>
                    <DialogHeader>
                        <DialogTitle id="dialog-playground-title">
                            Controlled with useState()
                        </DialogTitle>
                        <p className="text-[#636367]">
                            This dialog is controlled by `open` and `onOpenChange`.
                        </p>
                    </DialogHeader>
                    <DialogBody>
                        <p className="text-neutral-700">
                            The content area stays in `DialogBody`, while title and helper copy live
                            in `DialogHeader`.
                        </p>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsOpen(false)}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const ControlledState: Story = {
    args: defaultArgs,
    render: () => <ControlledStatePlayground />,
};

export const UncontrolledState: Story = {
    args: defaultArgs,
    render: () => (
        <div className="flex items-start justify-center p-8">
            <Dialog disablePointerDismissal>
                <DialogTrigger className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    Open dialog
                </DialogTrigger>

                <DialogContent popupProps={{ 'aria-labelledby': 'dialog-trigger-title' }}>
                    <DialogHeader>
                        <DialogTitle id="dialog-trigger-title">
                            Uncontrolled with DialogTrigger
                        </DialogTitle>
                        <p className="text-[#636367]">
                            This dialog opens from the trigger without local state in the consumer.
                        </p>
                    </DialogHeader>
                    <DialogBody>
                        <p className="text-neutral-700">
                            Use `Dialog`, `DialogTrigger`, and `DialogContent` together when the
                            dialog can own its open state.
                        </p>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </div>
    ),
};
