import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import { toast, Toaster } from './Toast';

const ToastDemo = () => (
    <Toaster>
        <div className="flex gap-2">
            <Button
                onClick={() =>
                    toast.add({
                        title: 'Success Notification',
                        description: 'This is a toast notification.',
                        type: 'success',
                    })
                }
            >
                Success
            </Button>

            <Button
                onClick={() =>
                    toast.add({
                        title: 'Info Notification',
                        description: 'This is a toast notification.',
                        type: 'info',
                    })
                }
            >
                Info
            </Button>
            <Button
                onClick={() =>
                    toast.add({
                        title: 'Warning Notification',
                        description: 'This is a toast notification.',
                        type: 'warning',
                    })
                }
            >
                Warning
            </Button>
            <Button
                onClick={() =>
                    toast.add({
                        title: 'Error Notification',
                        description: 'This is a toast notification.',
                        type: 'error',
                    })
                }
            >
                Error
            </Button>
            <Button
                onClick={() =>
                    toast.promise(
                        // Simulate an API request with a promise that resolves after 2 seconds
                        new Promise<string>((resolve, reject) => {
                            const shouldSucceed = Math.random() > 0.3; // 70% success rate
                            setTimeout(() => {
                                if (shouldSucceed) {
                                    resolve('operation completed');
                                } else {
                                    reject(new Error('operation failed'));
                                }
                            }, 2000);
                        }),
                        {
                            loading: 'Loading data…',
                            success: (data: string) => `Success: ${data}`,
                            error: (err: Error) => `Error: ${err.message}`,
                        }
                    )
                }
            >
                Promise
            </Button>
        </div>
    </Toaster>
);

const meta = {
    title: 'UI/Toast',
    component: ToastDemo,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
