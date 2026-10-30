import { Chip, chipColors, chipSizes } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Chip> = {
    title: 'Core/Content/Chip',
    component: Chip,
    argTypes: {
        color: {
            options: chipColors,
            control: {
                type: 'select',
            },
        },
        size: {
            options: chipSizes,
            control: {
                type: 'select',
            },
        },
    },
    args: {
        text: 'Badge',
        color: 'brand',
        size: 'sm',
    },
};

export default meta;

export const Default: StoryObj<typeof Chip> = {
    render: (args) => <Chip {...args} />,
};
