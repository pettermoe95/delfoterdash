import type { Meta, StoryObj } from '@storybook/react';

import { Row } from '../../../Layout';
import { Tooltip } from './Tooltip';
// import { IconButton, Button } from "../../Action";
import { Icon } from '@iconify/react';
import React from 'react';

const meta: Meta<typeof Tooltip> = {
    title: 'Content/Tooltip',
    component: Tooltip,
};

export default meta;

export const Standard: StoryObj<typeof Tooltip> = {
    render: () => (
        <Row>
            <Tooltip trigger={'Text trigger'}>Some helpful tooltip</Tooltip>
            <Tooltip trigger={<button>Button Trigger</button>}>Some helpful tooltip</Tooltip>
            {/* 
            <Tooltip trigger={<IconButton icon="mdi:gear" />}>
                Some helpful tooltip
            </Tooltip>
*/}
        </Row>
    ),
};

export const Custom: StoryObj<typeof Tooltip> = {
    render: () => (
        <Row>
            <Tooltip trigger={<button>Button Trigger</button>}>
                <Row>
                    <Icon icon="mdi:star" />
                    Cool tooltip
                    <Icon icon="mdi:star" />
                </Row>
            </Tooltip>
        </Row>
    ),
};
