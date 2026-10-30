import type { DashboardShares } from '@bv/api';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';

export function useDashboardShares(
    dashboardId?: number,
    enabled = true
): UseQueryResult<DashboardShares, Error> {
    return useQuery<DashboardShares, Error>({
        queryKey: [QUERY_KEY.DASHBOARD_SHARES, dashboardId] as const,
        queryFn: () => API.getDashboardShares(dashboardId as number),
        enabled: enabled && dashboardId !== undefined,
        staleTime: 1000 * 60,
    });
}
