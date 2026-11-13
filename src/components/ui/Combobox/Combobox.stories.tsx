import { Fragment, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    CalendarDays,
    ChevronDown,
    MapPin,
    Search,
    SlidersHorizontal,
    Ticket,
    XCircle,
} from 'lucide-react';

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxClearTrigger,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxAnchor,
} from './Combobox';

const categoryOptions = [
    { value: 'sales', label: 'Sales' },
    { value: 'tickets', label: 'Tickets' },
    { value: 'events', label: 'Events' },
    { value: 'venues', label: 'Venues' },
] as const;

const groupedOptions = [
    {
        label: 'Events',
        items: [
            { value: 'concerts', label: 'Concerts' },
            { value: 'sports', label: 'Sports' },
            { value: 'theatre', label: 'Theatre' },
        ],
    },
    {
        label: 'Locations',
        items: [
            { value: 'london', label: 'London' },
            { value: 'new-york', label: 'New York' },
            { value: 'paris', label: 'Paris' },
        ],
    },
] as const;

const meta: Meta<typeof Combobox> = {
    title: 'UI/Combobox',
    component: Combobox,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

type CategoryOption = (typeof categoryOptions)[number];
type GroupedOption = (typeof groupedOptions)[number]['items'][number];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="flex w-80 flex-col gap-3">
        <h3 className="text-title-s text-text-primary font-semibold">{title}</h3>
        {children}
    </section>
);

const CategoryCollectionItems = () => (
    <>
        <ComboboxCollection>
            {(option: CategoryOption) => (
                <ComboboxItem key={option.value} value={option}>
                    {option.label}
                </ComboboxItem>
            )}
        </ComboboxCollection>
        <ComboboxEmpty>No categories found.</ComboboxEmpty>
    </>
);

const GroupedCollectionItems = () => (
    <>
        <ComboboxCollection>
            {(option: GroupedOption) => (
                <ComboboxItem key={option.value} value={option}>
                    {option.label}
                </ComboboxItem>
            )}
        </ComboboxCollection>
        <ComboboxEmpty>No destinations found.</ComboboxEmpty>
    </>
);

const CategoryCombobox = () => (
    <Combobox items={categoryOptions}>
        <ComboboxInput placeholder="Select category" />
        <ComboboxContent>
            <ComboboxList>
                <CategoryCollectionItems />
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
);

