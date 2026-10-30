import { Card, Row } from '@brilliant/components';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphSizeStory } from '../../Common/story';
import { mockTabularData } from '../../Utility/mock_data';
import { TableGraph } from './TableGraph';

const meta: Meta<typeof TableGraph> = {
    title: 'Graph/TableGraph',
    component: TableGraph,
};

export default meta;

const smallTableData = mockTabularData();
const tableData = mockTabularData(10);
const wideTableData = mockTabularData(12, 10);
const baseLongLabelData = mockTabularData(8, 4);
const longLabelData = {
    ...baseLongLabelData,
    domain: {
        ...baseLongLabelData.domain,
        labels: [
            'North region enterprise team',
            'South region operations',
            'Customer support specialist',
            'Product analytics department',
            'Finance and accounting',
            'Marketplace partnerships',
            'Platform reliability',
            'Growth and lifecycle',
        ],
    },
};

export const Default: StoryObj<typeof TableGraph> = {
    render: () => (
        <Row>
            <div style={{ width: 'auto', height: 'auto' }}>
                <Card header="Normal table" width="100%" height="100%">
                    <TableGraph data={smallTableData} />
                </Card>
            </div>
        </Row>
    ),
};
export const Sticky: StoryObj<typeof TableGraph> = {
    render: () => (
        <Row>
            <div style={{ width: 'auto', height: '250px' }}>
                <Card header="Sticky header" width="100%" height="100%">
                    <TableGraph data={tableData} stickyHeader />
                </Card>
            </div>
        </Row>
    ),
};
export const HorizontalVerticalScroll: StoryObj<typeof TableGraph> = {
    render: () => (
        <Row>
            <div style={{ width: '350px', height: '350px' }}>
                <Card header="Horizontal scroll" width="100%" height="100%">
                    <TableGraph data={tableData} stickyHeader />
                </Card>
            </div>
        </Row>
    ),
};

export const Sizes: StoryObj<typeof TableGraph> = {
    render: () => (
        <GraphSizeStory
            generator={() => <TableGraph data={tableData} stickyHeader />}
        />
    ),
};

export const StickyDomainColumn: StoryObj<typeof TableGraph> = {
    render: () => (
        <Row>
            <div style={{ width: '420px', height: '300px' }}>
                <Card header="Sticky domain column" width="100%" height="100%">
                    <TableGraph data={wideTableData} stickyHeader />
                </Card>
            </div>
        </Row>
    ),
};

export const LongDomainLabels: StoryObj<typeof TableGraph> = {
    render: () => (
        <Row>
            <div style={{ width: '430px', height: '300px' }}>
                <Card header="Long domain labels" width="100%" height="100%">
                    <TableGraph data={longLabelData} stickyHeader />
                </Card>
            </div>
        </Row>
    ),
};
