import type { DashboardShares } from '@bv/api';
import { APP_ROUTES } from '~/routes/routes';
import { generatePath } from 'react-router-dom';

export const PUBLIC_GROUP_ID = 0;

export function getDashboardShareGroupIds(shares?: DashboardShares) {
    return (
        shares?.groups
            .map((group) => group.id)
            .filter((groupId) => groupId !== PUBLIC_GROUP_ID) ?? []
    );
}

export function getDashboardShareUserIds(shares?: DashboardShares) {
    return shares?.users.map((user) => user.id) ?? [];
}

export function getDashboardPath(dashboardId: number) {
    return generatePath(APP_ROUTES.dashboard, {
        id: dashboardId.toString(),
    });
}
