import { useQuery } from '@tanstack/react-query';
import type { WorkflowListItem } from '../api/types';
import { workflowsEndpoints } from '../api/workflows';
import { mapWorkflow } from '../utils/workflowUtils';

export const WORKFLOWS_QUERY_KEY = ['workflows'] as const;

export function useListWorkflows() {
    return useQuery({
        queryKey: WORKFLOWS_QUERY_KEY,
        queryFn: workflowsEndpoints.listWorkflows,
        select: (response): WorkflowListItem[] =>
            response.workflows.map(mapWorkflow),
    });
}
