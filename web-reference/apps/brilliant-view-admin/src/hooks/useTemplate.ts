import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import type {
    AdminTemplateListing,
    TemplateStatus,
} from '~/components/library/sharedTemplateTypes';
import { generatePath } from 'react-router-dom';

export type UpdateTemplate = {
    name?: string;
    graph_query?: unknown;
    graph_display?: unknown;
    graph_type_id?: number;
    status?: TemplateStatus;
};

export function useTemplate(templateId?: number | string) {
    const {
        data: template,
        isError,
        isLoading,
    } = useQuery({
        queryKey: ['template', templateId] as const,
        queryFn: () =>
            apiService.getData<AdminTemplateListing>(
                generatePath('/v1/admin/library/templates/:id', {
                    id: String(templateId),
                })
            ),
        enabled: templateId != undefined,
    });
    return { template, isError, isLoading };
}

export function useTemplateMutation(templateId?: number | string) {
    const client = useQueryClient();
    const updateTemplate = useMutation({
        mutationFn: async (update: UpdateTemplate) => {
            return apiService.patchData<AdminTemplateListing, UpdateTemplate>(
                generatePath('/v1/admin/library/templates/:id', {
                    id: templateId?.toString() ?? '',
                }),
                update
            );
        },
        onSettled: () => {
            void client.invalidateQueries({
                queryKey: ['template', templateId] as const,
            });
        },
    });
    return { updateTemplate };
}
