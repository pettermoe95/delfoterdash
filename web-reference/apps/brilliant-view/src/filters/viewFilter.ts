import type { QueryFilter } from '~/filters/types.ts';

/**
 * This is the filter class we want to use internally in view.
 */
export abstract class ViewFilter {
    readonly concept: string;

    constructor(concept: string) {
        this.concept = concept;
    }

    /**
     * Will return an object that represents a filter the way the backend needs it.
     */
    abstract toQueryFilter(): QueryFilter;

    /**
     * Returns if the filter should be applied to queries.
     * Typically, if it has enough configuration to do anything.
     */
    abstract isActive: () => boolean;

    /**
     * We should use this structure both for saving settings in the backend,
     * and when putting params into the query string.
     */
    abstract toQueryParams(): URLSearchParams;
}
