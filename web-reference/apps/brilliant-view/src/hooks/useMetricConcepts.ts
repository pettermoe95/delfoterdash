import type { ExtensiveDashboardConceptMetric } from '@bv/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '~/api/queryKeys.ts';
import { apiService } from '~/api/service.ts';

export function useMetricConcepts(showHiddenConcepts = false) {
    return useQuery({
        queryKey: [QUERY_KEY.METRIC_CONCEPTS] as const,
        queryFn: () =>
            apiService.getData<ExtensiveDashboardConceptMetric[]>(
                'v1/concepts/metrics'
            ),
        select: (concepts) =>
            showHiddenConcepts
                ? concepts
                : concepts.filter((concept) => !concept.hidden),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 5,
    });
}
