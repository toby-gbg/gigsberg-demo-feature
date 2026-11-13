import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    AlertCircle,
    AtSign,
    Calendar,
    Check,
    ChevronDown,
    Copy,
    CreditCard,
    DollarSign,
    Eye,
    Info,
    Lock,
    Mail,
    Paperclip,
    Percent,
    Search,
    Send,
    User,
    X,
} from 'lucide-react';

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from './InputGroup';

const alignments = ['inline-start', 'inline-end', 'block-start', 'block-end'] as const;

const meta: Meta<typeof InputGroup> = {
    title: 'UI/InputGroup',
    component: InputGroup,
    parameters: {
        layout: 'centered',
    },
    args: {
        className: 'w-90',
    },
    argTypes: {
        className: {
            control: 'text',
        },
        children: {
            control: false,
        },
    },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

export const Playground: Story = {
    render: (args) => (
        <InputGroup {...args}>
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search event..." type="search" />
            <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Submit search">
                    <Search className="size-4" />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    ),
};

export const All: Story = {
    name: 'All Information',
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex w-95 flex-col gap-10">
            <Section title="Inline Addons">
                <div className="flex flex-col gap-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Search event..." type="search" />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <AtSign />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="username" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>.com</InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon align="inline-start">
                            <InputGroupText>
                                <DollarSign />
                                USD
                            </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput inputMode="decimal" placeholder="0.00" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>
                                <Percent />
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <User />
                        </InputGroupAddon>
                        <InputGroupInput defaultValue="Taylor Swift" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>
                                <Check className="text-success-state-default" />
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>

            <Section title="Icon Buttons">
                <div className="flex flex-col gap-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search event..." type="search" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Submit search">
                                <Search />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput defaultValue="Taylor Swift" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Clear search">
                                <X />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <Lock />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Password" type="password" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Show password">
                                <Eye />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput defaultValue="GB-18429" readOnly />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Copy code">
                                <Copy />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput disabled defaultValue="Disabled action" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Disabled clear" disabled>
                                <X />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>

            <Section title="Block Addons">
                <div className="flex flex-col gap-4">
                    <InputGroup>
                        <InputGroupAddon align="block-start">
                            <InputGroupText>Message</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupTextarea placeholder="Write a message..." rows={3} />
                        <InputGroupAddon align="block-end">
                            <InputGroupButton aria-label="Attach file">
                                <Paperclip />
                            </InputGroupButton>
                            <InputGroupButton aria-label="Send message">
                                <Send />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon align="block-start" className="border-b">
                            <InputGroupText>
                                <Info />
                                Notes
                            </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupTextarea
                            defaultValue="Block addons can sit above or below textarea content."
                            rows={4}
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon align="block-start">
                            <InputGroupText>Internal description</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Short summary" />
                        <InputGroupAddon align="block-end" className="border-t">
                            <InputGroupText>Optional</InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>

            <Section title="Alignment">
                <div className="grid grid-cols-1 gap-4">
                    {alignments.map((align) => (
                        <InputGroup key={align}>
                            <InputGroupAddon align={align}>
                                <InputGroupText>{align}</InputGroupText>
                            </InputGroupAddon>
                            {align.startsWith('block') ? (
                                <InputGroupTextarea placeholder={`${align} addon`} rows={3} />
                            ) : (
                                <InputGroupInput placeholder={`${align} addon`} />
                            )}
                        </InputGroup>
                    ))}
                </div>
            </Section>

            <Section title="Native Attributes">
                <div className="flex flex-col gap-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                            autoComplete="email"
                            name="email"
                            placeholder="Email address"
                            type="email"
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <CreditCard />
                        </InputGroupAddon>
                        <InputGroupInput
                            inputMode="numeric"
                            maxLength={16}
                            placeholder="Card number"
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupAddon>
                            <Calendar />
                        </InputGroupAddon>
                        <InputGroupInput type="date" />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput defaultValue="Read only value" readOnly />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>Read only</InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>

            <Section title="States">
                <div className="flex flex-col gap-4">
                    <InputGroup>
                        <InputGroupInput defaultValue="Valid value" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>
                                <Check className="text-success-state-default" />
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput aria-invalid defaultValue="Invalid value" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>
                                <AlertCircle className="text-error-state-default" />
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>

                    <InputGroup data-disabled="true">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput disabled defaultValue="Disabled input" />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput disabled defaultValue="Disabled with action" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Disabled clear" disabled>
                                <X />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>

            <Section title="Class Overrides">
                <div className="flex flex-col gap-4">
                    <InputGroup className="h-10">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Taller input group" />
                    </InputGroup>

                    <InputGroup className="border-primary-600 bg-neutral-50">
                        <InputGroupAddon>
                            <AtSign />
                        </InputGroupAddon>
                        <InputGroupInput className="text-primary-600" defaultValue="custom" />
                    </InputGroup>

                    <InputGroup>
                        <InputGroupInput placeholder="Custom icon button color" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                aria-label="Open menu"
                                className="text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                            >
                                <ChevronDown />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </Section>
        </div>
    ),
};
