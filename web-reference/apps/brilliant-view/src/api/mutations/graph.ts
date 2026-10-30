import type { DashboardDetails, DashboardLayoutItem } from '@bv/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import type { UpdateGraphPayload } from '~/features/dashboards/api';
import { useDashboardId } from '~/features/dashboards/hooks';

export function useUpdateGraph(layout?: DashboardLayoutItem) {
    const client = useQueryClient();
    const dashboardId = useDashboardId();

    return useMutation({
        mutationKey: ['updateGraph', dashboardId, layout?.graph.id],
        mutationFn: (payload: UpdateGraphPayload) => {
            if (!layout) {
                throw new Error('Cannot update graph without a layout');
            }

            return API.updateGraph({
                dashboardId,
                id: layout.graph.id,
                payload,
            });
        },
        onSuccess: () =>
            client.invalidateQueries({
                queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
            }),
    });
}

export function useDeleteGraph() {
    const client = useQueryClient();
    const dashboardId = useDashboardId();

    return useMutation({
        mutationKey: ['deleteGraph', dashboardId],
        mutationFn: (layout: DashboardLayoutItem) =>
            API.deleteGraph({
                dashboardId,
                id: layout.graph.id,
            }),
        onMutate: (layout) => {
            const dashboardKey = [QUERY_KEY.DASHBOARD, dashboardId] as const;
            const previousDashboard =
                client.getQueryData<DashboardDetails>(dashboardKey);

            client.setQueryData<DashboardDetails>(dashboardKey, (old) => {
                if (!old) return old;

                return {
                    ...old,
                    layouts: old.layouts.filter(
                        (oldLayout) => oldLayout.id !== layout.id
                    ),
                };
            });

            return { previousDashboard };
        },
        onError: (_error, _layout, context) => {
            client.setQueryData(
                [QUERY_KEY.DASHBOARD, dashboardId] as const,
                context?.previousDashboard
            );
        },
        onSettled: () =>
            client.invalidateQueries({
                queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
            }),
    });
}
