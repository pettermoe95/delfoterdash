import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys.ts';

export function useFieldConcepts(showHiddenConcepts = false) {
    return useQuery({
        queryKey: [QUERY_KEY.FIELD_CONCEPTS] as const,
        queryFn: () => API.listConceptFields(),
        select: (concepts) =>
            showHiddenConcepts
                ? concepts
                : concepts.filter((concept) => !concept.hidden),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
    });
}
