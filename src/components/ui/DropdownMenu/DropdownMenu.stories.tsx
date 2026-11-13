import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Archive,
    Bell,
    ChevronDown,
    Copy,
    Download,
    EllipsisVertical,
    Eye,
    FileText,
    Mail,
    Pencil,
    Share2,
    SlidersHorizontal,
    Trash2,
    UserPlus,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from './DropdownMenu';

const meta = {
    title: 'UI/DropdownMenu',
    component: DropdownMenu,
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
            control: 'boolean',
        },
        loopFocus: {
            control: 'boolean',
        },
        disabled: {
            control: 'boolean',
        },
        children: {
            control: false,
        },
    },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

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
}: React.ComponentProps<typeof DropdownMenuTrigger> & {
    iconOnly?: boolean;
}) => (
    <DropdownMenuTrigger
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
    </DropdownMenuTrigger>
);

const BasicMenuContent = ({ onAction }: { onAction?: (action: string) => void }) => (
    <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
            <DropdownMenuLabel>Listing actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAction?.('Edit listing')}>
                <Pencil />
                Edit listing
                <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.('Share listing')}>
                <Share2 />
                Share listing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.('Duplicate listing')}>
                <Copy />
                Duplicate
                <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
            </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuItem disabled>
                <Archive />
                Archive unavailable
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onAction?.('Delete listing')}>
                <Trash2 />
                Delete listing
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
        </DropdownMenuGroup>
    </DropdownMenuContent>
);

const ControlledStateDemo = () => {
    const [open, setOpen] = useState(false);
    const [lastAction, setLastAction] = useState('None');

    return (
        <div className="flex min-w-72 flex-col items-center gap-4">
            <p className="text-body-s text-text-secondary">
                Menu is <strong>{open ? 'open' : 'closed'}</strong>
            </p>

            <DropdownMenu open={open} onOpenChange={setOpen}>
                <TriggerButton>
                    Actions
                    <ChevronDown className="size-4" />
                </TriggerButton>
                <BasicMenuContent onAction={setLastAction} />
            </DropdownMenu>

            <p className="text-body-xs text-text-tertiary">Last action: {lastAction}</p>
        </div>
    );
};

const SelectionDemo = () => {
    const [email, setEmail] = useState(true);
    const [push, setPush] = useState(false);
    const [density, setDensity] = useState('comfortable');

    return (
        <div className="flex min-w-80 flex-col items-center gap-4">
            <DropdownMenu>
                <TriggerButton>
                    Notification settings
                    <Bell className="size-4" />
                </TriggerButton>
                <DropdownMenuContent className="w-60">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Channels</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            checked={email}
                            closeOnClick={false}
                            onCheckedChange={setEmail}
                        >
                            Email alerts
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={push}
                            closeOnClick={false}
                            onCheckedChange={setPush}
                        >
                            Push notifications
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                        <DropdownMenuLabel>Density</DropdownMenuLabel>
                        <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="comfortable">
                            Comfortable
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <p className="text-body-xs text-text-tertiary">
                Email: {email ? 'on' : 'off'} / Push: {push ? 'on' : 'off'} / Density: {density}
            </p>
        </div>
    );
};

export const Playground: Story = {
    render: (args) => (
        <DropdownMenu {...args}>
            <TriggerButton>
                Open menu
                <ChevronDown className="size-4" />
            </TriggerButton>
            <BasicMenuContent />
        </DropdownMenu>
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
        <div className="flex min-w-[720px] flex-col gap-10 p-6">
            <Section title="Basic Items">
                <div className="flex flex-wrap items-center gap-4">
                    <DropdownMenu>
                        <TriggerButton>
                            Listing actions
                            <ChevronDown className="size-4" />
                        </TriggerButton>
                        <BasicMenuContent />
                    </DropdownMenu>

                    <DropdownMenu>
                        <TriggerButton aria-label="More actions" iconOnly>
                            <EllipsisVertical className="size-4" />
                        </TriggerButton>
                        <BasicMenuContent />
                    </DropdownMenu>
                </div>
            </Section>

            <Section title="Groups, Labels, Insets, Separators">
                <DropdownMenu>
                    <TriggerButton>
                        Manage event
                        <SlidersHorizontal className="size-4" />
                    </TriggerButton>
                    <DropdownMenuContent className="w-64">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Publishing</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Eye />
                                Preview event
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Download />
                                Export orders
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuLabel inset>Team</DropdownMenuLabel>
                            <DropdownMenuItem inset>
                                Invite teammate
                                <DropdownMenuShortcut>Ctrl+I</DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem inset disabled>
                                Transfer owner
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Section>

            <Section title="Checkbox And Radio Items">
                <SelectionDemo />
            </Section>

            <Section title="Submenus">
                <DropdownMenu>
                    <TriggerButton>
                        More tools
                        <ChevronDown className="size-4" />
                    </TriggerButton>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <FileText />
                            View report
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Share2 />
                                Share with
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                    <Mail />
                                    Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <UserPlus />
                                    Teammate
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>Public link</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                            <Trash2 />
                            Remove event
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Section>

            <Section title="Positioning Props">
                <div className="flex flex-wrap items-center gap-4">
                    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                        <DropdownMenu key={side}>
                            <TriggerButton>{side}</TriggerButton>
                            <DropdownMenuContent side={side} align="center" sideOffset={8}>
                                <DropdownMenuItem>Aligned to {side}</DropdownMenuItem>
                                <DropdownMenuItem>sideOffset 8</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}
                </div>
            </Section>

            <Section title="Controlled State">
                <ControlledStateDemo />
            </Section>

            <Section title="Disabled Root And Trigger">
                <div className="flex flex-wrap items-center gap-4">
                    <DropdownMenu disabled>
                        <TriggerButton>
                            Disabled root
                            <ChevronDown className="size-4" />
                        </TriggerButton>
                        <BasicMenuContent />
                    </DropdownMenu>

                    <DropdownMenu>
                        <TriggerButton disabled>
                            Disabled trigger
                            <ChevronDown className="size-4" />
                        </TriggerButton>
                        <BasicMenuContent />
                    </DropdownMenu>
                </div>
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

export const WithSelection: Story = {
    args: {
        children: null,
    },
    render: () => <SelectionDemo />,
};
