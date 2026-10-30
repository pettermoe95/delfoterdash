import type { Dashboard } from '@bv/api';
import { PERMISSION, useAccount } from '~/features/auth';

type DashboardWithOwner = Pick<Dashboard, 'created_by'> | null | undefined;

export function useDashboardEditPermission(dashboard?: DashboardWithOwner) {
    const { account, hasPermission } = useAccount();

    const hasEditPermission = hasPermission(PERMISSION.DASHBOARDS_EDIT);
    const accountId = account?.id;
    const ownerId = dashboard?.created_by?.id;
    const isOwner = Boolean(ownerId && accountId === ownerId);

    return {
        hasEditPermission,
        isOwner,
        canEditDashboard: hasEditPermission && isOwner,
    };
}
