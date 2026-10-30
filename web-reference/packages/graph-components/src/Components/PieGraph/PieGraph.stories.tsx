import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import type { DiscreteDimension, GraphDataScalar1D } from '../../Common/types';
import { mockPieData } from '../../Utility/mock_data';
import { PieGraph } from './PieGraph';

const meta: Meta<typeof PieGraph> = {
    title: 'Graph/PieGraph',
    component: PieGraph,
};

export default meta;
type Story = StoryObj<typeof PieGraph>;

const pieData = mockPieData();
const pieScalar: GraphDataScalar1D<DiscreteDimension> = {
    domain: {
        name: 'Total',
        values: [],
    },
    value: pieData.data.reduce((acc, current) => acc + current, 0),
};

function StatusGraphStory({ size = '20em' }: { size?: string }) {
    return (
        <Row>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%">
                    <PieGraph data={pieData} metric={pieScalar} type="donut" />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%">
                    <PieGraph data={pieData} type="pie" />
                </Card>
            </div>
        </Row>
    );
}
export const Default: StoryObj<typeof PieGraph> = {
    render: () => StatusGraphStory({ size: '20em' }),
};

export const Sizes: StoryObj<typeof PieGraph> = {
    render: () => (
        <GraphSizeStory
            generator={() => (
                <PieGraph data={pieData} metric={pieScalar} type="donut" />
            )}
        />
    ),
};

export const CustomPieColors: Story = {
    decorators: [
        (Story) => (
            <div style={{ height: 'calc(100vh - 5rem)' }}>
                <Card width="100%" height="100%">
                    <Story />
                </Card>
            </div>
        ),
    ],
    args: {
        data: pieData,
        metric: pieScalar,
        display: {
            colors: ['#1FB6FF', '#FFD700', '#43E6A0', '#FF69B4'],
        },
        type: 'pie',
        showLabels: true,
        showLegends: true,
    },
};

export const CustomDonutColors: Story = {
    decorators: [
        (Story) => (
            <div style={{ height: 'calc(100vh - 5rem)' }}>
                <Card width="100%" height="100%">
                    <Story />
                </Card>
            </div>
        ),
    ],
    args: {
        data: pieData,
        metric: pieScalar,
        display: {
            colors: ['#1FB6FF', '#FFD700', '#43E6A0', '#FF69B4'],
        },
        type: 'donut',
        showLabels: true,
        showLegends: true,
    },
};
