import type { NavLinkItem } from './NavLink';

export const mockedNavigationItems: NavLinkItem[] = [
    {
        icon: 'bv:home',
        text: 'Home',
        href: '/',
        exact: true,
    },
    {
        icon: 'bv:dashboard',
        text: 'Dashboard',
        href: '/dashboard',
        items: [
            {
                icon: 'bv:list',
                text: 'Overview',
                href: '/dashboard',
                exact: true,
            },
            {
                icon: 'bv:star',
                text: 'Favorites',
                href: '/dashboard/favorites',
            },
        ],
    },
    {
        icon: 'bv:workflow',
        text: 'Workflow',
        href: '/workflow',
        items: [
            {
                icon: 'bv:list',
                text: 'Overview',
                href: '/workflow',
                exact: true,
            },
            {
                icon: 'bv:plus',
                text: 'Create Workflow',
                href: '/workflow/create',
            },
            {
                icon: 'bv:search',
                text: 'Search for Workflow',
                href: '/workflow/search',
            },
        ],
    },
    {
        icon: 'bv:users',
        text: 'Users',
        href: '/users',
    },
];

export const mockedSecondaryNavigationItems: NavLinkItem[] = [
    {
        icon: 'bv:settings',
        text: 'Settings',
        href: '/settings',
        items: [
            {
                icon: 'bv:list',
                text: 'Overview',
                href: '/settings',
                exact: true,
            },
            {
                icon: 'bv:users',
                text: 'Users',
                href: '/settings/users',
            },
        ],
    },
    {
        icon: 'bv:support',
        text: 'Support',
        href: '/support',
    },
];
