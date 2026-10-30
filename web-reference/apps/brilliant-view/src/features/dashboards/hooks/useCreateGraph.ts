import type { DashboardDetails } from '@bv/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { getFirstAvailableGridPosition } from '~/features/utility/functions/dashboardLayoutUtils';
import { useDashboardId } from '.';
import type { CreateGraphPayload, GraphPositionPayload } from '../api';
import { createGraphWithMovedLayouts } from '../api/createGraphWithMovedLayouts';

type UseCreateGraphParams = {
    position?: GraphPositionPayload;
    scrollToCreatedGraph?: boolean;
};

export function useCreateGraph({
    position,
    scrollToCreatedGraph = false,
}: UseCreateGraphParams) {
    const queryClient = useQueryClient();
    const dashboardId = useDashboardId();
    const dashboardQueryKey = [QUERY_KEY.DASHBOARD, dashboardId] as const;

    return useMutation({
        mutationKey: ['create-generated-graph'],
        mutationFn: async (values: CreateGraphPayload) => {
            const dashboard = await queryClient.fetchQuery<DashboardDetails>({
                queryKey: dashboardQueryKey,
                queryFn: () => API.getDashboard(dashboardId),
            });
            const layouts = dashboard.layouts;
            const resolvedPosition =
                position ?? getFirstAvailableGridPosition(layouts);

            try {
                const createdGraph = await createGraphWithMovedLayouts({
                    dashboardId,
                    layouts,
                    graph: values,
                    position: resolvedPosition,
                });

                if (scrollToCreatedGraph) {
                    setTimeout(() => {
                        const element = document.getElementById(
                            `graph-${createdGraph.id}`
                        );
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        }
                    }, 0);
                }

                return createdGraph;
            } finally {
                await queryClient.invalidateQueries({
                    queryKey: dashboardQueryKey,
                });
            }
        },
    });
}
