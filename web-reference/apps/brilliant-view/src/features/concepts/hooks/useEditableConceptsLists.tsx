import type { Concept } from '@bv/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { conceptsEndpoints } from '../api/concepts';
import { QUERY_KEY } from '../api/queryKeys';

export const useEditableConceptsList = () => {
    const config = {
        queryKey: [QUERY_KEY.CONCEPT] as const,
        queryFn: () => conceptsEndpoints.listEditableConcepts(),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 60, // 1 hour
    };

    return useQuery<Concept[]>(config);
};
