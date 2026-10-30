import { bvIconNames, IconButton } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const iconNames = bvIconNames.map((name) => `bv:${name}`);

const meta: Meta<typeof IconButton> = {
    title: 'Core/Buttons/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    argTypes: {
        size: {
            options: ['xs', 'sm', 'md', 'lg'],
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
        icon: {
            options: iconNames,
            control: { type: 'select' },
        },
    },
    args: {
        size: 'md',
        variant: 'filled',
        color: 'primary',
        disabled: false,
        icon: 'bv:placeholder',
    },
};

export default meta;

export const Default: StoryObj<typeof IconButton> = {};

export const LinkButton: StoryObj<typeof IconButton> = {
    args: {
        variant: 'ghost',
    },
    render: (args) => (
        <IconButton {...args} asChild>
            <a href="https://brilliant.nominom" target="_blank" />
        </IconButton>
    ),
};
