import type { Dialog } from '@brilliant/bds-core';
import { Label, Textarea } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Dialog> = {
    title: 'Core/Inputs/Textarea',
    component: Textarea,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Primary: Story = {
    render: () => {
        return (
            <div>
                <Label htmlFor="message">Your message</Label>
                <Textarea placeholder="Type your message here." id="message" />
            </div>
        );
    },
};
