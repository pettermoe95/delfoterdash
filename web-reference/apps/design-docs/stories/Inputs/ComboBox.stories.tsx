import type { SelectOption } from '@brilliant/bds-core';
import { ComboBox } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta: Meta<typeof ComboBox> = {
    title: 'Core/Inputs/ComboBox',
    component: ComboBox,
    tags: ['autodocs'],
    argTypes: {
        onChange: { action: 'changed' },
    },
};
export default meta;

type Story = StoryObj<typeof ComboBox>;

const options: SelectOption[] = [
    {
        value: 'year',
        label: 'Year',
    },
    {
        value: 'quarter',
        label: 'Quarter',
    },
    {
        value: 'month',
        label: 'Month',
    },
    {
        value: 'week',
        label: 'Week',
    },
    {
        value: 'date',
        label: 'Date',
    },
] satisfies SelectOption[];

function toSingleValue(value: string | string[]): string | undefined {
    return typeof value === 'string' ? value : value[0];
}

export const Primary: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>();
        return (
            <ComboBox
                {...args}
                value={value}
                onChange={(nextValue) => setValue(toSingleValue(nextValue))}
            />
        );
    },
    args: {
        placeholder: 'Select a time option',
        options,
    },
};

export const WithLabel: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>();
        return (
            <ComboBox
                {...args}
                value={value}
                onChange={(nextValue) => setValue(toSingleValue(nextValue))}
            />
        );
    },
    args: {
        label: 'Choose a time option',
        placeholder: 'Select a time option',
        options,
    },
};

export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>('activities');
        return (
            <ComboBox
                {...args}
                value={value}
                onChange={(nextValue) => setValue(toSingleValue(nextValue))}
            />
        );
    },
    args: {
        label: 'Disabled ComboBox',
        options,
        disabled: true,
    },
};
