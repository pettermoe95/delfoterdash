import type { TooltipProps } from '@brilliant/bds-core';
import { Button, Icon, Tooltip } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Tooltip> = {
    title: 'Core/Content/Tooltip',
    component: Tooltip,
    argTypes: {
        side: {
            options: [
                'top',
                'bottom',
                'left',
                'right',
            ] satisfies TooltipProps['side'][],
            control: {
                type: 'select',
            },
        },
        align: {
            options: [
                'start',
                'center',
                'end',
            ] satisfies TooltipProps['align'][],
            control: {
                type: 'select',
            },
        },
        hideArrow: {
            type: 'boolean',
            defaultValue: 'false',
        },
    },
    args: {
        side: 'bottom',
        align: 'center',
        title: 'This is a description',
        description:
            'Tooltips are used to describe or identify an element. They help the user understand the meaning, function of an icon or button.',
    },
};
export default meta;

export const Default: StoryObj<typeof Tooltip> = {
    render: (args) => (
        <Tooltip {...args}>
            <Button size="md" variant="outlined" leftIcon="bv:plus">
                Heyo
            </Button>
        </Tooltip>
    ),
};

export const WithTextTrigger: StoryObj<typeof Tooltip> = {
    render: (args) => (
        <Tooltip {...args} side="bottom" align="start" triggerAsChild={false}>
            <Icon
                icon="bv:info-circle"
                width={24}
                color="var(--colors-primary-gray-600)"
            />
        </Tooltip>
    ),
};
