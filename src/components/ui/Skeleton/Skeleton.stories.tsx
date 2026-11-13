import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from './Skeleton';

const meta = {
    title: 'UI/Skeleton',
    component: Skeleton,
    parameters: { layout: 'centered' },
    args: {
        animationType: 'shimmer',
    },
    argTypes: {
        animationType: {
            control: 'inline-radio',
            options: ['shimmer', 'pulse', 'none'],
        },
    },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    args: {
        className: 'h-5 w-64',
    },
};

export const EventCards: Story = {
    parameters: { layout: 'padded' },
    render: (args) => (
        <div className="flex w-[min(56rem,calc(100vw-2rem))] flex-col gap-8">
            <section aria-label="Event card skeleton" className="w-72 rounded-lg p-2">
                <div className="relative aspect-4/3 w-full">
                    <Skeleton {...args} className="absolute inset-0 rounded-t-lg" />
                    <Skeleton {...args} className="absolute top-2 left-2 h-5 w-16 rounded-full" />
                    <Skeleton {...args} className="absolute top-2 right-2 h-5 w-14 rounded-full" />
                </div>
                <div className="mt-2 flex flex-col gap-1">
                    <Skeleton {...args} className="h-7 w-5/6 rounded-lg" />
                    <Skeleton {...args} className="h-5 w-3/4 rounded-lg" />
                    <Skeleton {...args} className="mt-1 h-4 w-full rounded-lg" />
                </div>
            </section>

            <section
                aria-label="Event detail card skeleton"
                className="pointer-events-none overflow-hidden rounded-3xl border border-[#E0E0E0] bg-white"
            >
                <article className="flex items-center gap-3 px-2 py-4 md:px-6">
                    <div className="flex w-full items-center justify-between gap-2 md:flex-1 md:gap-10">
                        <div className="flex min-w-15.5 flex-col items-center gap-0.5">
                            <Skeleton {...args} className="h-4 w-7.5 rounded" />
                            <Skeleton {...args} className="h-6 w-13.75 rounded" />
                            <Skeleton {...args} className="h-4 w-7.5 rounded" />
                            <Skeleton {...args} className="h-4 w-11 rounded" />
                        </div>
                        <div className="flex grow flex-col gap-1">
                            <Skeleton {...args} className="h-7 w-full max-w-90.25 rounded" />
                            <Skeleton {...args} className="h-7 w-full max-w-68 rounded" />
                        </div>
                    </div>
                    <div className="flex w-22.75 flex-col items-end md:w-24">
                        <Skeleton {...args} className="h-7.5 w-full rounded md:h-9.5" />
                    </div>
                </article>
            </section>
        </div>
    ),
};
