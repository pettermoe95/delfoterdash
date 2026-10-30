import { AIButton } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AIButton> = {
    title: 'View UI/Buttons/AIButton',
    component: AIButton,
    args: {
        highlighted: false,
    },
};

export default meta;

type Story = StoryObj<typeof AIButton>;

export const Primary: Story = {
    render: (props) => <AIButton {...props} />,
};
