import type { SelectOption } from '@brilliant/bds-core';
import { SingleSelect } from '@brilliant/bds-core';
import type { ConceptFieldValue } from '@bv/api';
import type { FilterValueMode } from '~/features/dashboards/components/Filters/FilterValueSelect';
import { FilterValueSelect } from '~/features/dashboards/components/Filters/FilterValueSelect';
import { useDashboardFilterValues } from '~/features/dashboards/hooks/useDashboardFilterValues';
import {
    BetweenFilter,
    DateBetweenFilter,
    ExcludeFilter,
    IncludeFilter,
    NotBetweenFilter,
} from '~/filters/filters.ts';
import type { QueryFilter } from '~/filters/types.ts';
import { DATE_FILTER_CONCEPT } from '~/filters/types.ts';
import { useLocalize } from '~/i18n/I18nContext';
import { isRecord } from '~/utils/typeGuards';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { AnyFilter } from './filterUtils';

type GraphFilterProps<TFieldValues extends FieldValues = FieldValues> = {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    onFilterChange: (nextFilter: QueryFilter) => void;
    conceptFieldOptions: SelectOption[];
};

const isNumericString = (value: string) => /^-?\d+(\.\d+)?$/.test(value);

const normalizeRangeValue = (
    value: string | undefined
): string | number | undefined => {
    if (!value || value.trim() === '') return undefined;
    if (isNumericString(value.trim())) return Number(value);
    return value;
};

const getCondition = (filter: AnyFilter): Record<string, unknown> | null => {
    if (!filter || typeof filter !== 'object') return null;
    if (filter.type !== 'compare') return null;
    return isRecord(filter.condition) ? filter.condition : null;
};

const toFilterValues = (value: unknown): (string | number)[] =>
    Array.isArray(value)
        ? value.filter(
              (entry): entry is string | number =>
                  typeof entry === 'string' || typeof entry === 'number'
          )
        : [];

const getRangeValue = (
    condition: Record<string, unknown> | null,
    key: 'from' | 'to'
): string | number | undefined => {
    const value = condition?.[key];
    return typeof value === 'string' || typeof value === 'number'
        ? value
        : undefined;
};

const getFilterMode = (filter: AnyFilter): FilterValueMode => {
    const condition = getCondition(filter);
    if (!condition) return 'include';
    if ('from' in condition || 'to' in condition) {
        return filter?.not ? 'not_between' : 'between';
    }
    if ('in' in condition) {
        return filter?.not ? 'exclude' : 'include';
    }
    return 'include';
};

const getFilterConcept = (filter: AnyFilter): string | undefined => {
    if (!filter || typeof filter !== 'object') return undefined;
    if (filter.type === 'compare' || filter.type === 'date') {
        return filter.value;
    }
    return undefined;
};

const buildFilterForMode = ({
    mode,
    concept,
    currentFilter,
}: {
    mode: FilterValueMode;
    concept: string;
    currentFilter: AnyFilter;
}) => {
    const condition = getCondition(currentFilter);
    switch (mode) {
        case 'exclude': {
            const values = toFilterValues(condition?.in);
            return new ExcludeFilter(concept, values).toQueryFilter();
        }
        case 'between': {
            const from = getRangeValue(condition, 'from');
            const to = getRangeValue(condition, 'to');
            return concept === DATE_FILTER_CONCEPT
                ? new DateBetweenFilter(from, to).toQueryFilter()
                : new BetweenFilter(concept, from, to).toQueryFilter();
        }
        case 'not_between': {
            const from = getRangeValue(condition, 'from');
            const to = getRangeValue(condition, 'to');
            return new NotBetweenFilter(concept, from, to).toQueryFilter();
        }
        case 'include':
        default: {
            const values = toFilterValues(condition?.in);
            return new IncludeFilter(concept, values).toQueryFilter();
        }
    }
};

