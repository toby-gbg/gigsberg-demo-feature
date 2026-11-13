import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label';

const meta: Meta<typeof Label> = {
    title: 'UI/Label',
    component: Label,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: 'Email address',
        htmlFor: 'label-playground',
    },
    argTypes: {
        children: { control: 'text' },
        className: { control: 'text' },
        htmlFor: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof Label>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

const inputClassName =
    'h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-solid';

export const Playground: Story = {
    render: (args) => (
        <div className="flex w-80 flex-col gap-2">
            <Label {...args} />
            <input id={args.htmlFor} className={inputClassName} type="email" />
        </div>
    ),
};

export const Usage: Story = {
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex w-80 flex-col gap-10">
            <Section title="Default">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="label-default">Email address</Label>
                    <input id="label-default" className={inputClassName} type="email" />
                </div>
            </Section>

            <Section title="Required">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="label-required">
                        Full name <span className="text-danger">*</span>
                    </Label>
                    <input id="label-required" className={inputClassName} required />
                </div>
            </Section>

            <Section title="Disabled">
                <div className="group flex flex-col gap-2" data-disabled="true">
                    <Label htmlFor="label-disabled">Country</Label>
                    <input id="label-disabled" className={inputClassName} disabled />
                </div>
            </Section>

            <Section title="Class Name">
                <Label className="text-xs text-secondary">Custom label</Label>
            </Section>
        </div>
    ),
};
