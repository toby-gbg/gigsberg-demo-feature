import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner';

const sizes = [
    ['Small', 'size-4'],
    ['Medium', 'size-9'],
    ['Large', 'size-10'],
    ['Extra large', 'size-11'],
] as const;

const meta = {
    title: 'UI/Spinner',
    component: Spinner,
    parameters: { layout: 'centered' },
    args: {
        className: 'size-9',
    },
    argTypes: {
        className: { control: 'text' },
    },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const All: Story = {
    name: 'All Information',
    render: () => (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
                <h3 className="text-title-s text-text-primary font-semibold">Sizes</h3>
                <div className="flex flex-wrap items-center gap-6">
                    {sizes.map(([label, className]) => (
                        <div key={label} className="flex items-center gap-2">
                            <Spinner
                                className={`text-primary-600 ${className}`}
                                aria-label={`${label} loading`}
                            />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    ),
};
