import type { Meta, StoryObj } from '@storybook/react';

import DateRangePicker from './DateRangePicker';

const meta = {
    title: 'UI/Date Range Picker',
    component: DateRangePicker,
    parameters: {
        layout: 'centered',
    },
    args: {
        value: {
            from: new Date(2026, 7, 19),
            to: new Date(2026, 7, 21),
        },
        onChange: (dates) => {
            console.log(dates);
        },
    },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
    args: {
        value: undefined,
        onChange: () => {},
    },
};
