import type { SelectOption } from '@brilliant/bds-core';
import { SingleSelect } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const exampleOptions = [
    {
        value: 'light',
        label: 'Light',
    },
    {
        value: 'dark',
        label: 'Dark',
    },
    {
        value: 'system',
        label: 'System',
    },
] satisfies SelectOption[];

const meta: Meta<typeof SingleSelect> = {
    title: 'Core/Inputs/SingleSelect',
    component: SingleSelect,
    args: {
        label: 'Theme',
        error: false,
        supportingText: '',
        options: exampleOptions,
    },
};

export default meta;

type Story = StoryObj<typeof SingleSelect>;

export const Primary: Story = {
    render: ({ options, ...args }) => {
        const [value, setValue] = React.useState<string | undefined>();
        return (
            <SingleSelect
                value={value}
                onChange={setValue}
                placeholder="Select an option"
                options={options}
                {...args}
            />
        );
    },
};
