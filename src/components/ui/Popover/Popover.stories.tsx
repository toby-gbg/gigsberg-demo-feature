import { useRef, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Bell,
    CalendarDays,
    Check,
    ChevronDown,
    CircleHelp,
    Clock,
    Info,
    Mail,
    MoreHorizontal,
    Settings,
    SlidersHorizontal,
    Ticket,
    X,
    type LucideIcon,
} from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from './Popover';

const meta = {
    title: 'UI/Popover',
    component: Popover,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: null,
    },
    argTypes: {
        defaultOpen: {
            control: 'boolean',
        },
        open: {
            control: false,
        },
        onOpenChange: {
            control: false,
        },
        modal: {
            control: 'inline-radio',
            options: [false, true, 'trap-focus'],
        },
        children: {
            control: false,
        },
    },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const customLayoutItems: Array<{
    label: string;
    Icon: LucideIcon;
}> = [
    { label: 'Calendar', Icon: CalendarDays },
    { label: 'Notifications', Icon: Bell },
    { label: 'Settings', Icon: Settings },
    { label: 'Confirmed', Icon: Check },
];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-4">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

const TriggerButton = ({
    children,
    iconOnly,
    className,
    ...props
}: React.ComponentProps<typeof PopoverTrigger> & {
    iconOnly?: boolean;
}) => (
    <PopoverTrigger
        className={[
            'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-bg px-3 text-sm font-medium text-text-primary shadow-xs transition-colors hover:bg-bg-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
            iconOnly ? 'w-10 px-0' : '',
            className,
        ]
            .filter(Boolean)
            .join(' ')}
        {...props}
    >
        {children}
    </PopoverTrigger>
);

const ActionButton = ({
    children,
    variant = 'primary',
    ...props
}: React.ComponentProps<'button'> & {
    variant?: 'primary' | 'secondary' | 'ghost';
}) => (
    <button
        type="button"
        className={[
            'inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
            variant === 'primary' ? 'bg-primary text-white hover:bg-primary/90' : '',
            variant === 'secondary'
                ? 'border border-border bg-bg text-text-primary hover:bg-bg-subtle'
                : '',
            variant === 'ghost'
                ? 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                : '',
        ]
            .filter(Boolean)
            .join(' ')}
        {...props}
    >
        {children}
    </button>
);

const InfoContent = () => (
    <PopoverContent>
        <PopoverHeader>
            <PopoverTitle>Event visibility</PopoverTitle>
            <PopoverDescription>
                Public events can be discovered from search results and shared links.
            </PopoverDescription>
        </PopoverHeader>
        <div className="flex items-start gap-3 rounded-md bg-bg-subtle p-3 text-text-secondary">
            <Info className="mt-0.5 size-4 shrink-0 text-info-state-text" />
            <p>Private drafts remain visible only to teammates with event management access.</p>
        </div>
    </PopoverContent>
);

const ControlledStateDemo = () => {
    const [open, setOpen] = useState(false);
    const [lastAction, setLastAction] = useState('None');

    return (
        <div className="flex min-w-80 flex-col items-center gap-4">
            <p className="text-body-s text-text-secondary">
                Popover is <strong>{open ? 'open' : 'closed'}</strong>
            </p>

            <Popover open={open} onOpenChange={setOpen}>
                <TriggerButton>
                    Review changes
                    <ChevronDown className="size-4" />
                </TriggerButton>
                <PopoverContent className="w-80">
                    <PopoverHeader>
                        <PopoverTitle>Unsaved changes</PopoverTitle>
                        <PopoverDescription>
                            Choose whether to apply the draft updates to this event.
                        </PopoverDescription>
                    </PopoverHeader>
                    <div className="flex justify-end gap-2">
                        <ActionButton
                            variant="secondary"
                            onClick={() => {
                                setLastAction('Dismissed');
                                setOpen(false);
                            }}
                        >
                            Dismiss
                        </ActionButton>
                        <ActionButton
                            onClick={() => {
                                setLastAction('Applied');
                                setOpen(false);
                            }}
                        >
                            Apply
                        </ActionButton>
                    </div>
                </PopoverContent>
            </Popover>

            <p className="text-body-xs text-text-tertiary">Last action: {lastAction}</p>
        </div>
    );
};

const FormContentDemo = () => {
    const [email, setEmail] = useState('buyer@example.com');
    const [alerts, setAlerts] = useState(true);

    return (
        <Popover>
            <TriggerButton>
                Alert settings
                <Bell className="size-4" />
            </TriggerButton>
            <PopoverContent className="w-88">
                <PopoverHeader>
                    <PopoverTitle>Ticket alerts</PopoverTitle>
                    <PopoverDescription>
                        Send a message when price or availability changes.
                    </PopoverDescription>
                </PopoverHeader>
                <label className="flex flex-col gap-1 text-sm font-medium text-text-primary">
                    Email
                    <input
                        className="h-10 rounded-md border border-border bg-bg px-3 text-sm font-normal text-text-primary outline-none focus:ring-2 focus:ring-ring"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input
                        checked={alerts}
                        className="size-4"
                        type="checkbox"
                        onChange={(event) => setAlerts(event.target.checked)}
                    />
                    Include weekly summary
                </label>
                <div className="flex justify-end gap-2">
                    <ActionButton variant="secondary">Cancel</ActionButton>
                    <ActionButton>Save</ActionButton>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const FocusDemo = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Popover>
            <TriggerButton>
                Initial focus
                <Mail className="size-4" />
            </TriggerButton>
            <PopoverContent className="w-80" initialFocus={inputRef}>
                <PopoverHeader>
                    <PopoverTitle>Invite teammate</PopoverTitle>
                    <PopoverDescription>
                        The input receives focus when this popover opens.
                    </PopoverDescription>
                </PopoverHeader>
                <input
                    ref={inputRef}
                    className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-ring"
                    placeholder="name@example.com"
                />
                <ActionButton>Send invite</ActionButton>
            </PopoverContent>
        </Popover>
    );
};

