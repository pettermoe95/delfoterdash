import type { DashboardConceptMetric } from '@bv/api';

export function filterConcepts<TConcept extends DashboardConceptMetric>(
    concepts: TConcept[],
    search: string | undefined,
    excludeConceptName: boolean,
    minQueryLength = 2,
    sortByPrettyName = true
) {
    const query = search?.trim().toLowerCase() ?? '';

    const matchesQuery = (concept: TConcept) => {
        if (query.length < minQueryLength) {
            return true;
        }

        const prettyName = concept.concept_name_pretty?.toLowerCase() ?? '';

        if (excludeConceptName) {
            return prettyName.includes(query);
        }

        return (
            prettyName.includes(query) ||
            concept.concept_name.toLowerCase().includes(query)
        );
    };

    const filteredConcepts = concepts.filter(matchesQuery);

    if (!sortByPrettyName) {
        return filteredConcepts;
    }

    const sortedConcepts = [...filteredConcepts].sort((a, b) =>
        (a.concept_name_pretty ?? '').localeCompare(b.concept_name_pretty ?? '')
    );

    return sortedConcepts;
}
