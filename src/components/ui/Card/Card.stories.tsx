import type { Meta, StoryObj } from '@storybook/react';
import { Ellipsis, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './Card';

const meta = {
    title: 'UI/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        children: {
            control: false,
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    args: {
        className: 'w-80',
        children: (
            <>
                <CardHeader>
                    <CardTitle>Ticket details</CardTitle>
                    <CardDescription>Order #GB-1024</CardDescription>
                    <CardAction>
                        <Button
                            aria-label="More options"
                            isIconOnly
                            prefixIcon={<Ellipsis />}
                            variant="ghost"
                        />
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <p>2 tickets · Section 102</p>
                    <p className="text-secondary">Mobile transfer</p>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button>View tickets</Button>
                </CardFooter>
            </>
        ),
    },
};

export const AllInformation: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <Ticket className="size-5" />
                    <CardTitle>Default card</CardTitle>
                    <CardDescription>
                        Uses the spacing, surface, radius, and shadow of the current card design.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="rounded border p-2 shadow-none">
                <CardHeader>
                    <CardTitle>Bordered card</CardTitle>
                    <CardDescription>
                        Matches the compact bordered cards used by loading states.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg">
                <CardHeader>
                    <CardTitle>Elevated card</CardTitle>
                    <CardDescription>
                        Matches the prominent cards used on feedback pages.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    ),
};
