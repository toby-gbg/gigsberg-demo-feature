import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const meta = {
    title: 'UI/Tooltip',
    component: Tooltip,
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <TooltipProvider>
                <Story />
            </TooltipProvider>
        ),
    ],
    render: (args) => (
        <Tooltip {...args}>
            <TooltipTrigger aria-label="More information" className="rounded-full text-gray-600">
                <Info aria-hidden="true" size={20} />
            </TooltipTrigger>
            <TooltipContent>Helpful context</TooltipContent>
        </Tooltip>
    ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithArrow: Story = {
    render: (args) => (
        <Tooltip {...args}>
            <TooltipTrigger aria-label="More information" className="rounded-full text-gray-600">
                <Info aria-hidden="true" size={20} />
            </TooltipTrigger>
            <TooltipContent showArrow>Helpful context</TooltipContent>
        </Tooltip>
    ),
};
