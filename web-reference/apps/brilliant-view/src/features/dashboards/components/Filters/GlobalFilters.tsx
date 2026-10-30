import type { SelectOption } from '@brilliant/bds-core';
import { Button, Label } from '@brilliant/bds-core';
import { toStringArray, ViewFilterFactory } from '~/filters/factory';
import {
    BetweenFilter,
    ExcludeFilter,
    IncludeFilter,
    IsNotNullFilter,
    IsNullFilter,
    NotBetweenFilter,
} from '~/filters/filters';
import type { ViewFilter } from '~/filters/viewFilter';
import { useLocalize } from '~/i18n/I18nContext';
import { toText } from '~/utils/text';
import { useDashboardFilterValues } from '../../hooks/useDashboardFilterValues';
import type { FilterValueMode } from './FilterValueSelect';
import { FilterValueSelect } from './FilterValueSelect';

interface GlobalFiltersProps {
    filterConcepts: ViewFilter[];
    conceptFieldOptions?: SelectOption[];
    allowAddFilter: boolean;
    allowNullModes?: boolean;
    onConceptValueChange: (filter: ViewFilter) => void;
    onDeleteFilter: (concept: string) => void;
    onClearFilterValue: (concept: string) => void;
}

export function GlobalFilters({
    filterConcepts,
    conceptFieldOptions,
    allowAddFilter,
    allowNullModes = false,
    onConceptValueChange,
    onDeleteFilter,
    onClearFilterValue,
}: GlobalFiltersProps) {
    return (
        <>
            {filterConcepts.map((filter, index) => {
                if (filter.concept === 'date') return null;

                return (
                    <GlobalFilterRow
                        key={`${filter.concept}-${index}`}
                        filter={filter}
                        allFilters={filterConcepts}
                        allowAddFilter={allowAddFilter}
                        allowNullModes={allowNullModes}
                        conceptFieldOptions={conceptFieldOptions}
                        onConceptValueChange={onConceptValueChange}
                        onDeleteFilter={onDeleteFilter}
                        onClearFilterValue={onClearFilterValue}
                    />
                );
            })}
        </>
    );
}

type GlobalFilterRowProps = {
    filter: ViewFilter;
    allFilters: ViewFilter[];
    allowAddFilter: boolean;
    allowNullModes: boolean;
    conceptFieldOptions?: SelectOption[];
    onConceptValueChange: (filter: ViewFilter) => void;
    onDeleteFilter: (concept: string) => void;
    onClearFilterValue: (concept: string) => void;
};

