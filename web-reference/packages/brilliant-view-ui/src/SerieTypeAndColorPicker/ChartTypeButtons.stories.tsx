import { DASHBOARD_COLORS } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';
import { ChartTypeBarsButton } from './ChartTypeButtons';

const meta = {
    component: ChartTypeBarsButton,
    title: 'View UI/SerieTypeAndColorPicker/ChartTypeButtons',
    argTypes: {
        color: {
            control: { type: 'select' },
            options: DASHBOARD_COLORS,
        },
        type: {
            control: { type: 'select' },
            options: ['line', 'bars'],
        },
    },
} satisfies Meta<typeof ChartTypeBarsButton>;
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
        title: 'Bars',
        color: 'blue',
        type: 'bar' as 'line' | 'bars',
        gradient: 'gradientBar',
        gradientUrl: 'url(#gradientBar)',
    },
};
