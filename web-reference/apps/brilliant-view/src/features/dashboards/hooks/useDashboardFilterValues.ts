import type { ConceptFieldValue } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { isAxiosError } from 'axios';

type RelatedFilters = Record<string, string[]>;

const MAX_FILTER_VARIANTS = 30;

/**
 * Builds an array of filter combinations for multi-value related filters.
 */
const buildFilterVariants = (
    filters: RelatedFilters = {}
): RelatedFilters[] => {
    const entries = Object.entries(filters).filter(
        ([, values]) => Array.isArray(values) && values.length > 0
    );

    if (entries.length === 0) return [{}];

    let variants: RelatedFilters[] = [{}];

    for (const [concept, values] of entries) {
        const sanitizedValues = values.filter(Boolean);
        if (sanitizedValues.length === 0) continue;

        const nextVariants: RelatedFilters[] = [];

        for (const variant of variants) {
            for (const value of sanitizedValues) {
                nextVariants.push({
                    ...variant,
                    [concept]: [value],
                });
            }
        }

        variants = nextVariants;

        if (variants.length > MAX_FILTER_VARIANTS) {
            return [filters];
        }
    }

    return variants.length > 0 ? variants : [{}];
};

/**
 * Merges and deduplicates concept field values from multiple API responses.
 */
const mergeConceptFieldValues = (
    responses: (ConceptFieldValue[] | undefined)[]
): ConceptFieldValue[] => {
    const optionMap = new Map<string, ConceptFieldValue>();

    for (const response of responses) {
        for (const option of response ?? []) {
            const key = JSON.stringify(option.value ?? null);
            if (!optionMap.has(key)) {
                optionMap.set(key, option);
            }
        }
    }

    return Array.from(optionMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
    );
};

const shouldFallbackToUnfilteredValues = (error: unknown): boolean => {
    if (!isAxiosError(error)) {
        return false;
    }

    const status = error.response?.status;
    return status === 400 || status === 422;
};

export const useDashboardFilterValues = (
    filterConcept: string,
    relatedFilters: RelatedFilters = {}
) => {
    return useQuery({
        queryKey: [
            QUERY_KEY.FIELD_CONCEPT_VALUES,
            {
                concept: filterConcept,
                filters: relatedFilters,
            },
        ] as const,
        queryFn: () =>
            (async () => {
                const filterVariants = buildFilterVariants(relatedFilters);

                try {
                    const responses = await Promise.all(
                        filterVariants.map(
                            async (filters) =>
                                (await API.listConceptFieldValues({
                                    concept: filterConcept,
                                    filters:
                                        Object.keys(filters).length > 0
                                            ? filters
                                            : undefined,
                                })) ?? []
                        )
                    );

                    return mergeConceptFieldValues(responses);
                } catch (error) {
                    if (!shouldFallbackToUnfilteredValues(error)) {
                        throw error;
                    }

                    // If cascading filters produce an invalid request,
                    // fall back to unfiltered values.
                    const fallback = await API.listConceptFieldValues({
                        concept: filterConcept,
                    });
                    return fallback ?? [];
                }
            })(),
        enabled: !!filterConcept,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};