export const Playground: Story = {
    render: (args) => (
        <Popover {...args}>
            <TriggerButton>
                Open popover
                <ChevronDown className="size-4" />
            </TriggerButton>
            <InfoContent />
        </Popover>
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
        <div className="flex min-w-[760px] flex-col gap-10 p-6">
            <Section title="Basic Content">
                <div className="flex flex-wrap items-center gap-4">
                    <Popover>
                        <TriggerButton>
                            Event info
                            <CircleHelp className="size-4" />
                        </TriggerButton>
                        <InfoContent />
                    </Popover>

                    <Popover>
                        <TriggerButton aria-label="More information" iconOnly>
                            <MoreHorizontal className="size-4" />
                        </TriggerButton>
                        <PopoverContent className="w-64">
                            <PopoverHeader>
                                <PopoverTitle>Quick details</PopoverTitle>
                                <PopoverDescription>
                                    Icon-only triggers should always include an accessible label.
                                </PopoverDescription>
                            </PopoverHeader>
                        </PopoverContent>
                    </Popover>
                </div>
            </Section>

            <Section title="Header, Title, Description">
                <Popover>
                    <TriggerButton>
                        Ticket summary
                        <Ticket className="size-4" />
                    </TriggerButton>
                    <PopoverContent className="w-80">
                        <PopoverHeader>
                            <PopoverTitle>VIP ticket</PopoverTitle>
                            <PopoverDescription>
                                Includes early entry, premium seat access, and venue support.
                            </PopoverDescription>
                        </PopoverHeader>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-text-tertiary">Section</span>
                                <span className="font-medium text-text-primary">A2</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-tertiary">Row</span>
                                <span className="font-medium text-text-primary">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-tertiary">Price</span>
                                <span className="font-medium text-text-primary">$240</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </Section>

            <Section title="Form Content">
                <FormContentDemo />
            </Section>

            <Section title="Controlled State">
                <ControlledStateDemo />
            </Section>

            <Section title="Open On Hover">
                <Popover>
                    <TriggerButton openOnHover delay={150} closeDelay={150}>
                        Hover details
                        <Clock className="size-4" />
                    </TriggerButton>
                    <PopoverContent className="w-72">
                        <PopoverHeader>
                            <PopoverTitle>Hover trigger</PopoverTitle>
                            <PopoverDescription>
                                The trigger uses Base UI openOnHover with custom delay values.
                            </PopoverDescription>
                        </PopoverHeader>
                    </PopoverContent>
                </Popover>
            </Section>

            <Section title="Positioning Props">
                <div className="flex flex-wrap items-center gap-4">
                    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                        <Popover key={side}>
                            <TriggerButton>{side}</TriggerButton>
                            <PopoverContent
                                side={side}
                                align="center"
                                sideOffset={8}
                                className="w-56"
                            >
                                <PopoverHeader>
                                    <PopoverTitle>Side: {side}</PopoverTitle>
                                    <PopoverDescription>
                                        align center with sideOffset 8.
                                    </PopoverDescription>
                                </PopoverHeader>
                            </PopoverContent>
                        </Popover>
                    ))}
                </div>
            </Section>

            <Section title="Alignment And Width Overrides">
                <div className="flex flex-wrap items-center gap-4">
                    {(['start', 'center', 'end'] as const).map((align) => (
                        <Popover key={align}>
                            <TriggerButton>{align}</TriggerButton>
                            <PopoverContent align={align} className="w-64">
                                <PopoverHeader>
                                    <PopoverTitle>Align {align}</PopoverTitle>
                                    <PopoverDescription>
                                        Consumers can override width and alignment through content
                                        props.
                                    </PopoverDescription>
                                </PopoverHeader>
                            </PopoverContent>
                        </Popover>
                    ))}
                </div>
            </Section>

            <Section title="Focus Options">
                <FocusDemo />
            </Section>

            <Section title="Disabled Trigger">
                <Popover>
                    <TriggerButton disabled>
                        Disabled
                        <X className="size-4" />
                    </TriggerButton>
                    <PopoverContent>
                        <PopoverTitle>Unavailable</PopoverTitle>
                    </PopoverContent>
                </Popover>
            </Section>

            <Section title="Custom Content Layout">
                <Popover>
                    <TriggerButton>
                        Display settings
                        <SlidersHorizontal className="size-4" />
                    </TriggerButton>
                    <PopoverContent className="w-96 gap-3">
                        <PopoverHeader>
                            <PopoverTitle>Dashboard preferences</PopoverTitle>
                            <PopoverDescription>
                                A wider popover can hold denser controls without changing the
                                wrapper.
                            </PopoverDescription>
                        </PopoverHeader>
                        <div className="grid grid-cols-2 gap-2">
                            {customLayoutItems.map(({ label, Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className="flex h-16 cursor-pointer flex-col items-start justify-center gap-1 rounded-md border border-border bg-bg px-3 text-left text-sm hover:bg-bg-subtle"
                                >
                                    <Icon className="size-4 text-text-tertiary" />
                                    <span className="font-medium text-text-primary">{label}</span>
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </Section>
        </div>
    ),
};

export const ControlledState: Story = {
    args: {
        children: null,
    },
    render: () => <ControlledStateDemo />,
};

export const WithFormContent: Story = {
    args: {
        children: null,
    },
    render: () => <FormContentDemo />,
};

export const WithInitialFocus: Story = {
    args: {
        children: null,
    },
    render: () => <FocusDemo />,
};
