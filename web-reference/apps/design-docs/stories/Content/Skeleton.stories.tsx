// skeleton react storybook
import { Skeleton } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Skeleton> = {
    title: 'Core/Content/Skeleton',
    component: Skeleton,
    argTypes: {
        shape: {
            options: ['circle', 'rectangle', 'square'],
            defaultValue: 'rectangle',
            control: {
                type: 'select',
            },
        },
    },
};

export default meta;

export const Default: StoryObj<typeof Skeleton> = {
    render: (args) => <Skeleton className="h-16 w-1/2" {...args} />,
};
