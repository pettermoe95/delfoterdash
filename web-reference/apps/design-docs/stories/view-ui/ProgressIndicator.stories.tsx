import type { ProgressIndicatorStep } from '@bv/ui';
import { ProgressIndicator, ProgressIndicatorSteps } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProgressIndicator> = {
    title: 'View UI/Navigation/ProgressIndicator',
    component: ProgressIndicator,
};

export default meta;

type Story = StoryObj<typeof ProgressIndicator>;

const exampleSteps = [
    {
        key: 'step-1',
        label: 'Step 1',
    },
    {
        key: 'step-2',
        label: 'Step 2',
    },
    {
        key: 'step-3',
        label: 'Step 3',
        description: 'Optional description',
    },
] satisfies ProgressIndicatorStep[];

export const Default: Story = {
    args: {
        steps: exampleSteps,
        vertical: false,
    },
    render: (args) => (
        <ProgressIndicator {...args}>
            <ProgressIndicatorSteps />
        </ProgressIndicator>
    ),
};