const ControlledCombobox = () => {
    const [value, setValue] = useState<CategoryOption | null>(categoryOptions[1]);

    return (
        <Combobox<CategoryOption> items={categoryOptions} value={value} onValueChange={setValue}>
            <div className="text-sm text-muted-foreground">Selected: {value?.label ?? 'None'}</div>
            <ComboboxInput placeholder="Select category" showClear />
            <ComboboxContent>
                <ComboboxList>
                    <CategoryCollectionItems />
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};

const ClearTriggerCombobox = () => {
    const [value, setValue] = useState<CategoryOption | null>(categoryOptions[2]);

    return (
        <Combobox<CategoryOption> items={categoryOptions} value={value} onValueChange={setValue}>
            <div className="relative">
                <ComboboxInput placeholder="Select category" showClear={false} />
                {value && <ComboboxClearTrigger onClick={() => setValue(null)} />}
            </div>
            <ComboboxContent>
                <ComboboxList>
                    <CategoryCollectionItems />
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};

const TriggerValueCombobox = () => (
    <Combobox items={categoryOptions} defaultValue={categoryOptions[0]}>
        <ComboboxTrigger className="justify-between">
            <ComboboxValue placeholder="Select category" />
        </ComboboxTrigger>
        <ComboboxContent>
            <ComboboxList>
                <CategoryCollectionItems />
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
);

const MultipleCombobox = () => {
    const anchorRef = useComboboxAnchor();

    return (
        <Combobox
            multiple
            items={categoryOptions}
            defaultValue={[categoryOptions[0], categoryOptions[2]]}
        >
            <ComboboxChips ref={anchorRef} className="w-80">
                <ComboboxValue>
                    {(value: CategoryOption[]) => (
                        <Fragment>
                            {value.map((option) => (
                                <ComboboxChip key={option.value} aria-label={option.label}>
                                    {option.label}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                                placeholder={value.length > 0 ? '' : 'Select categories'}
                            />
                        </Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchorRef}>
                <ComboboxList>
                    <CategoryCollectionItems />
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};

export const Playground: Story = {
    render: () => <CategoryCombobox />,
};

export const Usage: Story = {
    name: 'Usage',
    parameters: {
        controls: { disable: true },
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <Section title="Default">
                <CategoryCombobox />
            </Section>

            <Section title="Default Value">
                <Combobox defaultValue={categoryOptions[2]} items={categoryOptions}>
                    <div className="text-sm text-muted-foreground">
                        Selected: <ComboboxValue placeholder="None" />
                    </div>
                    <ComboboxInput placeholder="Select category" />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Controlled Value">
                <ControlledCombobox />
            </Section>

            <Section title="Clear Actions">
                <Combobox defaultValue={categoryOptions[1]} items={categoryOptions}>
                    <ComboboxInput placeholder="Select category" showClear />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <ClearTriggerCombobox />
            </Section>

            <Section title="Input Actions">
                <Combobox items={categoryOptions}>
                    <ComboboxInput placeholder="Type without trigger" showTrigger={false} />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <Combobox items={categoryOptions}>
                    <ComboboxInput
                        placeholder="Search category"
                        prefixIcon={<Search className="size-4 text-neutral-500" />}
                        triggerIcon={<SlidersHorizontal className="pointer-events-none size-4" />}
                        triggerProps={{ 'aria-label': 'Filter categories' }}
                    />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Clear Customization">
                <Combobox defaultValue={categoryOptions[2]} items={categoryOptions}>
                    <ComboboxInput
                        placeholder="Select category"
                        showClear
                        clearIcon={<XCircle className="pointer-events-none size-4" />}
                        classNames={{
                            clear: 'text-error-state-default hover:bg-error-state-default/10',
                        }}
                        clearProps={{ 'aria-label': 'Clear category' }}
                    />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Trigger Customization">
                <Combobox items={categoryOptions}>
                    <ComboboxInput
                        placeholder="Search category"
                        triggerIcon={<Search className="pointer-events-none size-4" />}
                        classNames={{ trigger: 'text-primary-600 hover:bg-primary-50' }}
                        triggerProps={{ 'aria-label': 'Search categories' }}
                    />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <TriggerValueCombobox />
            </Section>

            <Section title="Manual Groups">
                <Combobox>
                    <ComboboxInput placeholder="Search destination" />
                    <ComboboxContent>
                        <ComboboxList>
                            <ComboboxGroup>
                                <ComboboxLabel>Events</ComboboxLabel>
                                <ComboboxItem value="concerts">
                                    <CalendarDays />
                                    Concerts
                                </ComboboxItem>
                                <ComboboxItem value="sports">
                                    <Ticket />
                                    Sports
                                </ComboboxItem>
                                <ComboboxItem value="theatre" disabled>
                                    Theatre
                                </ComboboxItem>
                            </ComboboxGroup>
                            <ComboboxSeparator />
                            <ComboboxGroup>
                                <ComboboxLabel>Locations</ComboboxLabel>
                                <ComboboxItem value="london">
                                    <MapPin />
                                    London
                                </ComboboxItem>
                                <ComboboxItem value="new-york">
                                    <MapPin />
                                    New York
                                </ComboboxItem>
                                <ComboboxItem value="paris">
                                    <MapPin />
                                    Paris
                                </ComboboxItem>
                            </ComboboxGroup>
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Grouped Items">
                <Combobox items={groupedOptions}>
                    <ComboboxInput placeholder="Filtered from grouped items" />
                    <ComboboxContent>
                        <ComboboxList>
                            <GroupedCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Positioning">
                <Combobox items={categoryOptions}>
                    <ComboboxInput
                        placeholder="Inline-end popup"
                        triggerIcon={<ChevronDown className="pointer-events-none size-4" />}
                    />
                    <ComboboxContent side="inline-end" align="start">
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Multiple Chips">
                <MultipleCombobox />
            </Section>

            <Section title="Class Names">
                <Combobox items={categoryOptions}>
                    <ComboboxInput
                        placeholder="Custom wrapper and buttons"
                        showClear
                        classNames={{
                            wrapper: 'w-full border-[#6D9FD6] bg-[#F7FAFD]',
                            trigger: 'text-primary-600 hover:bg-primary-50',
                            clear: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
                        }}
                    />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Disabled">
                <Combobox disabled items={categoryOptions}>
                    <ComboboxInput disabled placeholder="Select category" showClear />
                    <ComboboxContent>
                        <ComboboxList>
                            <CategoryCollectionItems />
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>

            <Section title="Empty">
                <Combobox items={[]}>
                    <ComboboxInput placeholder="No available options" />
                    <ComboboxContent>
                        <ComboboxList>
                            <ComboboxCollection>
                                {(option: CategoryOption) => (
                                    <ComboboxItem key={option.value} value={option}>
                                        {option.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                            <ComboboxEmpty>No options found.</ComboboxEmpty>
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Section>
        </div>
    ),
};
