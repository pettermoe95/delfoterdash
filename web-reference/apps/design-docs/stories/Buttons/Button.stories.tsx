import { Button, bvIconNames } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const iconNames = bvIconNames.map((name) => `bv:${name}`);

const meta: Meta<typeof Button> = {
    title: 'Core/Buttons/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        size: {
            options: ['sm', 'md', 'lg'],
            control: {
                type: 'select',
            },
        },
        variant: {
            options: ['filled', 'outlined', 'ghost'],
            defaultValue: 'filled',
            control: {
                type: 'select',
            },
        },
        color: {
            options: ['primary', 'secondary', 'gray', 'error'],
            defaultValue: 'primary',
            control: { type: 'select' },
        },
        disabled: {
            type: 'boolean',
        },
        leftIcon: {
            options: iconNames,
            control: { type: 'select' },
        },
        rightIcon: {
            options: iconNames,
            control: { type: 'select' },
        },
    },
    args: {
        size: 'md',
        variant: 'filled',
        children: 'Action',
        color: 'primary',
        disabled: false,
        leftIcon: 'bv:placeholder',
        rightIcon: 'bv:placeholder',
    },
};

export default meta;

export const Default: StoryObj<typeof Button> = {
    render: (args) => <Button {...args} />,
};

export const Ghost: StoryObj<typeof Button> = {
    args: {
        variant: 'ghost',
        color: 'gray',
    },
};

export const Dark: StoryObj<typeof Button> = {
    args: {
        variant: 'ghost',
        color: 'primary',
        size: 'md',
        children: 'Action',
    },
    render: (args) => (
        <div data-theme="dark">
            <Button {...args} />
        </div>
    ),
};

export const AsChild: StoryObj<typeof Button> = {
    render: (args) => (
        <Button {...args} asChild>
            <a href="https://google.no" target="_blank">
                Google
            </a>
        </Button>
    ),
};
