import { Sidebar } from '@bv/ui';
import WideAdminLogo from '~/assets/adminlogo_blue.png';
import { useAuthentication } from '~/hooks/useAuthentication';
import { APP_ROUTES } from '~/routes/routes';

// Keep this item separate so its position in the sidebar is easy to change.
const delfoterArcadeItem = {
    icon: 'ph:game-controller',
    text: 'Delfoter Arcade',
    href: APP_ROUTES.delfoter_arcade,
};

const navigationItems = {
    items: [
        {
            icon: 'bv:users',
            text: 'Customers',
            href: APP_ROUTES.customers,
        },
        delfoterArcadeItem,
        {
            icon: 'bv:dashboard',
            text: 'Graph Library',
            href: APP_ROUTES.library,
        },
        {
            icon: 'ph:robot',
            text: 'Assistant',
            href: APP_ROUTES.assistant,
        },
    ],
    secondaryItems: [],
};

export function AdminSidebar() {
    const { auth, logOut } = useAuthentication();

    if (!auth?.user) return null;

    return (
        <Sidebar
            navigation={navigationItems}
            logoSrc={WideAdminLogo}
            account={auth.user}
            handleLogOut={logOut}
        />
    );
}
