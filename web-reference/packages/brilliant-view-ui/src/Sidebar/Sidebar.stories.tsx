import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import {
    mockedNavigationItems,
    mockedSecondaryNavigationItems,
} from './mockedNavigationItems';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
    title: 'Navigation/Sidebar',
    component: Sidebar,
    args: {
        minified: false,
        currentLocation: '/dashboard/overview',
        navigation: {
            items: mockedNavigationItems,
            secondaryItems: mockedSecondaryNavigationItems,
        },
    },
};

export default meta;

export const Default: StoryObj<typeof Sidebar> = {
    render: (args) => (
        <SidebarContainer>
            <Sidebar {...args} />
        </SidebarContainer>
    ),
};

function SidebarContainer({ children }: PropsWithChildren) {
    return <div style={{ height: '450px' }}>{children}</div>;
}
