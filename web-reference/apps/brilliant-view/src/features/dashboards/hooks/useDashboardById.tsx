import type { DashboardDetails } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';

export function useDashboardById(dashboardId?: number | null) {
    return useQuery<DashboardDetails | null, Error>({
        queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        queryFn: async () => {
            if (!dashboardId) {
                return null;
            }

            try {
                const result = await API.getDashboard(dashboardId);
                return result ?? null;
            } catch (error) {
                console.error('Error loading dashboard:', error, {
                    dashboardId,
                });
                throw error;
            }
        },
        enabled: !!dashboardId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
