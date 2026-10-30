import { AICard } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AICard> = {
    title: 'View UI/Content/AICard',
    component: AICard,
};

export default meta;

type Story = StoryObj<typeof AICard>;

export const Primary: Story = {
    render: (props) => {
        return (
            <AICard className="w-min" {...props}>
                <AICard.Content className="flex h-40 w-40 items-center justify-center">
                    Some content
                </AICard.Content>
            </AICard>
        );
    },
};
