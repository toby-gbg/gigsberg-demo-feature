import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';

import type Country from '@/interfaces/Country';

import SelectComboboxVirtualized from '@/components/SelectComboboxVirtualized';

const storyMessages = {
    country: 'Country',
    fetching_location: 'Fetching location',
    no_data: 'No data',
    use_my_location: 'Use my location',
};

const countries: Country[] = [
    {
        id: 1,
        name: 'United Kingdom',
        code: 'GB',
        name_fr: 'United Kingdom',
        name_es: 'United Kingdom',
        name_de: 'United Kingdom',
        name_it: 'United Kingdom',
        name_ru: 'United Kingdom',
        name_he: 'United Kingdom',
        name_ar: 'United Kingdom',
        name_hu: 'United Kingdom',
        name_pl: 'United Kingdom',
        name_hr: 'United Kingdom',
        name_pt: 'United Kingdom',
        currency_code: 'GBP',
        language_code: 'en',
        iso_code: 'GB',
    },
    {
        id: 2,
        name: 'France',
        code: 'FR',
        name_fr: 'France',
        name_es: 'France',
        name_de: 'France',
        name_it: 'France',
        name_ru: 'France',
        name_he: 'France',
        name_ar: 'France',
        name_hu: 'France',
        name_pl: 'France',
        name_hr: 'France',
        name_pt: 'France',
        currency_code: 'EUR',
        language_code: 'fr',
        iso_code: 'FR',
    },
    {
        id: 3,
        name: 'Germany',
        code: 'DE',
        name_fr: 'Germany',
        name_es: 'Germany',
        name_de: 'Germany',
        name_it: 'Germany',
        name_ru: 'Germany',
        name_he: 'Germany',
        name_ar: 'Germany',
        name_hu: 'Germany',
        name_pl: 'Germany',
        name_hr: 'Germany',
        name_pt: 'Germany',
        currency_code: 'EUR',
        language_code: 'de',
        iso_code: 'DE',
    },
];

const countryOptions = countries.map((country) => ({
    value: country.id,
    label: country.name,
}));

const eventOptions = [
    { value: 'london-2026', label: 'London · Premier League · 2026' },
    { value: 'paris-2026', label: 'Paris · International Friendly Match · 2026' },
    { value: 'berlin-2026', label: 'Berlin · European Championship Final · 2026' },
];

const StoryFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-50 p-8">{children}</div>
);

const ControlledSelectRecord = () => {
    const [countryId, setCountryId] = useState<number>();
    const selectedCountry = countries.find((country) => country.id === countryId);

    return (
        <StoryFrame>
            <div className="max-w-md space-y-3">
                <SelectComboboxVirtualized
                    label="Event country"
                    value={countryId}
                    options={countryOptions}
                    countries={countries}
                    visibleCountries={countries}
                    isClearable
                    placeholder="Select a country"
                    onChange={(value) => setCountryId(value == null ? undefined : Number(value))}
                />
                <p className="text-sm text-gray-600">Selected: {selectedCountry?.name ?? 'none'}</p>
            </div>
        </StoryFrame>
    );
};

const SelectRecordStates = () => (
    <StoryFrame>
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
            <SelectComboboxVirtualized
                label="Required field"
                options={countryOptions}
                placeholder="Choose a country"
                isRequired
                error={{ type: 'required', message: 'Country is required' }}
            />
            <SelectComboboxVirtualized
                label="Disabled field"
                options={countryOptions}
                value={1}
                placeholder="Choose a country"
                isDisabled
            />
            <SelectComboboxVirtualized
                label="Loading field"
                loading
                placeholder="Loading countries"
            />
            <SelectComboboxVirtualized
                hideLabel
                fullWidth
                options={countryOptions}
                placeholder="Full width without label or icon"
                isIconTrigger={false}
            />
            <SelectComboboxVirtualized
                label="Custom trigger"
                options={countryOptions}
                placeholder="Custom border and label"
                classNames={{
                    wrapper: 'max-w-sm',
                    trigger: 'border border-blue-500 bg-blue-50',
                    iconClassName: 'text-blue-600',
                    labelClassName: 'font-semibold text-blue-700',
                }}
            />
        </div>
    </StoryFrame>
);

const EmptySelectRecord = () => (
    <StoryFrame>
        <div className="max-w-md">
            <SelectComboboxVirtualized
                label="No available records"
                options={[]}
                placeholder="Search countries"
            />
        </div>
    </StoryFrame>
);

const ValueAndLabelExamples = () => {
    const [eventId, setEventId] = useState<string | number>('paris-2026');

    return (
        <StoryFrame>
            <div className="grid max-w-3xl gap-6 md:grid-cols-2">
                <SelectComboboxVirtualized
                    label="String values"
                    value={eventId}
                    options={eventOptions}
                    isClearable
                    placeholder="Select an event"
                    onChange={(value) =>
                        setEventId(
                            typeof value === 'string' || typeof value === 'number' ? value : ''
                        )
                    }
                />
                <SelectComboboxVirtualized
                    label="Long labels"
                    value={eventId}
                    options={eventOptions.map((event) => ({
                        ...event,
                        label: `${event.label} — This text is truncated inside the trigger`,
                    }))}
                    placeholder="Select an event"
                    onChange={(value) =>
                        setEventId(
                            typeof value === 'string' || typeof value === 'number' ? value : ''
                        )
                    }
                />
            </div>
        </StoryFrame>
    );
};

const LocationSelectRecord = () => {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    return (
        <StoryFrame>
            <div className="max-w-md space-y-3">
                <SelectComboboxVirtualized
                    label="Country near me"
                    options={countryOptions}
                    countries={countries}
                    visibleCountries={countries}
                    value={selectedCountry?.id}
                    isUseMyLocation
                    isClearable
                    placeholder="Select or use my location"
                    onChange={(value) => {
                        if (typeof value === 'object' && value !== null && 'id' in value) {
                            setSelectedCountry(value as Country);
                            return;
                        }

                        setSelectedCountry(
                            countries.find((country) => country.id === Number(value)) ?? null
                        );
                    }}
                />
                <p className="text-sm text-gray-600">
                    The location action is enabled; selecting it uses the component&apos;s
                    geolocation hook.
                </p>
            </div>
        </StoryFrame>
    );
};

const meta: Meta<typeof ControlledSelectRecord> = {
    title: 'Examples/SelectComboboxVirtualized',
    component: ControlledSelectRecord,
    decorators: [
        (Story) => (
            <NextIntlClientProvider locale="en-GB" messages={storyMessages}>
                <Story />
            </NextIntlClientProvider>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'SelectComboboxVirtualized is a controlled, searchable record selector. options provide the displayed records, value stores the selected primitive, and onChange receives that value.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ControlledSelectRecord>;

export const Playground: Story = {
    name: 'Controlled playground',
};

export const States: Story = {
    render: () => <SelectRecordStates />,
};

export const All: Story = {
    name: 'All examples',
    render: () => (
        <div className="space-y-6">
            <ControlledSelectRecord />
            <SelectRecordStates />
            <ValueAndLabelExamples />
            <EmptySelectRecord />
        </div>
    ),
    parameters: {
        controls: { disable: true },
    },
};

export const Empty: Story = {
    render: () => <EmptySelectRecord />,
};

export const UseMyLocation: Story = {
    render: () => <LocationSelectRecord />,
};
