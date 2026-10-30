import type {
    Concept,
    ConceptFieldValue,
    DashboardGraph,
    DashboardGraphType,
} from '@bv/api';
import { apiService } from '~/api/service';
import type {
    CreateGraphPayload,
    GraphPromptResponse,
    GraphPromptValues,
    UpdateGraphPayload,
} from './schema';
import { graphPromptResponseSchema } from './schema';

export const graphEndpoints = {
    listGraphTypes: () =>
        apiService.getData<DashboardGraphType[]>('v1/graph_types'),
    listConceptFields: () =>
        apiService.getData<Concept[]>('v1/concepts/fields'),
    listConceptFieldValues: ({
        concept,
        filters,
    }: {
        concept?: string;
        filters?: Record<string, string[]>;
    }) => {
        if (!concept) return;

        const params =
            filters && Object.keys(filters).length > 0 ? filters : undefined;

        return apiService.getData<ConceptFieldValue[]>(
            `v1/query/concepts/${concept}/values`,
            params
        );
    },
    createGraph: (params: CreateGraphPayload) =>
        apiService.postData<DashboardGraph, CreateGraphPayload>(
            '/v1/graphs',
            params
        ),
    updateGraph: (params: {
        dashboardId: number;
        id: number;
        payload: UpdateGraphPayload;
    }) =>
        apiService.patchData<DashboardGraph, UpdateGraphPayload>(
            `/v1/dashboards/${params.dashboardId}/graphs/${params.id}`,
            params.payload
        ),
    deleteGraph: (params: { dashboardId: number; id: number }) =>
        apiService.deleteData<void, Record<string, never>>(
            `/v1/dashboards/${params.dashboardId}/graphs/${params.id}`,
            {}
        ),
    generateGraphQuery: (prompt: string): Promise<GraphPromptResponse> =>
        apiService
            .postData<GraphPromptResponse, GraphPromptValues>('/v1/llm/graph', {
                prompt,
            })
            .then((response) => graphPromptResponseSchema.parse(response))
            .catch((error) => {
                throw error;
            }),
};
