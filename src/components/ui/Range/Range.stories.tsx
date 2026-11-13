import type { Meta, StoryObj } from '@storybook/react';

import { Range } from './Range';

const meta = {
    title: 'UI/Range',
    component: Range,
    parameters: {
        layout: 'centered',
    },
    args: {
        defaultValue: [25, 75],
        min: 0,
        max: 100,
        minStepsBetweenValues: 1,
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Range>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
