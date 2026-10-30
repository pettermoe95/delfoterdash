import type { SelectOption } from '@brilliant/bds-core';
import type { Concept } from '@bv/api';
import { ViewFilterFactory } from '~/filters/factory';
import { IncludeFilter } from '~/filters/filters';
import type { QueryFilter } from '~/filters/types';
import type { ViewFilter } from '~/filters/viewFilter';
import { byGlobalDefaultThenByPrettyName } from '~/utils/conceptSorting';

export type ConceptFilter = NonNullable<Concept['filters']>[number];

// safely convert API query-filter objects into UI ViewFilter instances
// unknown structures are returned as null so callers can passthrough
const toViewFilter = (filter: ConceptFilter): ViewFilter | null => {
    try {
        return ViewFilterFactory.fromQueryFilter(filter as QueryFilter);
    } catch {
        return null;
    }
};

// build sorted options from concept field data
export const buildConceptFieldOptions = (
    conceptFields?: Concept[]
): SelectOption[] | undefined => {
    return conceptFields
        ?.slice()
        ?.sort(byGlobalDefaultThenByPrettyName)
        .map(
            ({ concept_name, concept_name_pretty }): SelectOption => ({
                value: concept_name,
                label: concept_name_pretty || concept_name,
            })
        );
};

// split concept filters into
// - editable: filters the current UI can represent as ViewFilter
// - passthrough: filters we preserve unchanged (unsupported/invalid/date filters)
export const splitConceptFilters = (filters: ConceptFilter[]) => {
    return filters.reduce<{
        editable: ViewFilter[];
        passthrough: ConceptFilter[];
    }>(
        (acc, filter) => {
            const viewFilter = toViewFilter(filter);

            if (viewFilter && viewFilter.concept !== 'date') {
                acc.editable.push(viewFilter);
                return acc;
            }

            acc.passthrough.push(filter);
            return acc;
        },
        { editable: [], passthrough: [] }
    );
};

// check if an editable filter already exists for a concept
export const hasEditableFilterForConcept = (
    editable: ViewFilter[],
    concept: string
): boolean => editable.some((filter) => filter.concept === concept);

// add an empty include filter for a concept if it does not already exist
export const addEditableFilterIfMissing = (
    editable: ViewFilter[],
    concept: string
): ViewFilter[] => {
    if (hasEditableFilterForConcept(editable, concept)) {
        return editable;
    }

    return [...editable, new IncludeFilter(concept, [])];
};

// set the editable filter for a concept, replacing any existing one
export const setEditableFilter = (
    editable: ViewFilter[],
    nextFilter: ViewFilter
): ViewFilter[] => {
    const existingIndex = editable.findIndex(
        (filter) => filter.concept === nextFilter.concept
    );

    if (existingIndex === -1) {
        return [...editable, nextFilter];
    }

    return editable.map((filter, index) =>
        index === existingIndex ? nextFilter : filter
    );
};

// remove the editable filter for a concept
export const removeEditableFilter = (
    editable: ViewFilter[],
    concept: string
): ViewFilter[] => {
    return editable.filter((filter) => filter.concept !== concept);
};

// "clear" a concept filter by resetting it to an empty include filter
// this keeps the filter row present in the UI while making it inactive
export const clearEditableFilter = (
    editable: ViewFilter[],
    concept: string
): ViewFilter[] => {
    return setEditableFilter(editable, new IncludeFilter(concept, []));
};

// drop filters that parse to inactive ViewFilter instances
// filters that cannot be parsed are kept to avoid destructive data loss
export const cleanFilters = (filters: ConceptFilter[]): ConceptFilter[] => {
    return filters.filter((filter) => {
        const viewFilter = toViewFilter(filter);

        if (!viewFilter) {
            return true;
        }

        return viewFilter.isActive();
    });
};
