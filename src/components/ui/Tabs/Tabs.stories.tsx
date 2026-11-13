import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta = {
    title: 'UI/Tabs',
    component: Tabs,
    parameters: { layout: 'padded' },
    args: {
        defaultValue: 'all',
        orientation: 'horizontal',
    },
    argTypes: {
        orientation: {
            control: 'inline-radio',
            options: ['horizontal', 'vertical'],
        },
    },
    render: (args) => (
        <Tabs {...args} className="w-full">
            <TabsList
                aria-label="Help topics"
                className={args.orientation === 'vertical' ? 'max-w-56' : undefined}
            >
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buying">Buying Tickets</TabsTrigger>
                <TabsTrigger value="receiving">Receiving Tickets</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="all">All frequently asked questions.</TabsContent>
            <TabsContent value="buying">Questions about buying tickets.</TabsContent>
            <TabsContent value="receiving">Questions about receiving tickets.</TabsContent>
            <TabsContent value="payments">Questions about payments.</TabsContent>
        </Tabs>
    ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Vertical: Story = {
    args: {
        orientation: 'vertical',
    },
};
