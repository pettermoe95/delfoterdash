import type {
    AboutMeResponse,
    AddDashboardLayout,
    Dashboard,
    DashboardDetails,
    DashboardGraphQuery,
    DashboardLayoutItem,
    DashboardMeta,
    DashboardShares,
    FilterGraphOptionPost,
    GenericData,
    GenericDataFilterObject,
    QuerySchemaRequest,
    QuerySchemaResponse,
    TokenizeRequest,
    TokenizeResponse,
    UpdateDashboardLayoutBatch,
    UpdateDashboardLayoutBatchResponse,
} from '@bv/api';
import {
    normalizeDashboardDetails,
    normalizeDashboardLayoutItem,
} from '@bv/api';
import { httpPostFunc } from '~/api/endpoints/spec';
import { dashboardApi } from '~/features/dashboards/api';
import { apiService } from '../service';

/**
 * Defines the available API endpoints.
 * See `specs.ts` for specification of each type.
 */
export const API = {
    getDataSchema: httpPostFunc<QuerySchemaRequest, QuerySchemaResponse>(
        'QuerySchema'
    ),
    getWebSocketToken: () =>
        apiService.getData<{ token: string; expiresAt: number }>('ws/token'),
    getGenericFilterData: (id: number) =>
        apiService.getData<GenericDataFilterObject>(`v1/graphs/${id}/filters`),
    postGenericFilterData: (params: {
        id: number;
        payload: FilterGraphOptionPost;
    }) =>
        apiService.postData<GenericDataFilterObject, FilterGraphOptionPost>(
            `v1/graphs/${params.id}/filters`,
            params.payload
        ),
    tokenizeQuery: httpPostFunc<TokenizeRequest, TokenizeResponse>('Tokenize'),
    getGraphDataByQuery: (query: NonNullable<DashboardGraphQuery>) =>
        apiService.postData<GenericData, NonNullable<DashboardGraphQuery>>(
            `v1/query/data`,
            query
        ),
    // Dashboard
    // Should move all of these to the dashboard API
    ...dashboardApi,
    listDashboards: () => apiService.getData<Dashboard[]>('v1/dashboards'),
    getDashboard: (dashboardId: number) =>
        apiService
            .getData<DashboardDetails>(`v1/dashboards/${dashboardId}`)
            .then((dashboard) => normalizeDashboardDetails(dashboard)),
    getDashboardShares: (dashboardId: number) =>
        apiService.getData<DashboardShares>(
            `v1/dashboards/${dashboardId}/shares`
        ),
    createDashboard: (dashboard: DashboardMeta) =>
        apiService.postData<Dashboard, DashboardMeta>(
            `v1/dashboards`,
            dashboard
        ),
    deleteDashboard: (dashboardId: number) =>
        apiService.deleteData(`v1/dashboards/${dashboardId}`, {}),
    updateDashboard: (params: {
        id: number;
        payload: Partial<DashboardMeta>;
    }) =>
        apiService.patchData<Dashboard, Partial<DashboardMeta>>(
            `v1/dashboards/${params.id}`,
            params.payload
        ),
    shareDashboardWithGroup: (dashboardId: number, groupId: number) =>
        apiService.postData<void, { id: number }>(
            `v1/dashboards/${dashboardId}/share-with-group`,
            { id: groupId }
        ),
    shareDashboardWithUser: (dashboardId: number, userId: number) =>
        apiService.postData<void, { id: number }>(
            `v1/dashboards/${dashboardId}/share-with-user`,
            { id: userId }
        ),
    stopSharingDashboardWithGroup: (dashboardId: number, groupId: number) =>
        apiService.postData<void, { id: number }>(
            `v1/dashboards/${dashboardId}/stop-sharing-with-group`,
            { id: groupId }
        ),
    stopSharingDashboardWithUser: (dashboardId: number, userId: number) =>
        apiService.postData<void, { id: number }>(
            `v1/dashboards/${dashboardId}/stop-sharing-with-user`,
            { id: userId }
        ),
    addDashboardLayout: (dashboardId: number, layout: AddDashboardLayout) =>
        apiService
            .postData<
                DashboardLayoutItem,
                AddDashboardLayout
            >(`v1/dashboards/${dashboardId}/layout`, layout)
            .then((layoutItem) => normalizeDashboardLayoutItem(layoutItem)),
    deleteDashboardLayout: (dashboardId: number, layoutId: number) =>
        apiService.deleteData<DashboardLayoutItem, Record<string, never>>(
            `v1/dashboards/${dashboardId}/layout/${layoutId}`,
            {}
        ),
    patchDashboardLayout: httpPostFunc<
        DashboardLayoutItem,
        DashboardLayoutItem
    >('v1/dashboards/:dashboardId/layout/:layoutId'),
    updateDashboardLayout: (dashboardId: number, layout: DashboardLayoutItem) =>
        apiService
            .patchData<
                DashboardLayoutItem,
                DashboardLayoutItem
            >(`v1/dashboards/${dashboardId}/layout/${layout.id}`, layout)
            .then((layoutItem) => normalizeDashboardLayoutItem(layoutItem)),
    updateDashboardLayouts: (
        dashboardId: number,
        request: UpdateDashboardLayoutBatch
    ) =>
        apiService.patchData<
            UpdateDashboardLayoutBatchResponse,
            UpdateDashboardLayoutBatch
        >(`v1/dashboards/${dashboardId}/layout`, request),
    // Authentication
    aboutMe: () => apiService.getData<AboutMeResponse>('auth/me'),
    stopImpersonating: () =>
        apiService.postData<void, Record<string, never>>(
            'auth/stop-impersonating',
            {}
        ),
};
