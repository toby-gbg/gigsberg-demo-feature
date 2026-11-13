import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Check, Search, Ticket, Trash2 } from 'lucide-react';

import { Button } from './Button';

const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: 'Button',
        variant: 'default',
        type: 'button',
    },
    argTypes: {
        children: { control: 'text' },
        variant: {
            control: 'inline-radio',
            options: variants,
        },
        disabled: { control: 'boolean' },
        isIconOnly: { control: 'boolean' },
        prefixIcon: { control: false },
        suffixIcon: { control: false },
        className: { control: 'text' },
        type: {
            control: 'inline-radio',
            options: ['button', 'submit', 'reset'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

export const Playground: Story = {};

export const Usage: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => (
        <div className="flex max-w-3xl flex-col gap-10">
            <Section title="Variants">
                <div className="flex flex-wrap items-center gap-4">
                    {variants.map((variant) => (
                        <Button key={variant} variant={variant}>
                            {variant}
                        </Button>
                    ))}
                </div>
            </Section>

            <Section title="Icons">
                <div className="flex flex-wrap items-center gap-4">
                    <Button prefixIcon={<Ticket />}>Buy tickets</Button>
                    <Button suffixIcon={<ArrowRight />}>Continue</Button>
                    <Button aria-label="Search" isIconOnly prefixIcon={<Search />} />
                    <Button
                        aria-label="Delete"
                        isIconOnly
                        prefixIcon={<Trash2 />}
                        variant="destructive"
                    />
                </div>
            </Section>

            <Section title="RTL Icons">
                <div dir="rtl" className="flex flex-wrap items-center gap-4">
                    <Button prefixIcon={<Ticket />}>شراء التذاكر</Button>
                    <Button suffixIcon={<ArrowRight />}>متابعة</Button>
                </div>
            </Section>

            <Section title="States">
                <div className="flex flex-wrap items-center gap-4">
                    <Button disabled>Disabled</Button>
                    <Button aria-disabled>Aria disabled</Button>
                    <Button aria-pressed="false" prefixIcon={<Check />} variant="secondary">
                        Toggle
                    </Button>
                </div>
            </Section>

            <Section title="Class Overrides">
                <div className="flex flex-wrap items-center gap-4">
                    <Button className="bg-gradient text-on-main hover:opacity-90">
                        White-label theme
                    </Button>
                    <Button className="h-12 px-6 text-body-l">Custom dimensions</Button>
                    <Button className="rounded-full" variant="outline">
                        Rounded
                    </Button>
                </div>
            </Section>
        </div>
    ),
};
