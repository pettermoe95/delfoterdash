import type { Meta, StoryObj } from '@storybook/react';

import type { Tab, TabBarProps, TabOption } from './TabBar';
import { TabBar } from './TabBar';
import { useState } from 'react';
import { Column, Gap, Row } from '../../../Layout';
import { Icon } from '@iconify/react';

const meta: Meta<typeof TabBar> = {
    title: 'Navigation/TabBar',
    component: TabBar,
};

export default meta;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
const tabs: Tab<string>[] = [
    { key: 1, label: 'Tab One' },
    { key: 2, label: 'Tab Two' },
    { key: 3, label: 'Tab Three' },
];

const iconTabs: Tab<string>[] = [
    {
        key: 1,
        label: (
            <Row gap="m" justify="space-between" width="100%">
                <span>Dashboard</span>
                <Icon icon="material-symbols:grid-view-outline-rounded" />
            </Row>
        ),
    },
    {
        key: 2,
        label: (
            <Row gap="m" justify="space-between" width="100%">
                <span>Graphs</span>
                <Icon icon="mdi:graph-box-outline" />
            </Row>
        ),
    },
    {
        key: 3,
        label: (
            <Row gap="m" justify="space-between" width="100%">
                <span>Reports</span>
                <Icon icon="mdi:database" />
            </Row>
        ),
    },
    {
        key: 4,
        label: (
            <Row gap="m" justify="space-between" width="100%">
                <span>Settings</span>
                <Icon icon="mdi:gear-outline" />
            </Row>
        ),
    },
];

const spacerTabs: (Tab<string> | 'spacer')[] = [iconTabs[0], 'spacer', iconTabs[1], iconTabs[2], 'spacer', iconTabs[3]];

function TabBarStory(props?: Partial<TabBarProps<string>>): JSX.Element {
    const [tab, setTab] = useState<Tab<string>>(tabs[0]);
    return <TabBar tabs={tabs} selected={tab} onSetTab={setTab} {...props} />;
}

export const CompleteExample: StoryObj<typeof TabBar> = {
    render: () => TabBarStory({ tabs: customTabs, paddingSides: 'l', paddingTop: 'm', header: <h2>Custom Header</h2> }),
};

export const Default: StoryObj<typeof TabBar> = {
    render: () => TabBarStory(),
};

export const DefaultWithIcons: StoryObj<typeof TabBar> = {
    render: () => TabBarStory({ tabs: iconTabs }),
};

export const Independent: StoryObj<typeof TabBar> = {
    render: () => TabBarStory({ look: 'independent' }),
};

export const IndependentWithIcons: StoryObj<typeof TabBar> = {
    render: () => TabBarStory({ look: 'independent', tabs: iconTabs }),
};

export const VerticalWithIcons: StoryObj<typeof TabBar> = {
    render: () => <Column>{TabBarStory({ vertical: true, tabs: iconTabs })}</Column>,
};

export const IndependentVerticalWithIcons: StoryObj<typeof TabBar> = {
    render: () => <Column>{TabBarStory({ look: 'independent', vertical: true, tabs: iconTabs })}</Column>,
};

export const SpacerExample: StoryObj<typeof TabBar> = {
    render: () => TabBarStory({ tabs: spacerTabs }),
};

const customTabs: TabOption<string>[] = [
    {
        key: 'header',
        label: (
            <Row width="auto">
                <b>Brilliant Tabs</b>
                <Gap size="m" />
            </Row>
        ),
        unmanaged: true,
    },
    iconTabs[0],
    iconTabs[1],
    iconTabs[2],
    'spacer',
    {
        key: 'tools',
        label: (
            <Row width="auto" gap="l">
                <Icon icon="mdi:info-outline" />
                <Icon icon="mdi:person" />
                <Icon icon="material-symbols:list-rounded" />
            </Row>
        ),
        unmanaged: true,
    },
];

export const CustomContentVerticalExample: StoryObj<typeof TabBar> = {
    render: () => (
        <Column width="15em" align="stretch">
            {TabBarStory({
                tabs: customTabs,
                paddingSides: 'l',
                paddingTop: 'm',
                header: <h2>Header</h2>,
                vertical: true,
            })}
        </Column>
    ),
};
