import type { Meta, StoryObj } from '@storybook/react';

const typography = [
    { name: 'display-l', className: 'text-display-l' },
    { name: 'display-m', className: 'text-display-m' },
    { name: 'display-s', className: 'text-display-s' },
    { name: 'heading-l', className: 'text-heading-l' },
    { name: 'heading-m', className: 'text-heading-m' },
    { name: 'heading-s', className: 'text-heading-s' },
    { name: 'title-l', className: 'text-title-l' },
    { name: 'title-m', className: 'text-title-m' },
    { name: 'title-s', className: 'text-title-s' },
    { name: 'body-l', className: 'text-body-l' },
    { name: 'body-m', className: 'text-body-m' },
    { name: 'body-s', className: 'text-body-s' },
    { name: 'caption', className: 'text-caption' },
    { name: 'micro', className: 'text-micro' },
];

const meta: Meta = {
    title: 'UI/Typography',
    parameters: {
        layout: 'fullscreen',
        controls: {
            disable: true,
        },
    },
};

export default meta;
type Story = StoryObj;

export const All: Story = {
    name: 'All Information',
    render: () => (
        <div className="bg-bg text-text-primary flex min-h-screen w-full flex-col gap-12 p-8">
            {typography.map((item) => (
                <section
                    key={item.name}
                    className="border-border-subtle flex flex-col border-b pb-4"
                >
                    <span className="text-caption text-text-tertiary mb-2">{item.name}</span>
                    <p className={item.className}>The quick brown fox</p>
                </section>
            ))}
        </div>
    ),
};
