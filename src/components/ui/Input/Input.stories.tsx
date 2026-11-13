import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    CreditCard,
    Link,
    Lock,
    Mail,
    Phone,
    Search,
    Ticket,
    User,
} from 'lucide-react';

import { Label } from '../Label';
import { Input } from './Input';

const inputTypes = [
    'text',
    'search',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'date',
    'time',
] as const;

const nativeSizes = [12, 24, 36] as const;

const meta: Meta<typeof Input> = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    args: {
        size: 20,
        type: 'text',
        placeholder: 'Enter value...',
        disabled: false,
    },
    argTypes: {
        size: {
            control: {
                type: 'number',
                min: 1,
                step: 1,
            },
        },
        type: {
            control: 'inline-radio',
            options: inputTypes,
        },
        placeholder: {
            control: 'text',
        },
        defaultValue: {
            control: 'text',
        },
        name: {
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
        'aria-invalid': {
            control: 'boolean',
        },
        prefixIcon: {
            control: false,
        },
        suffixIcon: {
            control: false,
        },
        classNames: {
            control: false,
        },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

const Field = ({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: ReactNode;
}) => (
    <Label className="flex flex-col items-stretch gap-1.5">
        <span className="text-body-s text-text-primary font-medium">{label}</span>
        {children}
        {description && <span className="text-body-xs text-text-secondary">{description}</span>}
    </Label>
);

const ControlledInputExample = () => {
    const [value, setValue] = useState('Taylor Swift');

    return (
        <Field label="Controlled value" description={`Current value: ${value || 'Empty'}`}>
            <Input
                name="artist"
                onChange={(event) => setValue(event.target.value)}
                placeholder="Artist name"
                prefixIcon={<Ticket className="size-4" />}
                value={value}
            />
        </Field>
    );
};

export const Playground: Story = {
    render: (args) => (
        <div className="w-90">
            <Input {...args} />
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
        <div className="flex w-95 flex-col gap-10">
            <Section title="Basic Usage">
                <div className="flex flex-col gap-4">
                    <Input placeholder="Empty input" />
                    <Input defaultValue="Filled input" />
                    <Input name="event" placeholder="Named input" />
                    <Input required placeholder="Required input" />
                </div>
            </Section>

            <Section title="With Icons">
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Search events"
                        prefixIcon={<Search className="size-4" />}
                        type="search"
                    />
                    <Input
                        placeholder="Email address"
                        prefixIcon={<Mail className="size-4" />}
                        suffixIcon={<CheckCircle className="size-4 text-success-state-default" />}
                        type="email"
                    />
                    <Input
                        placeholder="Password"
                        prefixIcon={<Lock className="size-4" />}
                        type="password"
                    />
                    <Input
                        aria-invalid
                        defaultValue="Incorrect card number"
                        prefixIcon={<CreditCard className="size-4" />}
                        suffixIcon={<AlertCircle className="size-4 text-error-state-default" />}
                    />
                </div>
            </Section>

            <Section title="Width">
                <div className="flex flex-col gap-4">
                    <Input placeholder="Default full width" />
                    <Input
                        classNames={{ wrapper: 'w-auto self-start' }}
                        placeholder="Fit native size"
                    />
                    <Input classNames={{ wrapper: 'w-60' }} placeholder="Fixed 240px" />
                    <Input classNames={{ wrapper: 'max-w-full' }} placeholder="Max full width" />
                </div>
            </Section>

            <Section title="Native Size">
                <div className="flex flex-col items-start gap-4">
                    {nativeSizes.map((size) => (
                        <Input
                            key={size}
                            classNames={{ wrapper: 'w-auto self-start' }}
                            placeholder={`${size} characters`}
                            size={size}
                        />
                    ))}
                </div>
            </Section>

            <Section title="Types">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input placeholder="text input" prefixIcon={<User className="size-4" />} />
                    <Input
                        placeholder="search input"
                        prefixIcon={<Search className="size-4" />}
                        type="search"
                    />
                    <Input
                        placeholder="email input"
                        prefixIcon={<Mail className="size-4" />}
                        type="email"
                    />
                    <Input
                        placeholder="password input"
                        prefixIcon={<Lock className="size-4" />}
                        type="password"
                    />
                    <Input placeholder="number input" type="number" />
                    <Input
                        placeholder="tel input"
                        prefixIcon={<Phone className="size-4" />}
                        type="tel"
                    />
                    <Input
                        placeholder="url input"
                        prefixIcon={<Link className="size-4" />}
                        type="url"
                    />
                    <Input prefixIcon={<Calendar className="size-4" />} type="date" />
                    <Input type="time" />
                </div>
            </Section>

            <Section title="Native Attributes">
                <div className="flex flex-col gap-4">
                    <Input
                        autoComplete="email"
                        name="email"
                        placeholder="Email address"
                        type="email"
                    />
                    <Input inputMode="numeric" name="quantity" placeholder="Quantity" type="text" />
                    <Input maxLength={10} placeholder="Max length 10" />
                    <Input min={1} max={10} placeholder="Number from 1 to 10" type="number" />
                    <Input
                        pattern="[0-9]{4}"
                        placeholder="Four digit code"
                        title="Enter four digits"
                    />
                    <Input autoComplete="one-time-code" placeholder="One-time code" />
                </div>
            </Section>

            <Section title="Text Behaviors">
                <div className="flex flex-col gap-4">
                    <Input readOnly defaultValue="Read only input" />
                    <Input spellCheck={false} placeholder="Spellcheck disabled" />
                    <Input autoCapitalize="words" placeholder="Auto capitalize words" />
                    <Input dir="rtl" defaultValue="RTL text direction" />
                </div>
            </Section>

            <Section title="States">
                <div className="flex flex-col gap-4">
                    <Field label="Default">
                        <Input placeholder="Default input" />
                    </Field>
                    <Field label="Filled">
                        <Input defaultValue="Filled input" />
                    </Field>
                    <Field label="Read only">
                        <Input readOnly defaultValue="Read only input" />
                    </Field>
                    <Field label="Disabled">
                        <Input disabled defaultValue="Disabled input" />
                    </Field>
                    <Field
                        label="Invalid"
                        description="Consumers render validation text outside Input."
                    >
                        <Input aria-invalid placeholder="Invalid input" />
                    </Field>
                    <Field label="Disabled invalid">
                        <Input disabled aria-invalid defaultValue="Disabled invalid input" />
                    </Field>
                </div>
            </Section>

            <Section title="Controlled And Form Usage">
                <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
                    <ControlledInputExample />
                    <Field label="First name">
                        <Input name="firstName" placeholder="First name" />
                    </Field>
                    <Field label="Last name">
                        <Input name="lastName" placeholder="Last name" />
                    </Field>
                    <Field label="Email">
                        <Input name="email" placeholder="Email" required type="email" />
                    </Field>
                    <Field label="Password">
                        <Input name="password" placeholder="Password" required type="password" />
                    </Field>
                </form>
            </Section>

            <Section title="Data And Aria Attributes">
                <div className="flex flex-col gap-4">
                    <Input aria-label="Search events" placeholder="Input with aria label" />
                    <Input aria-describedby="input-helper-text" placeholder="Described input" />
                    <p id="input-helper-text" className="text-body-s text-text-secondary">
                        Helper text can be rendered by the consumer.
                    </p>
                    <Input data-testid="input-story" placeholder="Input with data-testid" />
                </div>
            </Section>

            <Section title="Class Names">
                <div className="flex flex-col gap-4">
                    <Input
                        classNames={{
                            input: 'border-primary-600 bg-neutral-50',
                        }}
                        placeholder="Custom input surface"
                    />
                    <Input
                        classNames={{
                            input: 'text-primary-600',
                        }}
                        defaultValue="Custom input text"
                    />
                    <Input
                        classNames={{
                            input: 'h-11 rounded-lg px-4 text-body-m',
                        }}
                        placeholder="Custom height and spacing"
                    />
                    <Input
                        classNames={{
                            input: 'border-success-state-default aria-invalid:border-error-state-default',
                            wrapper: 'max-w-80',
                        }}
                        placeholder="Custom wrapper width"
                    />
                    <Input
                        classNames={{
                            prefixIcon: 'text-primary-600',
                            suffixIcon: 'text-success-state-default',
                        }}
                        defaultValue="Styled icon slots"
                        prefixIcon={<Search className="size-4" />}
                        suffixIcon={<CheckCircle className="size-4" />}
                    />
                </div>
            </Section>
        </div>
    ),
};
