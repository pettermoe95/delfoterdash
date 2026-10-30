import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockScalar1D } from '../../Utility/mock_data';
import { ProgressGraph } from './ProgressGraph';

const meta: Meta<typeof ProgressGraph> = {
    title: 'Graph/ProgressGraph',
    component: ProgressGraph,
};

export default meta;

const progData1 = mockScalar1D();
const progData2 = mockScalar1D();
const progData3 = mockScalar1D();

function ProgressStory({ size = '20em' }: { size?: string }) {
    const hSize = `calc(${size} / 3.0)`;
    return (
        <Row>
            <div style={{ width: size, height: hSize }}>
                <Card width="100%" height="100%">
                    <ProgressGraph
                        data={progData1}
                        target={10}
                        limitLow={10}
                        limitHigh={10}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: hSize }}>
                <Card width="100%" height="100%">
                    <ProgressGraph
                        data={progData2}
                        target={70}
                        limitLow={70}
                        limitHigh={70}
                    />
                </Card>
            </div>
            <div style={{ width: size, height: hSize }}>
                <Card width="100%" height="100%">
                    <ProgressGraph data={progData3} />
                </Card>
            </div>
        </Row>
    );
}
export const Default: StoryObj<typeof ProgressGraph> = {
    render: () => ProgressStory({ size: '20em' }),
};

export const Long: StoryObj<typeof ProgressGraph> = {
    render: () => (
        <div style={{ width: '100%', height: '8em' }}>
            <Card width="100%" height="100%">
                <ProgressGraph
                    data={progData2}
                    target={70}
                    limitLow={70}
                    limitHigh={70}
                />
            </Card>
        </div>
    ),
};

export const Gradient: StoryObj<typeof ProgressGraph> = {
    render: () => (
        <Card width="100%" height="100%">
            <ProgressGraph
                data={progData3}
                gradientColors={['yellow', 'cyan']}
            />
        </Card>
    ),
};
export const Sizes: StoryObj<typeof ProgressGraph> = {
    render: () => (
        <GraphSizeStory generator={() => <ProgressGraph data={progData1} />} />
    ),
};
