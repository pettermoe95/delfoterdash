// Graphs

import type { DashboardDetails } from '@bv/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys.ts';
import { useDashboardId } from '~/features/dashboards/hooks';
import { useMutateGlobalFilterValue } from '~/hooks/useGlobalFilters.ts';

export function useUpdateDashboardFilter() {
    const client = useQueryClient();
    const dashboardId = useDashboardId();
    const globalValueMutation = useMutateGlobalFilterValue(dashboardId);
    const enableFilter = useMutation({
        mutationKey: ['enableDashboardFilter'],
        mutationFn: (concept: string) => {
            let alreadyEnabled = false;
            client.setQueryData<DashboardDetails>(
                [QUERY_KEY.DASHBOARD, dashboardId] as const,
                (existing: DashboardDetails | undefined) => {
                    if (!existing) return existing;
                    if (existing.global_filters.includes(concept)) {
                        alreadyEnabled = true;
                        return existing;
                    }
                    return {
                        ...existing,
                        global_filters: [...existing.global_filters, concept],
                    };
                }
            );
            if (alreadyEnabled) {
                return Promise.resolve({
                    concept,
                    dashboard_id: dashboardId,
                });
            }
            return API.enableGlobalFilters({
                dashboard_id: dashboardId,
                concept,
            });
        },
    });
    const disableFilter = useMutation({
        mutationKey: ['disableDashboardFilter'],
        mutationFn: (concept: string) => {
            client.setQueryData<DashboardDetails>(
                [QUERY_KEY.DASHBOARD, dashboardId] as const,
                (existing: DashboardDetails | undefined) => {
                    if (!existing) return existing;
                    return {
                        ...existing,
                        global_filters: existing.global_filters.filter(
                            (f) => f !== concept
                        ),
                    };
                }
            );
            globalValueMutation.remove(concept);
            return API.disableGlobalFilters({
                dashboard_id: dashboardId,
                concept,
            });
        },
    });

    return { enableFilter, disableFilter };
}
