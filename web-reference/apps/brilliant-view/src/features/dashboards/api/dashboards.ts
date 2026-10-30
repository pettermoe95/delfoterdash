import type { Concept, Dashboard, DashboardDetails } from '@bv/api';
import { normalizeDashboardDetails } from '@bv/api';
import { apiService } from '~/api/service';
import type { QueryFilter } from '~/filters/types';
import { duplicateDashboardResponseSchema } from './schema';
import type {
    CreateDashboardGraphPayload,
    CreateDashboardGraphResponse,
    GraphPositionPayload,
} from './schema';

interface DashboardConcept {
    concept: string;
    dashboard_id: number;
}

type GlobalFilterValue = {
    name: string;
    value: QueryFilter;
};

type GlobalFilterValueResponse = {
    values: GlobalFilterValue[];
};

type SetGlobalFilterValuesRequest = {
    values: GlobalFilterValue[];
};

type SetGlobalFilterValuesResponse = {
    success: boolean;
};

type RemoveGlobalFilterValuesRequest = {
    filters: string[];
};

type RemoveGlobalFilterValuesResponse = {
    success: boolean;
};

export type DashboardDisplayPayload = Exclude<
    Dashboard['display'],
    null | undefined
>;

export const dashboardEndpoints = {
    duplicateDashboard: (dashboardId: number) =>
        apiService
            .postData<
                unknown,
                Record<string, never>
            >(`v1/dashboards/${dashboardId}/duplicate`, {})
            .then((response) =>
                duplicateDashboardResponseSchema.parse(response)
            ),
    getDashboard: (dashboardId: number) =>
        apiService
            .getData<DashboardDetails>(`v1/dashboards/${dashboardId}`)
            .then((dashboard) => normalizeDashboardDetails(dashboard)),
    createDashboardGraph: (
        dashboardId: number,
        payload: CreateDashboardGraphPayload
    ) =>
        apiService.postData<
            CreateDashboardGraphResponse,
            CreateDashboardGraphPayload
        >(`v1/dashboards/${dashboardId}/graphs`, payload),
    updateDashboardGraphPositions: (
        dashboardId: number,
        positions: Record<number, GraphPositionPayload>
    ) =>
        apiService.postData<
            void,
            { positions: Record<number, GraphPositionPayload> }
        >(`v1/dashboards/${dashboardId}/update-positions`, { positions }),
    listGlobalFilters: () => apiService.getData<Concept[]>('v1/global_filters'),
    enableGlobalFilters: (params: DashboardConcept) =>
        apiService.postData<DashboardConcept, { concept: string }>(
            `v1/dashboards/${params.dashboard_id}/global_filters/enable`,
            { concept: params.concept }
        ),
    disableGlobalFilters: (params: DashboardConcept) =>
        apiService.postData<DashboardConcept, { concept: string }>(
            `v1/dashboards/${params.dashboard_id}/global_filters/disable`,
            { concept: params.concept }
        ),
    getDashboardGlobalFilterValues: (dashboardId: number) => {
        return apiService.getData<GlobalFilterValueResponse>(
            `v1/dashboards/${dashboardId}/global_filters`
        );
    },
    setDashboardGlobalFilterValues: (
        dashboardId: number,
        values: GlobalFilterValue[]
    ) => {
        return apiService.postData<
            SetGlobalFilterValuesResponse,
            SetGlobalFilterValuesRequest
        >(`v1/dashboards/${dashboardId}/global_filters`, {
            values,
        });
    },
    deleteDashboardGlobalFilterValue: (
        dashboardId: number,
        concept: string
    ) => {
        return apiService.deleteData<
            RemoveGlobalFilterValuesResponse,
            RemoveGlobalFilterValuesRequest
        >(`v1/dashboards/${dashboardId}/global_filters`, {
            filters: [concept],
        });
    },
    setDashboardDisplay: (
        dashboardId: number,
        display: DashboardDisplayPayload
    ) =>
        apiService.postData<string, { display: DashboardDisplayPayload }>(
            `v1/dashboards/${dashboardId}/display`,
            { display }
        ),
};
