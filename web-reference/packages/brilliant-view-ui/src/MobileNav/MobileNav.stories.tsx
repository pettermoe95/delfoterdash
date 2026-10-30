import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import {
    mockedNavigationItems,
    mockedSecondaryNavigationItems,
} from '../Sidebar/mockedNavigationItems';
import { MobileNav } from './MobileNav';

const meta: Meta<typeof MobileNav> = {
    title: 'Navigation/MobileNav',
    component: MobileNav,
    args: {
        currentLocation: '/dashboard/overview',
        navigation: {
            items: mockedNavigationItems,
            secondaryItems: mockedSecondaryNavigationItems,
        },
        logoSrc:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEH2Et57NkPggS4gUjBUXFpzaZRfI2Ns3F8g&s',
    },
};

export default meta;

export const Default: StoryObj<typeof MobileNav> = {
    render: (args) => (
        <MobileNavContainer>
            <MobileNav {...args} />
        </MobileNavContainer>
    ),
};

function MobileNavContainer({ children }: PropsWithChildren) {
    return <div style={{ height: '450px', width: '300px' }}>{children}</div>;
}
