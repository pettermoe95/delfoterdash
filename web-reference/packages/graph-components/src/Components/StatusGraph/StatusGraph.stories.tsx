import { Card, Column, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockBitcoinPrices } from '../../Utility/mock_data';
import { StatusGraph } from './StatusGraph';

const meta: Meta<typeof StatusGraph> = {
    title: 'Graph/StatusGraph',
    component: StatusGraph,
};

export default meta;

const CARD_SIZE = '20em';

const historicData = mockBitcoinPrices(100);
const scalar = {
    domain: historicData.domainY,
    value: historicData.data[historicData.data.length - 1]?.y ?? 0,
};

function StatusGraphStory({ size }: { size?: string }) {
    return (
        <Column>
            <Row>
                <div style={{ width: size, height: `calc(${size}/2)` }}>
                    <Card width="100%" height="100%" noPadding fullContent>
                        <StatusGraph current={scalar} history={historicData} />
                    </Card>
                </div>
                <div style={{ width: size, height: `calc(${size}/2)` }}>
                    <Card width="100%" height="100%" noPadding fullContent>
                        <StatusGraph current={scalar} />
                    </Card>
                </div>
            </Row>
        </Column>
    );
}
export const Default: StoryObj<typeof StatusGraph> = {
    render: () => StatusGraphStory({ size: CARD_SIZE }),
};

export const Colors: StoryObj<typeof StatusGraph> = {
    render: () => (
        <Row>
            <div style={{ width: CARD_SIZE, height: `calc(${CARD_SIZE}/2)` }}>
                <Card width="100%" height="100%" noPadding fullContent>
                    <StatusGraph
                        current={scalar}
                        history={historicData}
                        limits={{ limitLow: 2500 }}
                    />
                </Card>
            </div>
            <div style={{ width: CARD_SIZE, height: `calc(${CARD_SIZE}/2)` }}>
                <Card width="100%" height="100%" noPadding fullContent>
                    <StatusGraph
                        current={scalar}
                        history={historicData}
                        limits={{ limitLow: 0, limitHigh: 2500 }}
                    />
                </Card>
            </div>
            <div style={{ width: CARD_SIZE, height: `calc(${CARD_SIZE}/2)` }}>
                <Card width="100%" height="100%" noPadding fullContent>
                    <StatusGraph
                        current={scalar}
                        history={historicData}
                        limits={{ limitHigh: 2000 }}
                    />
                </Card>
            </div>
        </Row>
    ),
};

export const Sizes: StoryObj<typeof StatusGraph> = {
    render: () => (
        <GraphSizeStory
            generator={() => (
                <StatusGraph current={scalar} history={historicData} />
            )}
        />
    ),
};
