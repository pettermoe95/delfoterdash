import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockTimeScalar2D } from '../../Utility/mock_data';
import { CalendarGraph } from './CalendarGraph';

const meta: Meta<typeof CalendarGraph> = {
    title: 'Graph/CalendarGraph',
    component: CalendarGraph,
};

export default meta;

const data = mockTimeScalar2D();
function CalendarStory() {
    return (
        <Row>
            <div style={{ width: '30em', height: '20em' }}>
                <Card width="100%" height="100%">
                    <CalendarGraph data={data} limitLow={30} limitHigh={50} />
                </Card>
            </div>
        </Row>
    );
}
export const Default: StoryObj<typeof CalendarGraph> = {
    render: () => CalendarStory(),
};

export const Large: StoryObj<typeof CalendarGraph> = {
    render: () => CalendarStory(),
};
export const Sizes: StoryObj<typeof CalendarGraph> = {
    render: () => (
        <GraphSizeStory
            generator={() => (
                <CalendarGraph data={data} limitLow={30} limitHigh={50} />
            )}
        />
    ),
};
