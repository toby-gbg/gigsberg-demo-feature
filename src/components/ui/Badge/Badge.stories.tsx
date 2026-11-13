import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle } from 'lucide-react';

import { Badge } from './Badge';

const variants = ['default', 'secondary', 'destructive', 'outline', 'ghost'] as const;

const meta: Meta<typeof Badge> = {
    title: 'UI/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: 'Hihi',
        icon: <CheckCircle />,
        size: 22,
        iconSize: 14,
        showIcon: true,
        variant: 'default',
    },
    argTypes: {
        children: {
            control: 'text',
        },
        icon: {
            table: {
                disable: true,
            },
        },
        size: {
            control: 'number',
        },
        iconSize: {
            control: 'number',
        },
        showIcon: {
            control: 'boolean',
        },
        variant: {
            control: 'inline-radio',
            options: variants,
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

export const Playground: Story = {};

export const All: Story = {
    name: 'All Information',
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex flex-col gap-10">
            <Section title="Variants">
                <div className="flex flex-col items-start gap-4">
                    {variants.map((variant) => (
                        <Badge key={variant} icon={<CheckCircle />} variant={variant}>
                            {variant}
                        </Badge>
                    ))}
                </div>
            </Section>

            <Section title="Sizes">
                <div className="flex flex-col items-start gap-4">
                    <Badge icon={<CheckCircle />} size={22}>
                        Default height
                    </Badge>
                    <Badge icon={<CheckCircle />} size={28} variant="secondary">
                        Custom height
                    </Badge>
                    <Badge icon={<CheckCircle />} size="2rem" variant="outline">
                        Rem height
                    </Badge>
                </div>
            </Section>

            <Section title="Custom Icon">
                <Badge icon={<CheckCircle />}>Custom icon</Badge>
            </Section>
        </div>
    ),
};
