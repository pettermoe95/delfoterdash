import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '~/api/service.ts';

export type WorkflowInfo = {
    id: string;
    name: string;
    enabled: boolean;
    lastStart: Date | null;
};

type WorkflowListingResponse = {
    id: string;
    name: string;
    enabled: boolean;
    last_start: number | null;
};

type ListWorkflowResponse = {
    isLoading: boolean;
    workflows: WorkflowInfo[] | null;
};

export function useWorkflowListing(
    tenantId: string | undefined
): ListWorkflowResponse {
    const { isLoading, data } = useQuery<WorkflowListingResponse[]>({
        queryKey: ['workflows', tenantId] as const,
        queryFn: tenantId
            ? () =>
                  apiService.getData<WorkflowListingResponse[]>(
                      `/v1/admin/workflows/list/${tenantId}`
                  )
            : skipToken,
    });

    if (tenantId == undefined) {
        return { isLoading: false, workflows: null };
    }

    if (isLoading || data == undefined) {
        return { isLoading: true, workflows: null };
    }

    const items = data.map((workflow) => {
        const lastStart =
            workflow.last_start == null || workflow.last_start === 0
                ? null
                : new Date(workflow.last_start);
        return {
            id: workflow.id,
            name: workflow.name,
            enabled: workflow.enabled,
            lastStart,
        };
    });
    return { isLoading: false, workflows: items };
}

type CreateWorkflowParams = {
    tenantId: string;
    name: string;
};

type CreateWorkflowRequest = {
    tenant_id: string;
    name: string;
};

type CreateWorkflowResponse = {
    workflow_id: string;
};

export const useCreateWorkflow = () => {
    return useMutation({
        mutationFn: (params: CreateWorkflowParams) => {
            const request = {
                tenant_id: params.tenantId,
                name: params.name,
            };
            return apiService.postData<
                CreateWorkflowResponse,
                CreateWorkflowRequest
            >('/v1/admin/workflows', request);
        },
    });
};

export const useEnableWorkflow = () => {
    return useMutation({
        mutationFn: (workflowId: string) =>
            apiService.postData(`/v1/admin/workflows/${workflowId}/enable`, {}),
    });
};

export const useDisableWorkflow = () => {
    return useMutation({
        mutationFn: (workflowId: string) =>
            apiService.postData(
                `/v1/admin/workflows/${workflowId}/disable`,
                {}
            ),
    });
};

export const useDeleteWorkflow = () => {
    return useMutation({
        mutationFn: (workflowId: string) =>
            apiService.deleteData<void, Record<string, never>>(
                `/v1/admin/workflows/${workflowId}`,
                {}
            ),
    });
};
