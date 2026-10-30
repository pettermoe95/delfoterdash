import type { SelectOption } from '@brilliant/bds-core';
import { ComboBox } from '@brilliant/bds-core';
import { GlobalFilters } from '~/features/dashboards/components/Filters/GlobalFilters';
import type { ViewFilter } from '~/filters/viewFilter';
import { useState } from 'react';

type ConceptFiltersProps = {
    conceptFieldOptions?: SelectOption[];
    editableFilters: ViewFilter[];
    localize: (key: string, vars?: Record<string, string | number>) => string;
    onAddFilter: (concept: string) => void;
    onConceptValueChange: (filter: ViewFilter) => void;
    onDeleteFilter: (concept: string) => void;
    onClearFilterValue: (concept: string) => void;
};

export function ConceptFilters({
    conceptFieldOptions,
    editableFilters,
    localize,
    onAddFilter,
    onConceptValueChange,
    onDeleteFilter,
    onClearFilterValue,
}: ConceptFiltersProps) {
    const [addFilterSelection, setAddFilterSelection] = useState<string>('');

    const handleAddFilterSelection = (value: string | string[]) => {
        const concept = Array.isArray(value) ? value[0] : value;
        if (!concept) {
            setAddFilterSelection('');
            return;
        }

        onAddFilter(concept);
        setAddFilterSelection('');
    };

    return (
        <div className="mt-sm flex flex-col gap-sm">
            {(!!conceptFieldOptions?.length || editableFilters.length > 0) && (
                <div className="flex w-full flex-col gap-lg">
                    {!!conceptFieldOptions?.length && (
                        <div className="mt-2xl w-[180px] shrink-0">
                            <ComboBox
                                value={addFilterSelection}
                                options={conceptFieldOptions}
                                onChange={handleAddFilterSelection}
                                placeholder={localize(
                                    'dashboards.options.selectFilter'
                                )}
                                localizeFn={localize}
                            />
                        </div>
                    )}
                    {editableFilters.length > 0 && (
                        <div className="flex min-w-0 flex-1 flex-col items-end gap-sm">
                            <GlobalFilters
                                filterConcepts={editableFilters}
                                conceptFieldOptions={conceptFieldOptions}
                                allowAddFilter
                                allowNullModes
                                onConceptValueChange={onConceptValueChange}
                                onDeleteFilter={onDeleteFilter}
                                onClearFilterValue={onClearFilterValue}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
