import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockScalar1D } from '../../Utility/mock_data';
import { GaugeGraph } from './GaugeGraph';

const meta: Meta<typeof GaugeGraph> = {
    title: 'Graph/GaugeGraph',
    component: GaugeGraph,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://embed.figma.com/design/I4QfhZaAXexPG8SL9EAyM8/Brilliant-View-Design-System?node-id=416-5200&m=dev&embed-host=share',
        },
    },
};

export default meta;
type Story = StoryObj<typeof GaugeGraph>;

const gaugeData1 = mockScalar1D();
const gaugeData2 = mockScalar1D();
const gaugeData3 = mockScalar1D();
function GaugeStory({ size = '20em' }: { size?: string }) {
    console.log('gaugeData1', gaugeData1);

    return (
        <Row>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%">
                    <GaugeGraph
                        data={gaugeData1}
                        target={30}
                        limitLow={30}
                        limitHigh={30}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%">
                    <GaugeGraph
                        data={gaugeData2}
                        target={70}
                        limitLow={70}
                        limitHigh={70}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: size }}>
                <Card width="100%" height="100%">
                    <GaugeGraph data={gaugeData3} />
                </Card>
            </div>
        </Row>
    );
}
export const Default: StoryObj<typeof GaugeGraph> = {
    render: () => GaugeStory({ size: '20em' }),
};

export const Sizes: StoryObj<typeof GaugeGraph> = {
    render: () => (
        <GraphSizeStory generator={() => <GaugeGraph data={gaugeData1} />} />
    ),
};

export const CustomColors: Story = {
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
        data: {
            domain: {
                max: 100,
                min: 0,
                name: 'Prosent',
                unit: '%',
            },
            value: 51.60633951816743,
        },
        display: {
            min: 0, // ✅ required by type
            max: 100, // ✅ required by type
            display: { displayType: 'gauge' },
            color: '#FF69B4',
        },
        target: 50,
        limitHigh: 80,
        limitLow: 20,
    },
};
