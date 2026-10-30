import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import type {
    SemanticGraph,
    SemanticModelDeleteTarget,
    WarehouseSchema,
} from './semanticModel';
import {
    normaliseGraph,
    semanticApiBody,
    semanticApiError,
    semanticPath,
} from './semanticModelApi';

export type SemanticModelRequest = {
    method: 'post' | 'patch' | 'delete';
    suffix: string;
    body: Record<string, unknown>;
};

export function useSemanticModel({
    tenantId,
    onSaved,
    onSuccess,
    onError,
    onRefreshError,
    onDeleteSuccess,
    onDeleteError,
}: {
    tenantId: string;
    onSaved: (request: SemanticModelRequest) => void;
    onSuccess: () => void;
    onError: (error: string) => void;
    onRefreshError: (error: string) => void;
    onDeleteSuccess: () => void;
    onDeleteError: (
        targets: SemanticModelDeleteTarget[],
        error: string
    ) => void;
}) {
    const queryClient = useQueryClient();
    const queryKey = ['semantic-graph', tenantId] as const;
    const warehouseKey = ['warehouse-schema', tenantId] as const;
    const graph = useQuery<SemanticGraph>({
        queryKey,
        retry: false,
        queryFn: async () =>
            normaliseGraph(
                await apiService.getData(semanticPath(tenantId, '/graph'))
            ),
    });
    const warehouse = useQuery<WarehouseSchema>({
        queryKey: warehouseKey,
        queryFn: () =>
            apiService.getData(semanticPath(tenantId, '/warehouse-schema')),
    });
    const refresh = () =>
        queryClient.invalidateQueries({ queryKey }, { throwOnError: true });
    const request = useMutation({
        mutationFn: ({ method, suffix, body }: SemanticModelRequest) =>
            method === 'post'
                ? apiService.postData(
                      semanticPath(tenantId, suffix),
                      semanticApiBody(body)
                  )
                : method === 'patch'
                  ? apiService.patchData(
                        semanticPath(tenantId, suffix),
                        semanticApiBody(body)
                    )
                  : apiService.deleteData(semanticPath(tenantId, suffix), body),
        onSuccess: async (_, modelRequest) => {
            onSaved(modelRequest);
            try {
                await refresh();
            } catch (error) {
                onRefreshError(semanticApiError(error));
                return;
            }
            onSuccess();
        },
        onError: (nextError) => onError(semanticApiError(nextError)),
    });

    const deleteElements = useMutation({
        mutationFn: async (targets: SemanticModelDeleteTarget[]) => {
            const orderedTargets = [
                ...targets.filter((target) => target.kind === 'edge'),
                ...targets.filter((target) => target.kind === 'role'),
            ];
            const failedTargets: SemanticModelDeleteTarget[] = [];
            const errors: string[] = [];
            for (const target of orderedTargets) {
                const name =
                    target.kind === 'role'
                        ? target.value.relationName
                        : target.value.relationshipName;
                const resource =
                    target.kind === 'role' ? 'relations' : 'relationships';
                try {
                    await apiService.deleteData(
                        semanticPath(
                            tenantId,
                            `/${resource}/${encodeURIComponent(name)}`
                        ),
                        {}
                    );
                } catch (error) {
                    failedTargets.push(target);
                    errors.push(
                        `${target.kind === 'role' ? 'Role' : 'Relationship'} "${name}": ${semanticApiError(error)}`
                    );
                }
            }
            return {
                failedTargets,
                errors,
                deletedCount: targets.length - failedTargets.length,
            };
        },
        onSuccess: async ({ failedTargets, errors, deletedCount }) => {
            if (failedTargets.length) {
                onDeleteError(failedTargets, errors.join('\n'));
            }
            if (!deletedCount) return;

            try {
                await refresh();
            } catch (error) {
                if (failedTargets.length) {
                    onDeleteError(
                        failedTargets,
                        [
                            ...errors,
                            `Could not refresh the graph: ${semanticApiError(error)}`,
                        ].join('\n')
                    );
                } else {
                    onRefreshError(semanticApiError(error));
                }
                return;
            }
            if (!failedTargets.length) onDeleteSuccess();
        },
        onError: (error) => onError(semanticApiError(error)),
    });

    const refreshGraph = useMutation({
        mutationFn: refresh,
        onSuccess,
        onError: (error) => onRefreshError(semanticApiError(error)),
    });

    return { graph, warehouse, request, deleteElements, refreshGraph };
}
