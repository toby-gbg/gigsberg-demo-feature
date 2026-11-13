import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/preview-api';

import { Switch } from './Switch';

const selectionStates = ['off', 'on'] as const;

const meta: Meta<typeof Switch> = {
    title: 'UI/Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: 'Switch label',
        checked: false,
        disabled: false,
    },
    argTypes: {
        children: {
            control: 'text',
        },
        checked: {
            control: 'boolean',
        },
        disabled: {
            control: 'boolean',
        },
        classNames: {
            control: false,
        },
    },
};

export default meta;

type Story = StoryObj<typeof Switch>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

export const Playground: Story = {
    render: function Render(args) {
        const [{ checked }, updateArgs] = useArgs();

        return (
            <Switch
                {...args}
                checked={checked}
                onCheckedChange={(value) => updateArgs({ checked: value })}
            />
        );
    },
};

export const All: Story = {
    name: 'All Information',
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex flex-col gap-10">
            <Section title="Selection States">
                <div className="border-border-subtle bg-bg text-body-s overflow-hidden rounded border">
                    <div className="border-border-subtle bg-bg-subtle grid grid-cols-[120px_repeat(2,150px)] border-b">
                        <div className="text-text-secondary px-4 py-3 font-semibold">State</div>

                        {selectionStates.map((selectionState) => (
                            <div
                                key={selectionState}
                                className="text-text-secondary px-4 py-3 font-semibold capitalize"
                            >
                                {selectionState}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-[120px_repeat(2,150px)]">
                        <div className="text-text-tertiary px-4 py-4 font-medium">Default</div>

                        {selectionStates.map((selectionState) => (
                            <div key={selectionState} className="px-4 py-4">
                                <Switch
                                    aria-label={selectionState}
                                    defaultChecked={selectionState === 'on'}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section title="Disabled">
                <div className="flex items-center gap-6">
                    <Switch disabled>Off</Switch>

                    <Switch disabled defaultChecked>
                        On
                    </Switch>
                </div>
            </Section>

            <Section title="With Label">
                <Switch defaultChecked>Receive ticket alerts</Switch>
            </Section>
        </div>
    ),
};
