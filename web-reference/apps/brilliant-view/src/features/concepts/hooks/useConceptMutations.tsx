import type { Concept, ConceptPayload } from '@bv/api';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY as GLOBAL_QUERY_KEY } from '~/api/queryKeys';
import { conceptsEndpoints } from '../api/concepts';
import { QUERY_KEY } from '../api/queryKeys';

const invalidateConceptQueries = (queryClient: QueryClient) => {
    void queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.CONCEPT],
    });
    void queryClient.invalidateQueries({
        queryKey: [GLOBAL_QUERY_KEY.FIELD_CONCEPTS],
    });
    void queryClient.invalidateQueries({
        queryKey: [GLOBAL_QUERY_KEY.METRIC_CONCEPTS],
    });
};

const normalizeConceptPayload = (payload: ConceptPayload): Concept => ({
    concept_name: payload.concept_name,
    concept_name_pretty: payload.concept_name_pretty,
    concept_type: payload.concept_type,
    expression: payload.expression,
    label_expression: payload.label_expression,
    unit_name: payload.unit_name ?? '',
    filters: payload.filters,
});

export const useCreateConcept = () => {
    const queryClient = useQueryClient();

    return useMutation<
        Concept,
        unknown,
        ConceptPayload,
        { previousConcepts?: Concept[] }
    >({
        mutationFn: (payload) => conceptsEndpoints.createConcept(payload),
        onMutate: async (newConcept) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY.CONCEPT] });

            const previousConcepts = queryClient.getQueryData<Concept[]>([
                QUERY_KEY.CONCEPT,
            ]);
            const optimisticConcept = normalizeConceptPayload(newConcept);

            queryClient.setQueryData<Concept[]>([QUERY_KEY.CONCEPT], (old) => [
                ...(old ?? []),
                optimisticConcept,
            ]);

            return { previousConcepts };
        },
        onError: (_err, _newConcept, context) => {
            if (context?.previousConcepts) {
                queryClient.setQueryData(
                    [QUERY_KEY.CONCEPT],
                    context.previousConcepts
                );
            }
        },
        onSettled: () => invalidateConceptQueries(queryClient),
    });
};

export const useUpdateConcept = () => {
    const queryClient = useQueryClient();

    return useMutation<
        Concept,
        unknown,
        ConceptPayload,
        { previousConcepts?: Concept[] }
    >({
        mutationFn: (payload) => conceptsEndpoints.updateConcept(payload),
        onMutate: async (updatedConcept) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY.CONCEPT] });

            const previousConcepts = queryClient.getQueryData<Concept[]>([
                QUERY_KEY.CONCEPT,
            ]);
            const optimisticConcept = normalizeConceptPayload(updatedConcept);

            queryClient.setQueryData<Concept[]>([QUERY_KEY.CONCEPT], (old) =>
                (old ?? []).map((c) =>
                    c.concept_name === optimisticConcept.concept_name
                        ? { ...c, ...optimisticConcept }
                        : c
                )
            );

            return { previousConcepts };
        },
        onError: (_err, _updated, context) => {
            if (context?.previousConcepts) {
                queryClient.setQueryData(
                    [QUERY_KEY.CONCEPT],
                    context.previousConcepts
                );
            }
        },
        onSettled: () => invalidateConceptQueries(queryClient),
    });
};

export const useDeleteConcept = () => {
    const queryClient = useQueryClient();

    return useMutation<void, unknown, string, { previousConcepts?: Concept[] }>(
        {
            mutationFn: (conceptName) =>
                conceptsEndpoints.deleteConcept(conceptName),
            onMutate: async (conceptName) => {
                await queryClient.cancelQueries({
                    queryKey: [QUERY_KEY.CONCEPT],
                });

                const previousConcepts = queryClient.getQueryData<Concept[]>([
                    QUERY_KEY.CONCEPT,
                ]);

                queryClient.setQueryData<Concept[]>(
                    [QUERY_KEY.CONCEPT],
                    (old) =>
                        (old ?? []).filter(
                            (concept) => concept.concept_name !== conceptName
                        )
                );

                return { previousConcepts };
            },
            onError: (_err, _conceptName, context) => {
                if (context?.previousConcepts) {
                    queryClient.setQueryData(
                        [QUERY_KEY.CONCEPT],
                        context.previousConcepts
                    );
                }
            },
            onSettled: () => invalidateConceptQueries(queryClient),
        }
    );
};
