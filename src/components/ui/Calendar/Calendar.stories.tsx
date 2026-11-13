import type { Meta, StoryObj } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';

import FloatingDatePickerSelect from '@/components/FloatingDatePickerSelect';

import { Calendar } from './Calendar';

const meta = {
    title: 'UI/Calendar',
    component: Calendar,
    parameters: {
        layout: 'centered',
    },
    args: {
        mode: 'single',
        defaultMonth: new Date(2026, 7, 1),
        selected: new Date(2026, 7, 19),
    },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DropdownCaption: Story = {
    args: {
        captionLayout: 'dropdown',
        startMonth: new Date(1900, 0, 1),
        endMonth: new Date(2026, 9, 1),
    },
};

export const BirthDatePopover: Story = {
    render: () => (
        <NextIntlClientProvider locale="en-GB" messages={{ select_date: 'Select date' }}>
            <div className="w-80">
                <FloatingDatePickerSelect
                    label="Date of birth"
                    value="1990-05-12"
                    disablePastDays={false}
                    disableFutureDays
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0, 1)}
                />
            </div>
        </NextIntlClientProvider>
    ),
};
