import type { Meta, StoryObj } from '@storybook/react';

interface ColorVariant {
    name: string;
    className: string;
}

interface ColorGroup {
    name: string;
    variants: ColorVariant[];
}

const colorGroups: ColorGroup[] = [
    {
        name: 'primary',
        variants: [
            { name: 'light', className: 'bg-primary-light text-primary-dark-active' },
            { name: 'lightHover', className: 'bg-primary-light-hover text-primary-dark-active' },
            { name: 'border', className: 'bg-primary-border text-primary-dark-active' },
            { name: 'borderStrong', className: 'bg-primary-border-strong text-primary-dark' },
            { name: 'DEFAULT', className: 'bg-primary text-primary-light' },
            { name: 'hover', className: 'bg-primary-hover text-primary-light' },
            { name: 'active', className: 'bg-primary-active text-primary-light' },
            { name: 'dark', className: 'bg-primary-dark text-primary-light' },
            { name: 'darkHover', className: 'bg-primary-dark-hover text-primary-light' },
            { name: 'darkActive', className: 'bg-primary-dark-active text-primary-light' },
            { name: 'darkest', className: 'bg-primary-darkest text-primary-light' },
        ],
    },
    {
        name: 'success',
        variants: [
            { name: 'DEFAULT', className: 'bg-success text-white' },
            { name: 'hover', className: 'bg-success-hover text-white' },
            { name: 'soft', className: 'bg-success-soft text-white' },
            { name: 'border', className: 'bg-success-border text-white' },
        ],
    },
    {
        name: 'warning',
        variants: [
            { name: 'DEFAULT', className: 'bg-warning text-white' },
            { name: 'hover', className: 'bg-warning-hover text-white' },
            { name: 'soft', className: 'bg-warning-soft text-white' },
            { name: 'border', className: 'bg-warning-border text-white' },
        ],
    },
    {
        name: 'error',
        variants: [
            { name: 'DEFAULT', className: 'bg-error text-white' },
            { name: 'hover', className: 'bg-error-hover text-white' },
            { name: 'soft', className: 'bg-error-soft text-white' },
            { name: 'border', className: 'bg-error-border text-white' },
        ],
    },
    {
        name: 'info',
        variants: [
            { name: 'DEFAULT', className: 'bg-info text-white' },
            { name: 'hover', className: 'bg-info-hover text-white' },
            { name: 'soft', className: 'bg-info-soft text-white' },
            { name: 'border', className: 'bg-info-border text-white' },
        ],
    },
    {
        name: 'text',
        variants: [
            { name: 'primary', className: 'bg-text-primary text-white' },
            { name: 'secondary', className: 'bg-text-secondary text-white' },
            { name: 'tertiary', className: 'bg-text-tertiary text-white' },
        ],
    },
    {
        name: 'bg',
        variants: [
            { name: 'DEFAULT', className: 'bg-bg text-text-primary' },
            { name: 'subtle', className: 'bg-bg-subtle text-black' },
        ],
    },
    {
        name: 'surface',
        variants: [
            { name: 'DEFAULT', className: 'bg-surface text-black' },
            { name: 'muted', className: 'bg-surface-muted text-black' },
        ],
    },
    {
        name: 'border',
        variants: [
            { name: 'DEFAULT', className: 'bg-border text-black' },
            { name: 'subtle', className: 'bg-border-subtle text-black' },
        ],
    },
];

const meta: Meta = {
    title: 'UI/Colors',
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
        <div className="bg-bg flex min-h-screen w-full flex-col gap-8 p-8">
            {colorGroups.map((group) => (
                <section key={group.name}>
                    <h3 className="text-title-m mb-4 capitalize">{group.name}</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {group.variants.map((variant) => (
                            <div
                                key={variant.name}
                                className={`border-border-subtle flex h-20 w-full items-center justify-center rounded-md border p-2 text-center ${variant.className}`}
                            >
                                <span className="text-caption font-medium break-all">
                                    {variant.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    ),
};
