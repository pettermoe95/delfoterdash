import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockSeries2D } from '../../Utility/mock_data';
import { AxisGraph } from './AxisGraph';
import customColorsArgs from './sb-story-data/customColor.json';

const meta = {
    component: AxisGraph,
    title: 'Graph/AxisGraph',
} satisfies Meta<typeof AxisGraph>;

export default meta;
type Story = StoryObj<typeof AxisGraph>;

const data1 = mockSeries2D(4, 5);

function AxisGraphStory() {
    const size = '25em';
    return (
        <Row gap="xl" wrap={true}>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%" header="Bar Chart">
                    <AxisGraph data={data1} />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%" header="Line Chart">
                    <AxisGraph
                        data={data1}
                        defaultDisplay={{
                            displayType: 'line',
                            curveType: 'catmullRom',
                        }}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%" header="Flipped Bar Chart">
                    <AxisGraph data={data1} flipAxis={true} />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%" header="Combined Chart">
                    <AxisGraph
                        data={data1}
                        display={{
                            '0': { displayType: 'bar' },
                            '1': { displayType: 'bar' },
                            '2': { displayType: 'line', curveType: 'linear' },
                            '3': { displayType: 'line', curveType: 'linear' },
                        }}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%" header="Stacked Bar Chart">
                    <AxisGraph data={data1} barDisplay="stack" />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card
                    width="100%"
                    height="100%"
                    header="Flipped Stacked Bar Chart"
                >
                    <AxisGraph data={data1} barDisplay="stack" flipAxis />
                </Card>
            </div>
        </Row>
    );
}

export const Default: Story = {
    render: () => AxisGraphStory(),
};

export const Sizes: Story = {
    render: () => (
        <GraphSizeStory
            generator={(size) => (
                <AxisGraph data={data1} showLegends={size > 12} />
            )}
        />
    ),
};

export const NegativeBarChartValues: Story = {
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
        data: customColorsArgs, // 2262
        showLegends: true,
        showXAxis: true,
        showYAxis: true,
        gradientBg: true,
        display: {
            '0': {
                displayType: 'bar',
                groupMode: 'group',
                color: 'blue',
                legendIndex: 0,
            },
            '1': {
                displayType: 'bar',
                groupMode: 'group',
                color: 'pink',
                legendIndex: 1,
            },
            '2': {
                displayType: 'bar',
                groupMode: 'group',
                legendIndex: 2,
            },
        },
        defaultDisplay: {
            displayType: 'bar',
        },
    },
};

export const CustomColorsStackedBars: Story = {
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
        data: customColorsArgs, // 2262
        showLegends: true,
        showXAxis: true,
        showYAxis: true,
        gradientBg: true,
        barDisplay: 'stack',
        display: {
            '0': {
                displayType: 'bar',
                groupMode: 'stack',
                color: 'green',
                legendIndex: 0,
            },
            '1': {
                displayType: 'bar',
                groupMode: 'stack',
                color: 'pink',
                legendIndex: 1,
            },
            '2': { displayType: 'bar', groupMode: 'stack', legendIndex: 2 },
        },
    },
};

export const CustomColorsLine: Story = {
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
        data: customColorsArgs, // 2262
        showLegends: true,
        showXAxis: true,
        showYAxis: true,
        gradientBg: true,
        display: {
            '0': { displayType: 'line', color: 'yellow', legendIndex: 0 },
            '1': { displayType: 'line', color: 'pink', legendIndex: 1 },
            '2': { displayType: 'line', legendIndex: 2 },
        },
        defaultDisplay: {
            displayType: 'bar',
        },
    },
};
