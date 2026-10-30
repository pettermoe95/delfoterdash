import { RadioGroup, RadioGroupItem } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RadioGroup> = {
    title: 'Core/Inputs/RadioGroup',
    component: RadioGroup,
    args: {
        disabled: false,
    },
};

export default meta;

export const Default: StoryObj<typeof RadioGroup> = {
    render: (args) => (
        <RadioGroup defaultValue="option-one" {...args}>
            <RadioGroupItem
                id="option-one"
                value="option-one"
                label="Option Two"
                supportingText="Some supporting text"
            />
            <RadioGroupItem
                id="option-two"
                value="option-two"
                label="Option Two"
            />
        </RadioGroup>
    ),
};
