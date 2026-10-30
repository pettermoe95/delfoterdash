import { createSafeContext } from '@brilliant/bds-core';

type AddComponentsContextValue = {
    search?: string;
    setSearch?: (filter: string) => void;
};

export const [ComponentFiltersProvider, useComponentFilters] =
    createSafeContext<AddComponentsContextValue>(
        'ComponentsPane: Context error'
    );
