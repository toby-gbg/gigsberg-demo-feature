import type { Meta, StoryObj } from '@storybook/react';

import {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './Drawer';

const meta = {
    title: 'UI/Drawer',
    component: Drawer,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        swipeDirection: {
            control: 'inline-radio',
            options: ['left', 'right', 'up', 'down'],
        },
    },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <Drawer {...args}>
            <DrawerTrigger className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Open drawer
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Selected event</DrawerTitle>
                    <DrawerDescription>
                        Review the event details before continuing.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerBody className="mt-2">
                    Your ticket information and order summary appear here.
                </DrawerBody>
                <DrawerFooter>
                    <DrawerClose className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">
                        Close
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    ),
};
