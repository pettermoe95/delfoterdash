import type { DashboardDetails } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { useParams } from 'react-router-dom';

export function useDashboardData() {
    const { id: dashboardId } = useParams();

    const parsedId = dashboardId ? parseInt(dashboardId) : null;

    return useQuery<DashboardDetails | null, Error>({
        queryKey: [QUERY_KEY.DASHBOARD, parsedId] as const,
        queryFn: async () => {
            if (!parsedId || isNaN(parsedId)) {
                return null;
            }

            try {
                const result = await API.getDashboard(parsedId);
                return result ?? null;
            } catch (error) {
                console.error('Error loading dashboard:', error, {
                    dashboardId: parsedId,
                });
                throw error;
            }
        },
        enabled: !!parsedId && !isNaN(parsedId),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
