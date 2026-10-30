import type {
    AddDashboardLayout,
    DashboardDetails,
    DashboardLayoutItem,
    UpdateDashboardLayoutBatch,
} from '@bv/api';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { useSetDashboardQueryStatus } from '~/features/dashboards/store';
import { createPlaceholderLayout } from './dashboardUtils';

type AddLayoutType = UseMutationResult<
    AddDashboardLayout,
    unknown,
    AddDashboardLayout,
    { previousDashboard: DashboardDetails | undefined }
>;

type RemoveLayoutType = UseMutationResult<
    DashboardLayoutItem,
    unknown,
    DashboardLayoutItem,
    { previousDashboard: DashboardDetails | undefined }
>;

type UpdateLayoutType = UseMutationResult<
    UpdateDashboardLayoutBatch,
    unknown,
    UpdateDashboardLayoutBatch,
    { previousDashboard: DashboardDetails | undefined }
>;

/**
 * Mutation for adding a layout to a dashboard
 * @param dashboard The dashboard to add to
 */
export function useAddLayoutMutation(
    dashboard: DashboardDetails
): AddLayoutType {
    const queryClient = useQueryClient();
    const dashboardKey = [QUERY_KEY.DASHBOARD, dashboard.id] as const;
    const allDashboardsKey = [QUERY_KEY.DASHBOARD] as const;
    const setDashboardStatus = useSetDashboardQueryStatus();

    return useMutation({
        mutationFn: (layout) => {
            return API.addDashboardLayout(dashboard.id, layout);
        },
        onMutate: (layout) => {
            setDashboardStatus('loading');
            const previousDashboard =
                queryClient.getQueryData<DashboardDetails>(dashboardKey);

            // Insert a placeholder layout temporarily to show up where layout will be placed
            queryClient.setQueryData<DashboardDetails>(
                dashboardKey,
                (dashboard) => {
                    if (dashboard == undefined) return dashboard;
                    const placeholderLayout = createPlaceholderLayout(
                        layout,
                        layout.id
                    );
                    const layouts: DashboardLayoutItem[] = [
                        placeholderLayout,
                        ...dashboard.layouts,
                    ];
                    return { ...dashboard, layouts };
                }
            );
            return { previousDashboard };
        },
        onSuccess: () => {
            setDashboardStatus('success');
            void queryClient.invalidateQueries({ queryKey: allDashboardsKey });
        },
        onError: (_err, _mut, context) => {
            setDashboardStatus('error');
            queryClient.setQueryData(dashboardKey, context?.previousDashboard);
        },
    });
}

/**
 * Mutation for removing a layout from a dashboard
 * @param dashboard Dashboard to remove from
 */
export function useRemoveLayoutMutation(
    dashboard: DashboardDetails
): RemoveLayoutType {
    const client = useQueryClient();
    const dashboardKey = [QUERY_KEY.DASHBOARD, dashboard.id];
    const allDashboardsKey = [QUERY_KEY.DASHBOARD] as const;
    const setDashboardStatus = useSetDashboardQueryStatus();

    return useMutation({
        mutationFn: (layout) =>
            API.deleteDashboardLayout(dashboard.id, layout.id),
        onMutate: (layout: DashboardLayoutItem) => {
            setDashboardStatus('loading');
            const previousDashboard =
                client.getQueryData<DashboardDetails>(dashboardKey);
            client.setQueryData<DashboardDetails>(dashboardKey, (old) => {
                if (old !== undefined) {
                    const layouts = old.layouts.filter(
                        (oldLayout) => oldLayout.id !== layout.id
                    );
                    return { ...old, layouts };
                }
                return old;
            });
            return { previousDashboard };
        },
        onSettled: () => {
            setDashboardStatus('success');
            void client.invalidateQueries({ queryKey: allDashboardsKey });
        },
        onError: (_err, _mut, context) => {
            setDashboardStatus('error');
            client.setQueryData(dashboardKey, context?.previousDashboard);
        },
    });
}

/**
 * Mutation for updating a layout in a dashboard
 * @param dashboard Dashboard to update layout in
 */
export function useUpdateLayoutsMutation(
    dashboard: DashboardDetails
): UpdateLayoutType {
    const client = useQueryClient();

    const setDashboardStatus = useSetDashboardQueryStatus();

    return useMutation({
        mutationFn: (layouts: UpdateDashboardLayoutBatch) => {
            return API.updateDashboardLayouts(dashboard.id, layouts);
        },
        onMutate: ({ layouts: updatedLayouts }: UpdateDashboardLayoutBatch) => {
            setDashboardStatus('loading');
            const previousDashboard = client.getQueryData<DashboardDetails>([
                QUERY_KEY.DASHBOARD,
                dashboard.id,
            ]);

            // Update positions/sizes of layout in cache
            client.setQueryData<DashboardDetails>(
                [QUERY_KEY.DASHBOARD, dashboard.id] as const,
                (old) => {
                    if (old === undefined) return;
                    const newLayouts: DashboardLayoutItem[] = old.layouts.map(
                        (layoutItem) => {
                            const changedLayout = updatedLayouts.find(
                                (l) => l.id == layoutItem.id
                            );
                            return changedLayout
                                ? { ...layoutItem, ...changedLayout }
                                : layoutItem;
                        }
                    );
                    return {
                        ...old,
                        layouts: newLayouts,
                    };
                }
            );

            return { previousDashboard };
        },
        onSettled: () => {
            setDashboardStatus('success');
        },
        onError: (_err, _mut, context) => {
            setDashboardStatus('error');
            client.setQueryData(
                [QUERY_KEY.DASHBOARD, dashboard.id] as const,
                context?.previousDashboard
            );
        },
    });
}

export function useLayoutMutations(dashboard: DashboardDetails) {
    return {
        addLayout: useAddLayoutMutation(dashboard),
        removeLayout: useRemoveLayoutMutation(dashboard),
        updateLayouts: useUpdateLayoutsMutation(dashboard),
    };
}
