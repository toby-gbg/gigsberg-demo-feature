import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker } from './DatePicker';

const meta = {
    title: 'UI/Date Picker',
    component: DatePicker,
    parameters: {
        layout: 'centered',
    },
    args: {
        'aria-label': 'Date',
        defaultValue: new Date(2026, 7, 19),
    },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
    args: {
        defaultValue: undefined,
    },
};
