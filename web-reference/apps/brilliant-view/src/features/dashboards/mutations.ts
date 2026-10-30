import type { Dashboard, DashboardMeta } from '@bv/api';
import { dashboardDisplaySchema } from '@bv/api';
import { useToastContext } from '@bv/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { queryClient } from '~/config/queryClient';
import { useLocalize } from '~/i18n/I18nContext';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useSetDashboardQueryStatus } from './store';

const DEFAULT_DISPLAYED_TIME_FILTERS = [
    'this_month',
    'this_quarter',
    'last_months_6',
    'last_months_12',
    'ytd',
] as const;

function createDashboardSchema(localize: (key: string) => string) {
    return z.object({
        name: z.string().default(localize('dashboards.create.defaultName')),
        color: z.string().default('blue'),
        icon: z.string().default('dashboard'),
        private: z.boolean().default(true),
        display: dashboardDisplaySchema.default({
            displayedTimeFilters: [...DEFAULT_DISPLAYED_TIME_FILTERS],
        }),
    });
}

export function useCreateDashboard() {
    const localize = useLocalize();

    return useMutation({
        mutationKey: ['createDashboard'],
        mutationFn: (dashboard: Partial<DashboardMeta>) => {
            const payload = createDashboardSchema(localize).parse(dashboard);
            return API.createDashboard(payload);
        },
    });
}

export function useDuplicateDashboard() {
    const localize = useLocalize();
    const { displayToast } = useToastContext();
    const client = useQueryClient();

    return useMutation({
        onError: () => {
            displayToast({
                type: 'error',
                text: localize('dashboards.duplicate.error'),
            });
        },
        mutationKey: ['duplicateDashboard'],
        mutationFn: (dashboardId: number) =>
            API.duplicateDashboard(dashboardId),
        onSuccess: () => {
            void client.invalidateQueries({
                queryKey: [QUERY_KEY.DASHBOARD] as const,
            });
        },
    });
}

type UpdateDashboardPayload = Partial<DashboardMeta>;

function updateDashboardCache(
    queryClient: ReturnType<typeof useQueryClient>,
    dashboardId: number,
    updates: Partial<Dashboard>
) {
    queryClient.setQueryData<Dashboard>(
        [QUERY_KEY.DASHBOARD, dashboardId] as const,
        (old) => (old ? { ...old, ...updates } : old)
    );

    queryClient.setQueryData<Dashboard[]>(
        [QUERY_KEY.DASHBOARD] as const,
        (old) =>
            old?.map((dashboard) =>
                dashboard.id === dashboardId
                    ? { ...dashboard, ...updates }
                    : dashboard
            )
    );
}

function invalidateDashboardQuery(
    queryClient: ReturnType<typeof useQueryClient>,
    dashboardId: number
) {
    void queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        exact: true,
    });
}

function invalidateDashboardSharesQuery(
    queryClient: ReturnType<typeof useQueryClient>,
    dashboardId: number
) {
    void queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.DASHBOARD_SHARES, dashboardId] as const,
        exact: true,
    });
}

export function useUpdateDashboard(dashboard: Dashboard) {
    const setDashboardStatus = useSetDashboardQueryStatus();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateDashboardPayload) =>
            API.updateDashboard({ id: dashboard.id, payload }),
        onMutate: (payload: UpdateDashboardPayload) => {
            setDashboardStatus('loading');
            const previousDashboard = queryClient.getQueryData<Dashboard>([
                QUERY_KEY.DASHBOARD,
                dashboard.id,
            ]);
            const previousDashboards = queryClient.getQueryData<Dashboard[]>([
                QUERY_KEY.DASHBOARD,
            ]);
            updateDashboardCache(queryClient, dashboard.id, payload);

            return {
                previousDashboard,
                previousDashboards,
            };
        },
        onSuccess: () => {
            setDashboardStatus('success');
            invalidateDashboardQuery(queryClient, dashboard.id);
        },
        onError: (_err, _var, context) => {
            setDashboardStatus('error');
            queryClient.setQueryData(
                [QUERY_KEY.DASHBOARD, dashboard.id],
                context?.previousDashboard
            );

            queryClient.setQueryData(
                [QUERY_KEY.DASHBOARD],
                context?.previousDashboards
            );
        },
    });
}

type UpdateDashboardSharingPayload = {
    name?: string;
    private: boolean;
    sharedGroupIds: number[];
    currentSharedGroupIds: number[];
    sharedUserIds: number[];
    currentSharedUserIds: number[];
};

export function useUpdateDashboardSharing(dashboard: Dashboard) {
    const setDashboardStatus = useSetDashboardQueryStatus();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            private: isPrivate,
            sharedGroupIds,
            currentSharedGroupIds,
            sharedUserIds,
            currentSharedUserIds,
        }: UpdateDashboardSharingPayload) => {
            const groupIdsToAdd = sharedGroupIds.filter(
                (groupId) => !currentSharedGroupIds.includes(groupId)
            );
            const groupIdsToRemove = currentSharedGroupIds.filter(
                (groupId) => !sharedGroupIds.includes(groupId)
            );
            const userIdsToAdd = sharedUserIds.filter(
                (userId) => !currentSharedUserIds.includes(userId)
            );
            const userIdsToRemove = currentSharedUserIds.filter(
                (userId) => !sharedUserIds.includes(userId)
            );

            await Promise.all([
                ...groupIdsToAdd.map((groupId) =>
                    API.shareDashboardWithGroup(dashboard.id, groupId)
                ),
                ...groupIdsToRemove.map((groupId) =>
                    API.stopSharingDashboardWithGroup(dashboard.id, groupId)
                ),
                ...userIdsToAdd.map((userId) =>
                    API.shareDashboardWithUser(dashboard.id, userId)
                ),
                ...userIdsToRemove.map((userId) =>
                    API.stopSharingDashboardWithUser(dashboard.id, userId)
                ),
            ]);

            const nextName = name?.trim();
            const shouldUpdateDashboardMeta =
                dashboard.private !== isPrivate ||
                (nextName !== undefined && nextName !== dashboard.name);

            if (!shouldUpdateDashboardMeta) {
                return;
            }

            await API.updateDashboard({
                id: dashboard.id,
                payload: {
                    private: isPrivate,
                    ...(nextName !== undefined ? { name: nextName } : {}),
                },
            });
        },
        onMutate: () => {
            setDashboardStatus('loading');
        },
        onSuccess: (_data, variables) => {
            setDashboardStatus('success');
            const nextName = variables.name?.trim();
            updateDashboardCache(queryClient, dashboard.id, {
                private: variables.private,
                ...(nextName !== undefined ? { name: nextName } : {}),
            });
            invalidateDashboardSharesQuery(queryClient, dashboard.id);
        },
        onError: () => {
            setDashboardStatus('error');
        },
    });
}

export function useDeleteDashboard(
    dashboard?: Dashboard,
    navigateOnDelete = true
) {
    const dashboardKey = [QUERY_KEY.DASHBOARD, dashboard?.id] as const;
    const navigate = useNavigate();

    const mutate = useMutation({
        mutationFn: () => API.deleteDashboard(dashboard?.id ?? -1),
        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: dashboardKey,
            });
            void queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.DASHBOARD] as const,
            });
            if (navigateOnDelete) {
                navigate('/dashboards/overview');
            }
        },
        onError: (err) => {
            console.error(err);
        },
    });

    return mutate;
}
