import { PreviewGraphPanel } from '@brilliant/components';
import type { Meta, StoryContext, StoryFn, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import { GraphStoryWrapper } from '../storyDecorators/GraphStoryWrapper';
import { KpiGraph } from './KpiGraph';

// Mock progress line data (12 months)
const mockProgressLineData = [45, 50, 55, 53, 60, 65, 70, 72, 68, 74, 76, 80];
const labels = [
    'Jan 2025',
    'Feb 2025',
    'Mar 2025',
    'Apr 2025',
    'May 2025',
    'Jun 2025',
    'Jul 2025',
    'Aug 2025',
    'Sep 2025',
    'Oct 2025',
    'Nov 2025',
    'Dec 2025',
];

const meta: Meta<typeof KpiGraph> = {
    title: 'Graph/KpiGraph',
    component: KpiGraph,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://embed.figma.com/design/I4QfhZaAXexPG8SL9EAyM8/Brilliant-View-Design-System?node-id=2542-106145&m=dev&embed-host=share',
        },
    },
    decorators: [
        (Story: StoryFn, context: StoryContext) => {
            const isDocs = context.viewMode === 'docs';

            /**
             * This do the tricks when we want different styles
             * on decorator components for docs and storybook stories.
             */
            const panelStyles: CSSProperties = isDocs
                ? {
                      width: 'initial',
                      justifyContent: 'unset',
                      display: 'flex',
                      left: 'initial',
                      position: 'relative',
                  }
                : {
                      justifyContent: 'center',
                      display: 'flex',
                      left: 0,
                      position: 'fixed',
                      width: 'calc(100vw - var(--edit-panel-width, 380px))',
                  };

            return (
                <GraphStoryWrapper isDocs={isDocs}>
                    <PreviewGraphPanel styles={panelStyles}>
                        <Story />
                    </PreviewGraphPanel>
                </GraphStoryWrapper>
            );
        },
    ],
};

export default meta;

export const Default: StoryObj<typeof KpiGraph> = {
    args: {
        target: 34,
        unit: 'kr',
        currentValue: 1586,
        previousValue: 76,
        progressLineData: mockProgressLineData,
        labels: labels,
    },
};

export const BelowGoal: StoryObj<typeof KpiGraph> = {
    args: {
        unit: '%',
        currentValue: 60,
        target: 100,
        previousValue: 90,
        progressLineData: [40, 50, 60, 55, 60, 62, 58, 59, 61, 63, 65, 60],
        labels: labels,
        period: 'month',
    },
};

export const NoGoal: StoryObj<typeof KpiGraph> = {
    args: {
        currentValue: 40,
        unit: '%',
        target: 0,
        previousValue: 35,
        progressLineData: [20, 25, 30, 28, 35, 37, 38, 39, 40],
        labels: labels,
    },
};

export const Sizes: StoryObj<typeof KpiGraph> = {
    args: {
        currentValue: 40,
        unit: '%',
        target: 0,
        previousValue: 35,
        progressLineData: [20, 25, 30, 28, 35, 37, 38, 39, 40],
        labels: labels,
    },
};
