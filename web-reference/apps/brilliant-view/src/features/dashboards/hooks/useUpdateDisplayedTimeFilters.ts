import type { DashboardDetails } from '@bv/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import type { DashboardDisplayPayload } from '../api/dashboards';

export function useUpdateDisplayedTimeFilters(
    dashboardId: number | undefined,
    dashboardDisplay: DashboardDisplayPayload | undefined
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: string[]) => {
            if (!dashboardId) return;
            await API.setDashboardDisplay(dashboardId, {
                ...(dashboardDisplay ?? {}),
                displayedTimeFilters: values,
            });
        },
        onSuccess: (_, values) => {
            queryClient.setQueryData<DashboardDetails | undefined>(
                [QUERY_KEY.DASHBOARD, dashboardId],
                (existing) => {
                    if (!existing) return existing;
                    return {
                        ...existing,
                        display: {
                            ...(existing.display ?? {}),
                            displayedTimeFilters: values,
                        },
                    };
                }
            );
        },
    });
}
