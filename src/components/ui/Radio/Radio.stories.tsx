import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const radioStates = ['off', 'on'] as const;

const meta: Meta<typeof Radio> = {
    title: 'UI/Radio',
    component: Radio,
    parameters: {
        layout: 'centered',
    },
    args: {
        disabled: false,
        value: 'radio-option',
    },
    argTypes: {
        disabled: { control: 'boolean' },
    },
    render: ({ value, ...args }) => (
        <RadioGroup defaultValue={value}>
            <label className="text-body-s inline-flex cursor-pointer items-center gap-2">
                <Radio {...args} value={value} />
                Radio label
            </label>
        </RadioGroup>
    ),
};

export default meta;
type Story = StoryObj<typeof Radio>;

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
            <Section title="States">
                <div className="border-border-subtle bg-bg text-body-s overflow-hidden rounded border">
                    <div className="border-border-subtle bg-bg-subtle grid grid-cols-2 border-b">
                        {radioStates.map((radioState) => (
                            <div
                                key={radioState}
                                className="text-text-secondary px-4 py-3 font-semibold capitalize"
                            >
                                {radioState}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2">
                        {radioStates.map((radioState) => (
                            <div key={radioState} className="px-4 py-4">
                                <RadioGroup defaultValue={radioState === 'on' ? radioState : null}>
                                    <Radio aria-label={radioState} value={radioState} />
                                </RadioGroup>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section title="Radio Group">
                <RadioGroup defaultValue="email">
                    <label className="text-body-s inline-flex cursor-pointer items-center gap-2">
                        <Radio value="email" />
                        Email updates
                    </label>
                    <label className="text-body-s inline-flex cursor-pointer items-center gap-2">
                        <Radio value="sms" />
                        SMS alerts
                    </label>
                    <label className="text-body-s inline-flex cursor-pointer items-center gap-2">
                        <Radio value="none" />
                        No notifications
                    </label>
                </RadioGroup>
            </Section>
        </div>
    ),
};
