import type { SidebarNavigationItems } from '@bv/ui';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { APP_ROUTES } from '~/routes/routes';
import { useMemo } from 'react';

type SidebarNavItem = SidebarNavigationItems['items'][number];
type NavItemWithPermission = SidebarNavItem & {
    requiredPermission?: string;
    requiredPermissionsAny?: string[];
};

const baseItems: NavItemWithPermission[] = [
    {
        icon: 'bv:dashboard',
        text: 'sidebar.navItemDashboards',
        href: APP_ROUTES.dashboardsOverview,
    },
    {
        icon: 'bv:source',
        text: 'sidebar.navItemWorkflows',
        href: APP_ROUTES.workflows,
        requiredPermissionsAny: [
            PERMISSION.WORKFLOWS_READ,
            PERMISSION.CREDENTIAL_MANAGE,
        ],
    },
    {
        icon: 'bv:star',
        text: 'sidebar.navItemConcepts',
        href: APP_ROUTES.concepts,
        requiredPermission: PERMISSION.CONCEPTS_EDIT,
    },
    {
        icon: 'bv:table',
        text: 'sidebar.navItemIntrospection',
        href: APP_ROUTES.introspection,
        requiredPermission: PERMISSION.DATA_WAREHOUSE_INTROSPECT,
    },
    {
        icon: 'bv:users',
        text: 'sidebar.navItemUsers',
        href: APP_ROUTES.users,
    },
];

const secondaryItems: NavItemWithPermission[] = [
    {
        icon: 'bv:settings',
        text: 'sidebar.navItemSettings',
        href: APP_ROUTES.settings,
    },
];

type HasPermission = (permission: string) => boolean;

function filterItems(
    items: NavItemWithPermission[],
    hasPermission: HasPermission,
    localize: (key: string) => string
) {
    return items
        .filter((item) =>
            item.requiredPermissionsAny
                ? item.requiredPermissionsAny.some(hasPermission)
                : item.requiredPermission
                  ? hasPermission(item.requiredPermission)
                  : true
        )
        .map(({ icon, href, text }) => ({
            icon,
            href,
            text: localize(text),
        }));
}

function createNavigationItems(
    hasPermission: HasPermission,
    localize: (key: string) => string
): SidebarNavigationItems {
    return {
        items: filterItems(baseItems, hasPermission, localize),
        secondaryItems: filterItems(secondaryItems, hasPermission, localize),
    };
}

export function useNavigationItems() {
    const { hasPermission } = useAccount();
    const localize = useLocalize();
    return useMemo(
        () => createNavigationItems(hasPermission, localize),
        [hasPermission, localize]
    );
}
