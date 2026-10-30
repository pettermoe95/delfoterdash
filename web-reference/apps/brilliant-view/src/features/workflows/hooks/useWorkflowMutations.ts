import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateWorkflowParams } from '../api/types';
import { workflowsEndpoints } from '../api/workflows';
import { WORKFLOWS_QUERY_KEY } from './useListWorkflows';

export function useUpdateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workflowId, enabled }: UpdateWorkflowParams) =>
            workflowsEndpoints.updateWorkflow({ workflowId, enabled }),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: WORKFLOWS_QUERY_KEY,
            });
        },
    });
}
