import { AuthBoundary } from '~/features/auth';
import type { PropsWithChildren } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';

type DashboardAuthBoundary = {} & PropsWithChildren;

export function DashboardAuthBoundary({ children }: DashboardAuthBoundary) {
    const dashboardQuery = useDashboardData();
    const { canEditDashboard } = useDashboardEditPermission(
        dashboardQuery.data
    );

    return (
        <AuthBoundary isAuthorized={canEditDashboard}>{children}</AuthBoundary>
    );
}
