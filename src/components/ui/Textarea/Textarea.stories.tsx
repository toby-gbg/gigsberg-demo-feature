import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
    title: 'UI/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    args: {
        placeholder: 'Write a message...',
        rows: 4,
        disabled: false,
    },
    argTypes: {
        placeholder: {
            control: 'text',
        },
        rows: {
            control: {
                type: 'number',
                min: 1,
                step: 1,
            },
        },
        defaultValue: {
            control: 'text',
        },
        name: {
            control: 'text',
        },
        className: {
            control: 'text',
        },
        disabled: {
            control: 'boolean',
        },
        readOnly: {
            control: 'boolean',
        },
        required: {
            control: 'boolean',
        },
        maxLength: {
            control: {
                type: 'number',
                min: 1,
                step: 1,
            },
        },
        'aria-invalid': {
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

export const Playground: Story = {
    render: (args) => (
        <div className="w-90">
            <Textarea {...args} />
        </div>
    ),
};

export const Usage: Story = {
    name: 'Usage',
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex w-90 flex-col gap-10">
            <Section title="Basic Usage">
                <div className="flex flex-col gap-4">
                    <Textarea placeholder="Empty textarea" />
                    <Textarea defaultValue="Filled textarea" />
                    <Textarea name="message" placeholder="Named textarea" />
                    <Textarea required placeholder="Required textarea" />
                </div>
            </Section>

            <Section title="Rows">
                <div className="flex flex-col gap-4">
                    <Textarea placeholder="Default textarea" />
                    <Textarea placeholder="One row" rows={1} />
                    <Textarea placeholder="Three rows" rows={3} />
                    <Textarea placeholder="Six rows" rows={6} />
                </div>
            </Section>

            <Section title="Width And Height">
                <div className="flex flex-col gap-4">
                    <Textarea placeholder="Default full width" />
                    <Textarea className="w-60" placeholder="Fixed 240px width" />
                    <Textarea className="min-h-28" placeholder="Custom minimum height" />
                    <Textarea
                        className="max-h-32 overflow-y-auto"
                        defaultValue={[
                            'Scrollable textarea',
                            'Line 2',
                            'Line 3',
                            'Line 4',
                            'Line 5',
                            'Line 6',
                        ].join('\n')}
                    />
                </div>
            </Section>

            <Section title="Native Attributes">
                <div className="flex flex-col gap-4">
                    <Textarea name="message" placeholder="Write a message..." rows={4} />
                    <Textarea maxLength={120} placeholder="Limited to 120 characters" />
                    <Textarea minLength={20} placeholder="Minimum 20 characters" />
                    <Textarea cols={30} className="w-auto" placeholder="Native cols 30" />
                    <Textarea wrap="off" placeholder="Wrap off" />
                    <Textarea autoComplete="street-address" placeholder="Street address" />
                    <Textarea readOnly defaultValue="Read only textarea" />
                    <Textarea required placeholder="Required textarea" />
                </div>
            </Section>

            <Section title="Text Behaviors">
                <div className="flex flex-col gap-4">
                    <Textarea spellCheck={false} placeholder="Spellcheck disabled" />
                    <Textarea autoCapitalize="sentences" placeholder="Auto capitalize sentences" />
                    <Textarea dir="rtl" defaultValue="RTL text direction" />
                    <Textarea
                        defaultValue={['Preserved line 1', 'Preserved line 2'].join('\n')}
                        placeholder="Multi-line value"
                    />
                </div>
            </Section>

            <Section title="States">
                <div className="flex flex-col gap-4">
                    <Textarea placeholder="Default textarea" />
                    <Textarea defaultValue="Filled textarea" />
                    <Textarea readOnly defaultValue="Read only textarea" />
                    <Textarea disabled defaultValue="Disabled textarea" />
                    <Textarea aria-invalid placeholder="Invalid textarea" />
                    <Textarea aria-invalid defaultValue="Invalid filled textarea" />
                    <Textarea disabled aria-invalid defaultValue="Disabled invalid textarea" />
                </div>
            </Section>

            <Section title="Form Usage">
                <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
                    <Textarea name="summary" placeholder="Summary" rows={2} />
                    <Textarea name="description" placeholder="Description" required rows={5} />
                    <Textarea
                        maxLength={250}
                        name="notes"
                        placeholder="Internal notes, up to 250 characters"
                    />
                </form>
            </Section>

            <Section title="Data And Aria Attributes">
                <div className="flex flex-col gap-4">
                    <Textarea
                        aria-label="Event description"
                        placeholder="Textarea with aria label"
                    />
                    <Textarea
                        aria-describedby="textarea-helper-text"
                        placeholder="Described textarea"
                    />
                    <p id="textarea-helper-text" className="text-body-s text-text-secondary">
                        Helper text can be rendered by the consumer.
                    </p>
                    <Textarea
                        data-testid="textarea-story"
                        placeholder="Textarea with data-testid"
                    />
                </div>
            </Section>

            <Section title="Class Overrides">
                <div className="flex flex-col gap-4">
                    <Textarea className="max-w-full" placeholder="Full width textarea" />
                    <Textarea
                        className="border-primary-600 bg-neutral-50"
                        placeholder="Custom textarea"
                    />
                    <Textarea className="text-primary-600" defaultValue="Custom textarea text" />
                    <Textarea
                        className="min-h-24 resize-none rounded-md px-4 text-body-m"
                        placeholder="No resize, custom spacing"
                    />
                    <Textarea
                        aria-invalid
                        className="aria-invalid:border-error-state-default aria-invalid:bg-error-state-default/5"
                        placeholder="Custom invalid styling"
                    />
                </div>
            </Section>
        </div>
    ),
};
