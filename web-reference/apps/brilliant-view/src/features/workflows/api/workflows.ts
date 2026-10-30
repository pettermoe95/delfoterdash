import { apiService } from '~/api/service';
import type { UpdateWorkflowParams, WorkflowsListResponse } from './types';

export const workflowsEndpoints = {
    listWorkflows: () =>
        apiService.getData<WorkflowsListResponse>('/v1/workflows'),
    updateWorkflow: ({ workflowId, enabled }: UpdateWorkflowParams) =>
        apiService.postData<unknown, Record<string, never>>(
            `/v1/workflows/${workflowId}/${enabled ? 'enable' : 'disable'}`,
            {}
        ),
};
