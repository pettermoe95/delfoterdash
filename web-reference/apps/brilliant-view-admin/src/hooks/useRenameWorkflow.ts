import { useMutation } from '@tanstack/react-query';
import { apiService } from '~/api/service';

type RenameWorkflowParams = {
    workflowId: string;
    name: string;
};

type RenameWorkflowRequest = {
    name: string;
};

export const useRenameWorkflow = () => {
    return useMutation({
        mutationFn: (params: RenameWorkflowParams) => {
            return apiService.postData<void, RenameWorkflowRequest>(
                `/v1/admin/workflows/${params.workflowId}/rename`,
                { name: params.name }
            );
        },
    });
};