export function GraphFilter<TFieldValues extends FieldValues>({
    control,
    name,
    onFilterChange,
    conceptFieldOptions,
}: GraphFilterProps<TFieldValues>) {
    const localize = useLocalize();
    const currentFilter = useWatch({
        control,
        name,
    }) as AnyFilter;

    const filterMode = getFilterMode(currentFilter);
    const conceptFieldFromForm = getFilterConcept(currentFilter);
    const isBetweenFilter =
        filterMode === 'between' || filterMode === 'not_between';
    const isInFilter = filterMode === 'include' || filterMode === 'exclude';
    const isValuePickerMode = isInFilter || isBetweenFilter;

    const condition = getCondition(currentFilter);
    const selectedInValues = condition
        ? toFilterValues(condition.in)
        : undefined;
    const rangeFromValue = getRangeValue(condition, 'from');
    const rangeToValue = getRangeValue(condition, 'to');

    const { data: conceptFieldValues, isLoading: isConceptFieldValuesLoading } =
        useDashboardFilterValues(
            isValuePickerMode ? (conceptFieldFromForm ?? '') : ''
        );

    const conceptFieldValueOptions = conceptFieldValues
        ?.sort((a: ConceptFieldValue, b: ConceptFieldValue) => {
            return a.label.localeCompare(b.label, undefined, {
                // Ensures that number-only strings are sorted numerically
                numeric: true,
            });
        })
        .map((conceptFieldValue: ConceptFieldValue): SelectOption => {
            return {
                label: conceptFieldValue.label,
                value: String(conceptFieldValue.value),
            };
        });

    const isLoadingConceptFieldValues =
        isValuePickerMode &&
        !!conceptFieldFromForm &&
        isConceptFieldValuesLoading;

    const selectedValues = Array.isArray(selectedInValues)
        ? selectedInValues
              .filter(
                  (value) =>
                      value !== undefined && value !== null && value !== ''
              )
              .map(String)
        : [];

    const comboBoxOptions: SelectOption[] = (() => {
        if (!conceptFieldValueOptions) return [];
        const missingOptions = selectedValues.filter(
            (val) =>
                !conceptFieldValueOptions.some((option) => option.value === val)
        );
        const extraOptions = missingOptions.map((val) => ({
            label: val,
            value: val,
        }));
        return [...conceptFieldValueOptions, ...extraOptions];
    })();

    const handleValuesChange = (nextValues: string[]) => {
        if (!conceptFieldFromForm) return;
        if (isBetweenFilter) {
            const nextFilter = buildFilterForMode({
                mode: filterMode,
                concept: conceptFieldFromForm,
                currentFilter: {
                    type: 'compare',
                    condition: {
                        from: normalizeRangeValue(nextValues[0]),
                        to: normalizeRangeValue(nextValues[1]),
                    },
                },
            });
            onFilterChange(nextFilter);
            return;
        }

        const nextInValues = nextValues.map((value) => {
            const asString = String(value);
            const asNumber = parseInt(asString, 10);
            return Number.isNaN(asNumber) ? value : asNumber;
        });

        const nextFilter = buildFilterForMode({
            mode: filterMode,
            concept: conceptFieldFromForm,
            currentFilter: {
                ...(currentFilter ?? {}),
                type: 'compare',
                value: conceptFieldFromForm,
                condition: { in: nextInValues },
            },
        });
        onFilterChange(nextFilter);
    };

    const allowNotBetween =
        conceptFieldFromForm !== DATE_FILTER_CONCEPT ||
        filterMode === 'not_between';
    const filterTypeOptions: SelectOption[] = [
        { label: localize('filters.include'), value: 'include' },
        { label: localize('filters.exclude'), value: 'exclude' },
        { label: localize('filters.between'), value: 'between' },
        ...(allowNotBetween
            ? [{ label: localize('filters.notBetween'), value: 'not_between' }]
            : []),
    ];

    const handleFilterModeChange = (value: string) => {
        if (!conceptFieldFromForm) return;
        const nextMode = value as FilterValueMode;
        const nextFilter = buildFilterForMode({
            mode: nextMode,
            concept: conceptFieldFromForm,
            currentFilter,
        });
        onFilterChange(nextFilter);
    };

    const handleConceptChange = (value: string | number) => {
        const nextConcept = String(value);
        const nextMode =
            nextConcept === DATE_FILTER_CONCEPT && filterMode === 'not_between'
                ? 'between'
                : filterMode;
        const nextFilter = buildFilterForMode({
            mode: nextMode,
            concept: nextConcept,
            currentFilter,
        });
        onFilterChange(nextFilter);
    };

    return (
        <>
            <SingleSelect
                size="sm"
                value={conceptFieldFromForm ?? ''}
                options={conceptFieldOptions}
                supportingText={
                    isLoadingConceptFieldValues
                        ? 'Loading filter options...'
                        : undefined
                }
                placeholder={localize('dashboards.options.selectFilter')}
                onChange={handleConceptChange}
            />
            {conceptFieldFromForm && (
                <FilterValueSelect
                    mode={filterMode}
                    modeOptions={filterTypeOptions}
                    values={
                        isBetweenFilter
                            ? [
                                  rangeFromValue !== undefined
                                      ? String(rangeFromValue)
                                      : '',
                                  rangeToValue !== undefined
                                      ? String(rangeToValue)
                                      : '',
                              ]
                            : selectedValues
                    }
                    options={comboBoxOptions}
                    placeholder={localize('filters.select')}
                    disabled={!conceptFieldFromForm}
                    onModeChange={handleFilterModeChange}
                    onValuesChange={handleValuesChange}
                />
            )}
        </>
    );
}
