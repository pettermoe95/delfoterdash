import type { Concept } from '@bv/api';

export const filterConceptsByType = (concepts: Concept[] = []) => {
    return concepts.reduce(
        (acc, concept) => {
            const conceptType = concept.concept_type;
            if (conceptType === 'field') acc.fields.push(concept);
            else if (conceptType === 'metric') acc.metrics.push(concept);
            return acc;
        },
        { fields: [] as Concept[], metrics: [] as Concept[] }
    );
};
