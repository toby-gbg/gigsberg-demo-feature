import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

const meta = {
    title: 'UI/Accordion',
    component: Accordion,
    parameters: {
        layout: 'centered',
    },
    args: {
        defaultValue: ['tickets'],
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <Accordion {...args}>
            <AccordionItem value="tickets">
                <AccordionTrigger>When will I receive my tickets?</AccordionTrigger>
                <AccordionContent>
                    Tickets are delivered before the event using the delivery method shown at
                    checkout.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="guarantee">
                <AccordionTrigger>Is my order guaranteed?</AccordionTrigger>
                <AccordionContent>
                    Every order is covered by the Gigsberg buyer guarantee.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
};
