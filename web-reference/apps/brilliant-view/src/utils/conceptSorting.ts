import type { Concept } from '@bv/api';

/*** Sorting **/
export const byGlobalDefaultThenByPrettyName = (a: Concept, b: Concept) => {
    const aGlobalDefault = a.source?.global_default ?? Infinity;
    const bGlobalDefault = b.source?.global_default ?? Infinity;

    if (aGlobalDefault !== bGlobalDefault) {
        return aGlobalDefault - bGlobalDefault;
    }

    // If both have the same global_default (or both undefined), fallback to
    // alphabetical sort
    const aName = a.concept_name_pretty ?? '';
    const bName = b.concept_name_pretty ?? '';

    return aName.localeCompare(bName);
};
