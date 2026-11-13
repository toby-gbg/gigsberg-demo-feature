import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/preview-api';

import { Checkbox } from './Checkbox';

const visualStates = ['enabled', 'disabled', 'invalid', 'readOnly'] as const;
const selectionStates = ['unchecked', 'checked', 'indeterminate'] as const;

const meta: Meta<typeof Checkbox> = {
    title: 'UI/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    args: {
        checked: false,
        disabled: false,
        indeterminate: false,
        readOnly: false,
    },
    argTypes: {
        checked: { control: 'boolean' },
        disabled: { control: 'boolean' },
        indeterminate: { control: 'boolean' },
        readOnly: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

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
            <Checkbox
                {...args}
                aria-label="Checkbox"
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
            <Section title="States Matrix">
                <div className="border-border-subtle bg-bg text-body-s overflow-hidden rounded border">
                    <div className="border-border-subtle bg-bg-subtle grid grid-cols-[120px_repeat(3,150px)] border-b">
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

                    {visualStates.map((visualState) => (
                        <div
                            key={visualState}
                            className="border-border-subtle grid grid-cols-[120px_repeat(3,150px)] border-b last:border-b-0"
                        >
                            <div className="text-text-tertiary px-4 py-4 font-medium">
                                {visualState}
                            </div>

                            {selectionStates.map((selectionState) => (
                                <div key={selectionState} className="px-4 py-4">
                                    <Checkbox
                                        aria-label={`${visualState} ${selectionState}`}
                                        checked={selectionState === 'checked'}
                                        indeterminate={selectionState === 'indeterminate'}
                                        disabled={visualState === 'disabled'}
                                        readOnly={visualState === 'readOnly'}
                                        aria-invalid={visualState === 'invalid'}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="With Label">
                <label className="text-body-s inline-flex cursor-pointer items-center gap-2">
                    <Checkbox defaultChecked />
                    Receive ticket alerts
                </label>
            </Section>
        </div>
    ),
};
