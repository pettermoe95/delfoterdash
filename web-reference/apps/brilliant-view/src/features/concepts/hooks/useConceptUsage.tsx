import type { ConceptStats } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { conceptsEndpoints } from '../api/concepts';
import { QUERY_KEY } from '../api/queryKeys';

export const useConceptStats = (conceptName?: string) => {
    const enabled = Boolean(conceptName);

    return useQuery<ConceptStats>({
        queryKey: [QUERY_KEY.CONCEPT_USAGE, conceptName] as const,
        queryFn: () => conceptsEndpoints.conceptUsage(conceptName as string),
        enabled,
    });
};
