import type { DashboardDetails } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';

export const useDashboardDetails = (dashboardId: number) => {
    const { isLoading, isError, data, error } = useQuery<DashboardDetails>({
        queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        queryFn: () => API.getDashboard(dashboardId),
        enabled: !Number.isNaN(dashboardId),
        staleTime: 1000 * 60,
        refetchInterval: 1000 * 60,
        refetchOnWindowFocus: true,
    });

    if (Number.isNaN(dashboardId)) {
        return {
            isLoading: false,
            isError: false,
            data: undefined,
            error: undefined,
        };
    }

    return { isLoading, isError, data, error };
};