function GlobalFilterRow({
    filter,
    allFilters,
    allowAddFilter,
    allowNullModes,
    conceptFieldOptions,
    onConceptValueChange,
    onDeleteFilter,
    onClearFilterValue,
}: GlobalFilterRowProps) {
    const localize = useLocalize();
    const relatedFilters = buildCascadingFilters(filter, allFilters);

    const { data: conceptFilterValues } = useDashboardFilterValues(
        filter.concept,
        relatedFilters
    );

    const conceptOptions: SelectOption[] = conceptFilterValues
        ? conceptFilterValues.map((option) => ({
              label: option.label,
              value: String(option.value),
          }))
        : [];

    const resolvedFilter = filter;
    const isBetweenFilter =
        resolvedFilter instanceof BetweenFilter ||
        resolvedFilter instanceof NotBetweenFilter;
    const betweenFrom = isBetweenFilter ? resolvedFilter.from : undefined;
    const betweenTo = isBetweenFilter ? resolvedFilter.to : undefined;
    const selectedValues =
        resolvedFilter instanceof IncludeFilter ||
        resolvedFilter instanceof ExcludeFilter
            ? resolvedFilter.values.map(String)
            : [];
    const exclude = resolvedFilter instanceof ExcludeFilter;

    const comboBoxOptions: SelectOption[] = (() => {
        const missingOptions = selectedValues.filter(
            (val) => !conceptOptions.some((option) => option.value === val)
        );
        const extraOptions = missingOptions.map((val) => ({
            label: val,
            value: val,
        }));
        return [...conceptOptions, ...extraOptions];
    })();

    const hasSelectedValue = resolvedFilter.isActive();
    const placeholderLabel =
        conceptFieldOptions?.find((option) => option.value === filter.concept)
            ?.label ?? 'Filter';
    const placeholderText = toText(placeholderLabel, 'Filter');

    const onFilterChanged = makeOnFilterChanged(
        filter.concept,
        onConceptValueChange,
        onClearFilterValue
    );
    const hasNullFilterMode =
        resolvedFilter instanceof IsNullFilter ||
        resolvedFilter instanceof IsNotNullFilter;
    const shouldShowNullModes = allowNullModes || hasNullFilterMode;
    const modeOptions: SelectOption[] = [
        { label: localize('filters.include'), value: 'include' },
        { label: localize('filters.exclude'), value: 'exclude' },
        { label: localize('filters.between'), value: 'between' },
        { label: localize('filters.notBetween'), value: 'not_between' },
        ...(shouldShowNullModes
            ? [
                  { label: localize('filters.isNull'), value: 'is_null' },
                  {
                      label: localize('filters.isNotNull'),
                      value: 'is_not_null',
                  },
              ]
            : []),
    ];
    const activeMode: FilterValueMode =
        resolvedFilter instanceof NotBetweenFilter
            ? 'not_between'
            : resolvedFilter instanceof BetweenFilter
              ? 'between'
              : resolvedFilter instanceof IsNotNullFilter
                ? 'is_not_null'
                : resolvedFilter instanceof IsNullFilter
                  ? 'is_null'
                  : resolvedFilter instanceof ExcludeFilter
                    ? 'exclude'
                    : 'include';
    const inputValues =
        activeMode === 'between' || activeMode === 'not_between'
            ? [
                  betweenFrom !== undefined ? String(betweenFrom) : '',
                  betweenTo !== undefined ? String(betweenTo) : '',
              ]
            : selectedValues;
    const handleModeChange = (nextMode: FilterValueMode) => {
        if (nextMode === 'is_null' || nextMode === 'is_not_null') {
            onFilterChanged({
                condition: { is_null: true },
                ...(nextMode === 'is_not_null' ? { not: true } : {}),
            });
            return;
        }

        if (nextMode === 'between' || nextMode === 'not_between') {
            onFilterChanged({
                condition: {
                    from: betweenFrom ?? '',
                    to: betweenTo ?? '',
                },
                ...(nextMode === 'not_between' ? { not: true } : {}),
            });
            return;
        }

        onFilterChanged({
            condition: { in: selectedValues },
            ...(nextMode === 'exclude' ? { not: true } : {}),
        });
    };
    const handleValuesChange = (nextValues: string[]) => {
        if (activeMode === 'is_null' || activeMode === 'is_not_null') {
            return;
        }

        if (activeMode === 'between' || activeMode === 'not_between') {
            onFilterChanged({
                condition: {
                    from: nextValues[0] ?? '',
                    to: nextValues[1] ?? '',
                },
                ...(activeMode === 'not_between' ? { not: true } : {}),
            });
            return;
        }

        onFilterChanged({
            condition: { in: nextValues },
            ...(exclude ? { not: true } : {}),
        });
    };
    const handleClearClick = () => {
        if (activeMode === 'between' || activeMode === 'not_between') {
            const emptyBetween =
                activeMode === 'not_between'
                    ? new NotBetweenFilter(filter.concept, undefined, undefined)
                    : new BetweenFilter(filter.concept, undefined, undefined);
            onConceptValueChange(emptyBetween);
            return;
        }

        onClearFilterValue(filter.concept);
    };

    return (
        <div className="flex max-w-full items-end gap-2 px-2">
            {allowAddFilter && (
                <div className="mb-1">
                    <Button
                        type="button"
                        variant="ghost"
                        color="error"
                        size="sm"
                        leftIcon="bv:trash"
                        onClick={() => onDeleteFilter(filter.concept)}
                    />
                </div>
            )}

            <div className="flex w-[440px] max-w-full flex-col gap-0.5">
                <Label className="ml-1 truncate whitespace-nowrap text-secondary bv-text-font-xs-medium">
                    {placeholderLabel}
                </Label>
                <div className="flex w-full items-center gap-1.5">
                    <FilterValueSelect
                        mode={activeMode}
                        modeOptions={modeOptions}
                        values={inputValues}
                        options={comboBoxOptions}
                        placeholder={`${localize('filters.select')} ${placeholderText}`}
                        onModeChange={handleModeChange}
                        onValuesChange={handleValuesChange}
                        className="flex-1"
                        triggerClassName={
                            hasSelectedValue
                                ? 'text-primary'
                                : 'text-placeholder'
                        }
                    />
                    <Button
                        type="button"
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={handleClearClick}
                    >
                        {localize('filters.clear')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function buildCascadingFilters(
    current: ViewFilter,
    all: ViewFilter[]
): Record<string, string[]> {
    return all.reduce(
        (acc, filter) => {
            if (filter.concept === current.concept || filter.concept === 'date')
                return acc;

            if (!filter.isActive()) {
                return acc;
            }

            // Only "include" filters should cascade into value lookups.
            if (filter instanceof IncludeFilter) {
                const values = filter.values
                    .map(String)
                    .filter((value) => value !== '');
                if (values.length > 0) {
                    acc[filter.concept] = values;
                }
            }
            return acc;
        },
        {} as Record<string, string[]>
    );
}

function makeOnFilterChanged(
    concept: string,
    onConceptValueChange: (filter: ViewFilter) => void,
    onClearFilterValue: (concept: string) => void
) {
    return (nextFilter: {
        condition: {
            in?: unknown;
            from?: unknown;
            to?: unknown;
            is_null?: unknown;
        };
        not?: boolean;
    }) => {
        if (nextFilter.condition.is_null === true) {
            const viewFilter = ViewFilterFactory.fromFilterValue(concept, {
                is_null: true,
                ...(nextFilter.not ? { not: true } : {}),
            });
            if (viewFilter) {
                onConceptValueChange(viewFilter);
            } else {
                onClearFilterValue(concept);
            }
            return;
        }

        if ('from' in nextFilter.condition || 'to' in nextFilter.condition) {
            const from = nextFilter.condition.from;
            const to = nextFilter.condition.to;
            const viewFilter = ViewFilterFactory.fromFilterValue(concept, {
                from:
                    typeof from === 'string' || typeof from === 'number'
                        ? from
                        : '',
                to: typeof to === 'string' || typeof to === 'number' ? to : '',
                ...(nextFilter.not ? { not: true } : {}),
            });
            if (viewFilter) {
                onConceptValueChange(viewFilter);
            } else {
                onClearFilterValue(concept);
            }
            return;
        }

        const nextValues = toStringArray(nextFilter.condition.in);
        const viewFilter = ViewFilterFactory.fromFilterValue(concept, {
            in: nextValues,
            ...(nextFilter.not ? { not: true } : {}),
        });
        if (viewFilter) {
            onConceptValueChange(viewFilter);
        } else {
            onClearFilterValue(concept);
        }
    };
}
