import { DASHBOARD_COLORS } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorIcon } from './ColorIcon';

// Storybook configuration for ColorIcon component

const meta = {
    component: ColorIcon,
    title: 'View UI/SerieTypeAndColorPicker/ColorIcon',
    argTypes: {
        color: {
            control: { type: 'select' }, // or 'select'
            options: DASHBOARD_COLORS,
        },
        selected: {
            control: { type: 'boolean' },
        },
    },
} satisfies Meta<typeof ColorIcon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const BarButton: Story = {
    decorators: [
        (Story) => (
            <div style={{ margin: '3em', width: '200px' }}>
                <Story />
            </div>
        ),
    ],
    args: {
        color: 'blue',
        selected: false,
    },
};
