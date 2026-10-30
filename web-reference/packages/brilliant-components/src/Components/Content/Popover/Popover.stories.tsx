import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from './Popover';
import { Column, Row } from '../../../Layout';
//import { Button } from '@brilliant/bds-core';
//import { IconButton, IconButtonRow } from '../../Action/IconButton/IconButton';

const meta: Meta<typeof Popover> = {
    title: 'Content/Popover',
    component: Popover,
};

export default meta;

const content = (
    <Column width="20em" align="flex-start">
        <h2>Hello There</h2>
        <p>Some cool description</p>
        {/*  <Button color="positive">Buy Now</Button> */}
    </Column>
);
export const Primary: StoryObj<typeof Popover> = {
    render: () => (
        <Row>
            <Popover trigger={'Text trigger'}>{content}</Popover>
            {/*
            <Popover trigger={<Button>Button Trigger</Button>}>{content}</Popover>
            <Popover trigger={<IconButton icon="mdi:gear" />}>{content}</Popover>
            
            */}
        </Row>
    ),
};

export const Large: StoryObj<typeof Popover> = {
    render: () => (
        <Row>
            <Popover trigger={<button>Click Me</button>}>
                <Column width="20em" align="flex-start">
                    <Row width="100%" justify="space-between">
                        <h1>Hello</h1>
                    </Row>
                    {/*
                    <Button>Some button</Button>
                    <Button>Some button</Button>
                    <Button>Some button</Button>
                    <h2>World</h2>
                    <Row width="100%" justify="space-between">
                        <h1>Hello</h1>
                        <IconButtonRow buttons={[{ icon: 'mdi:gear' }, { icon: 'mdi:close' }, { icon: 'mdi:info' }]} />
                    </Row>
                    <Button>Some button</Button>
                    <Button>Some button</Button>
                    <Button>Some button</Button>
        
        */}
                </Column>
            </Popover>
        </Row>
    ),
};
