import type {
    DashboardGraphQueryCalculations,
    DashboardGraphQueryDateFilter,
    DashboardLayoutItem,
} from '@bv/api';
import {
    DateBetweenFilter,
    DateInPeriodFilter,
    PeriodType,
} from '~/filters/filters';
import type { QueryFilter } from '~/filters/types';
import type { ViewFilter } from '~/filters/viewFilter';
import { isRecord } from '~/utils/typeGuards';
import {
    buildComparisonLabel,
    getComparisonConceptAndFilter,
} from '../EditPanel/NewGraphStudio/Utils/commonGraphUtils';
import type { LocalizeFn } from '../EditPanel/NewGraphStudio/Utils/compareTextUtils';
import { formatGlobalCompareText } from '../EditPanel/NewGraphStudio/Utils/compareTextUtils';
import { layoutItemToGaugeFormat } from '../EditPanel/NewGraphStudio/Utils/gaugeUtils';
import type { Period } from '../EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers';
import {
    isTimePeriod,
    readNumericOffset,
} from '../EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers';
import { layoutItemToStatusFormat } from '../EditPanel/NewGraphStudio/Utils/statusUtils';
import type {
    CompareFilter,
    DateFilterValue,
} from '../PredefinedDateRanges/dateFilterUtils';
import {
    getLastMonthsPresetCount,
    getYTDCompareFilter,
    isDateRangeFilter,
    isInPeriodFilter,
    isThisMonthFilter,
    isThisQuarterFilter,
    isYTDRangeFilter,
} from '../PredefinedDateRanges/dateFilterUtils';
import {
    getLastMonthsRange,
    getNextMonthsRange,
    getYTDRange,
    shiftRangeBackByMonths,
} from '../PredefinedDateRanges/dateRanges';

type DateComparisonStrategy = {
    compareText: string;
    currentFilter: CompareFilter;
    compareFilter: CompareFilter;
    targetFilter?: CompareFilter;
    skipDomainDateFilter: boolean;
};

type CalculationIndices = {
    compareIndex: number;
    targetIndex?: number;
};

type CalculationFilter = NonNullable<
    DashboardGraphQueryCalculations['filter']
>[number];

type InPeriodCalculationFilter = Extract<
    DashboardGraphQueryDateFilter,
    { condition: 'in_period' }
>;

type LegacyGaugeCompareDisplay = {
    calculation?: number;
    type?: string;
};

type DisplayRecord = Record<string, unknown>;

const COMPARE_GRAPH_TYPES = new Set(['status', 'gauge']);

const getDisplayRecord = (display: unknown): DisplayRecord | undefined =>
    isRecord(display) ? display : undefined;

const getNestedDisplayRecord = (
    display: unknown,
    key: 'compare' | 'target'
): DisplayRecord | undefined => {
    const nestedValue = getDisplayRecord(display)?.[key];
    return isRecord(nestedValue) ? nestedValue : undefined;
};

const asCompareFilter = (filter: QueryFilter): CompareFilter =>
    filter as CompareFilter;

const buildFilterObjects = (filters: ViewFilter[]): QueryFilter[] =>
    filters.reduce<QueryFilter[]>((acc, filter) => {
        if (filter.concept === 'date') {
            return acc;
        }
        if (!filter.isActive()) {
            return acc;
        }
        acc.push(filter.toQueryFilter());
        return acc;
    }, []);

const shouldHideComparisonForDate = (dateFilter?: DateFilterValue) =>
    !dateFilter || (isDateRangeFilter(dateFilter) && !dateFilter.preset);

const getCalculationIndices = (display: unknown): CalculationIndices => {
    const compareDisplay = getNestedDisplayRecord(display, 'compare');
    const targetDisplay = getNestedDisplayRecord(display, 'target');
    const compareIndex =
        typeof compareDisplay?.calculation === 'number'
            ? compareDisplay.calculation
            : 1;
    const targetIndex =
        typeof targetDisplay?.calculation === 'number'
            ? targetDisplay.calculation
            : undefined;

    return { compareIndex, targetIndex };
};

const shouldIgnoreGaugeDomainGrouping = (params: {
    display: unknown;
    calculations: DashboardGraphQueryCalculations[];
    compareIndex: number;
}): boolean => {
    const compareDisplay = getNestedDisplayRecord(params.display, 'compare') as
        | LegacyGaugeCompareDisplay
        | undefined;
    const hasLegacyCompareMarker = compareDisplay?.type === 'targetvalue';
    const hasDedicatedCompareCalculation =
        params.compareIndex >= 0 &&
        params.compareIndex < params.calculations.length;

    return hasLegacyCompareMarker && !hasDedicatedCompareCalculation;
};

const withoutDateDomainGroups = (group: unknown): string[] | undefined => {
    if (!Array.isArray(group)) {
        return undefined;
    }

    const nextGroup = group.filter(
        (entry): entry is string =>
            typeof entry === 'string' && !isTimePeriod(entry)
    );

    return nextGroup.length > 0 ? nextGroup : undefined;
};

const hasLegacyCalculationDateFilter = (
    calculations: DashboardGraphQueryCalculations[]
): boolean =>
    Array.isArray(calculations?.[0]?.filter) &&
    calculations[0].filter?.some(
        (filter: CalculationFilter) =>
            filter?.type === 'date' && filter?.condition === 'in_period'
    );

const getLegacyCalculationInPeriodFilter = (
    calc?: DashboardGraphQueryCalculations
): InPeriodCalculationFilter | undefined =>
    Array.isArray(calc?.filter)
        ? calc.filter.find(
              (
                  filter: CalculationFilter
              ): filter is InPeriodCalculationFilter =>
                  filter?.type === 'date' && filter?.condition === 'in_period'
          )
        : undefined;

const hasLegacyCalculationDateComparisonPattern = (params: {
    calculations: DashboardGraphQueryCalculations[];
    compareIndex: number;
    targetIndex?: number;
}): boolean => {
    const { calculations, compareIndex, targetIndex } = params;
    const baseFilter = getLegacyCalculationInPeriodFilter(calculations[0]);
    const compareFilter = getLegacyCalculationInPeriodFilter(
        calculations[compareIndex]
    );

    if (!baseFilter || !compareFilter) {
        return false;
    }

    if (baseFilter.period !== compareFilter.period) {
        return false;
    }

    const baseOffset = readNumericOffset(baseFilter) ?? 0;
    const compareOffset = readNumericOffset(compareFilter);

    if (compareOffset !== baseOffset - 1) {
        return false;
    }

    if (targetIndex === undefined) {
        return true;
    }

    const targetFilter = getLegacyCalculationInPeriodFilter(
        calculations[targetIndex]
    );
    if (!targetFilter) {
        return true;
    }

    return (
        targetFilter.period === baseFilter.period &&
        (readNumericOffset(targetFilter) ?? 0) === baseOffset
    );
};

const shouldRewriteLegacyTargetCalculationDateFilter = (params: {
    calculations: DashboardGraphQueryCalculations[];
    targetIndex?: number;
}): boolean => {
    const { calculations, targetIndex } = params;

    if (targetIndex === undefined) {
        return false;
    }

    return Boolean(
        getLegacyCalculationInPeriodFilter(calculations[targetIndex])
    );
};

const buildDateFilterObject = (dateFilter: DateFilterValue): QueryFilter => {
    if (isDateRangeFilter(dateFilter)) {
        return new DateBetweenFilter(
            dateFilter.from,
            dateFilter.to,
            dateFilter.preset
        ).toQueryFilter();
    }

    return dateFilter.toQueryFilter();
};

const buildExtraFilters = (params: {
    filterConcepts: ViewFilter[];
}): QueryFilter[] => {
    const { filterConcepts } = params;
    return buildFilterObjects(filterConcepts);
};

const buildComparisonDisplay = (params: {
    display: unknown;
    shouldUseCompare: boolean;
    effectiveDateComparison: DateComparisonStrategy | null;
    shouldHideComparison: boolean;
    fallbackCompareLabel?: string | null;
}): Record<string, unknown> | undefined => {
    const displayRecord = getDisplayRecord(params.display);
    const displayCompare = getNestedDisplayRecord(params.display, 'compare');
    if (
        !displayCompare ||
        !params.shouldUseCompare ||
        (!params.effectiveDateComparison &&
            !params.shouldHideComparison &&
            !params.fallbackCompareLabel)
    ) {
        return displayRecord;
    }
    return {
        ...(displayRecord ?? {}),
        compare: {
            ...displayCompare,
            ...(params.effectiveDateComparison
                ? {
                      compareText: params.effectiveDateComparison.compareText,
                  }
                : params.fallbackCompareLabel
                  ? { compareText: params.fallbackCompareLabel }
                  : {}),
            ...(params.shouldHideComparison
                ? { isShowingComparison: false }
                : {}),
        },
    };
};

const withCalculationExtraFilter = (
    calc: DashboardGraphQueryCalculations,
    filter: QueryFilter
) => {
    const nextFilter = Array.isArray(calc.extra_filters)
        ? [...calc.extra_filters, filter]
        : [filter];
    return { ...calc, extra_filters: nextFilter };
};

const withCalculationDateFilter = (
    calc: DashboardGraphQueryCalculations,
    filter: QueryFilter
) => {
    const nextFilter = Array.isArray(calc.filter)
        ? calc.filter.filter(
              (existing: CalculationFilter) =>
                  !(
                      existing?.type === 'date' &&
                      existing?.condition === 'in_period'
                  )
          )
        : [];

    return {
        ...calc,
        filter: [...nextFilter, filter],
    };
};

const applyDateComparisonToCalculations = (params: {
    calculations: DashboardGraphQueryCalculations[];
    shouldUseCompare: boolean;
    compareIndex: number;
    targetIndex?: number;
    effectiveDateComparison: DateComparisonStrategy | null;
    dateFilter?: DateFilterValue;
    hasConceptFilter?: boolean;
    rewriteLegacyCalculationDateFilters?: boolean;
    rewriteLegacyTargetCalculationDateFilter?: boolean;
}) => {
    const {
        calculations,
        shouldUseCompare,
        compareIndex,
        targetIndex,
        effectiveDateComparison,
        dateFilter,
        hasConceptFilter,
        rewriteLegacyCalculationDateFilters,
        rewriteLegacyTargetCalculationDateFilter,
    } = params;

    if (calculations.length === 0) {
        return calculations;
    }

    if (!effectiveDateComparison) {
        if (
            !dateFilter?.isActive() ||
            (hasConceptFilter && !rewriteLegacyCalculationDateFilters)
        ) {
            return calculations;
        }

        const filter = buildDateFilterObject(dateFilter);
        if (rewriteLegacyCalculationDateFilters) {
            return calculations.map((calc) =>
                withCalculationDateFilter(calc, filter)
            );
        }
        return calculations.map((calc) =>
            withCalculationExtraFilter(calc, filter)
        );
    }

    if (rewriteLegacyCalculationDateFilters) {
        return shouldUseCompare
            ? calculations.map((calc, index) => {
                  if (index === compareIndex) {
                      return withCalculationDateFilter(
                          calc,
                          effectiveDateComparison.compareFilter
                      );
                  }
                  if (index === 0) {
                      return withCalculationDateFilter(
                          calc,
                          effectiveDateComparison.currentFilter
                      );
                  }
                  if (
                      rewriteLegacyTargetCalculationDateFilter &&
                      index === targetIndex
                  ) {
                      return withCalculationDateFilter(
                          calc,
                          effectiveDateComparison.targetFilter ??
                              effectiveDateComparison.currentFilter
                      );
                  }
                  return calc;
              })
            : calculations.map((calc) =>
                  withCalculationDateFilter(
                      calc,
                      effectiveDateComparison.currentFilter
                  )
              );
    }

    return shouldUseCompare
        ? calculations.map((calc, index) => {
              if (index === compareIndex) {
                  return withCalculationExtraFilter(
                      calc,
                      effectiveDateComparison.compareFilter
                  );
              }
              if (index === 0 || index === targetIndex) {
                  return withCalculationExtraFilter(
                      calc,
                      effectiveDateComparison.targetFilter ??
                          effectiveDateComparison.currentFilter
                  );
              }
              return calc;
          })
        : calculations.map((calc) =>
              withCalculationExtraFilter(
                  calc,
                  effectiveDateComparison.currentFilter
              )
          );
};

const buildInPeriodFilter = (period: Period, offset: number): CompareFilter => {
    return asCompareFilter(
        new DateInPeriodFilter(
            PeriodType.fromTypeName(period),
            offset
        ).toQueryFilter()
    );
};

const buildRangeFilter = (from: string, to: string): CompareFilter =>
    asCompareFilter(new DateBetweenFilter(from, to).toQueryFilter());

const getDateComparisonStrategy = (
    localize: LocalizeFn,
    dateFilter?: DateFilterValue
): DateComparisonStrategy | null => {
    if (!dateFilter) return null;

    const isYTD = isYTDRangeFilter(dateFilter);
    if (isYTD && isDateRangeFilter(dateFilter)) {
        const ytdRange = getYTDRange();
        const lastYtdFilter = getYTDCompareFilter();
        return {
            compareText: formatGlobalCompareText(localize, {
                type: 'ytd',
            }),
            currentFilter: buildRangeFilter(ytdRange.from, ytdRange.to),
            compareFilter: lastYtdFilter,
            targetFilter: buildRangeFilter(ytdRange.from, ytdRange.to),
            skipDomainDateFilter: true,
        };
    }

    if (isThisMonthFilter(dateFilter)) {
        return {
            compareText: formatGlobalCompareText(localize, {
                type: 'this_month',
            }),
            currentFilter: buildInPeriodFilter('month', 0),
            compareFilter: buildInPeriodFilter('month', -1),
            targetFilter: buildInPeriodFilter('month', 0),
            skipDomainDateFilter: true,
        };
    }

    if (isThisQuarterFilter(dateFilter)) {
        return {
            compareText: formatGlobalCompareText(localize, {
                type: 'this_quarter',
            }),
            currentFilter: buildInPeriodFilter('quarter', 0),
            compareFilter: buildInPeriodFilter('quarter', -1),
            targetFilter: buildInPeriodFilter('quarter', 0),
            skipDomainDateFilter: true,
        };
    }

    if (isInPeriodFilter(dateFilter)) {
        const period = dateFilter.period.typeName;
        const amount = dateFilter.amount;

        if (amount === -1) {
            return {
                compareText: formatGlobalCompareText(localize, {
                    type: 'period_prior',
                    period,
                }),
                currentFilter: buildInPeriodFilter(period, -1),
                compareFilter: buildInPeriodFilter(period, -2),
                targetFilter: buildInPeriodFilter(period, -1),
                skipDomainDateFilter: true,
            };
        }

        if (amount === 1) {
            return {
                compareText: formatGlobalCompareText(localize, {
                    type: 'this_period',
                    period,
                }),
                currentFilter: buildInPeriodFilter(period, 1),
                compareFilter: buildInPeriodFilter(period, 0),
                targetFilter: buildInPeriodFilter(period, 1),
                skipDomainDateFilter: true,
            };
        }
    }

    const lastMonthsCount = getLastMonthsPresetCount(dateFilter);
    if (isDateRangeFilter(dateFilter) && lastMonthsCount) {
        const currentRange = getLastMonthsRange(lastMonthsCount);
        const compareRange = shiftRangeBackByMonths(
            currentRange,
            lastMonthsCount
        );
        return {
            compareText: formatGlobalCompareText(localize, {
                type: 'last_months',
                monthsCount: lastMonthsCount,
            }),
            currentFilter: buildRangeFilter(currentRange.from, currentRange.to),
            compareFilter: buildRangeFilter(compareRange.from, compareRange.to),
            targetFilter: buildRangeFilter(currentRange.from, currentRange.to),
            skipDomainDateFilter: true,
        };
    }

    if (isDateRangeFilter(dateFilter)) {
        const preset = dateFilter.preset;
        const match =
            typeof preset === 'string'
                ? /^next_months[:_](\d+)$/.exec(preset)
                : null;
        const nextMonthsCount = match ? Number(match[1]) : NaN;
        if (Number.isFinite(nextMonthsCount) && nextMonthsCount > 0) {
            const currentRange = getNextMonthsRange(nextMonthsCount);
            const compareRange = getLastMonthsRange(nextMonthsCount);
            const lowerFirst = (value: string) =>
                value ? value[0].toLowerCase() + value.slice(1) : value;
            const lowerLastMonthsLabel = `${lowerFirst(localize('time.last'))} ${nextMonthsCount} ${lowerFirst(localize('time.months'))}`;
            return {
                compareText: formatGlobalCompareText(localize, {
                    type: 'vs_period',
                    periodLabel: lowerLastMonthsLabel,
                }),
                currentFilter: buildRangeFilter(
                    currentRange.from,
                    currentRange.to
                ),
                compareFilter: buildRangeFilter(
                    compareRange.from,
                    compareRange.to
                ),
                targetFilter: buildRangeFilter(
                    currentRange.from,
                    currentRange.to
                ),
                skipDomainDateFilter: true,
            };
        }
    }

    return null;
};

const getLocalizedComparisonLabel = (
    layout: DashboardLayoutItem,
    localize: LocalizeFn
): string | null => {
    const graphTypeName = layout.graph?.type?.name;
    if (!graphTypeName) return null;

    if (graphTypeName === 'gauge') {
        const gauge = layoutItemToGaugeFormat(layout);
        if (!gauge.concept?.concept_name) return null;
        const {
            comparisonConcept,
            comparisonUseTimeFilter,
            useConceptPriorComparison,
        } = getComparisonConceptAndFilter(gauge);
        return buildComparisonLabel({
            baseConceptName: gauge.concept.concept_name,
            baseConceptOffset: gauge.concept.deictic_modifier,
            comparisonConcept,
            comparisonUseTimeFilter,
            useConceptPriorComparison,
            localize,
        });
    }

    if (graphTypeName === 'status') {
        const status = layoutItemToStatusFormat(layout);
        if (!status.concept?.concept_name) return null;
        const {
            comparisonConcept,
            comparisonUseTimeFilter,
            useConceptPriorComparison,
        } = getComparisonConceptAndFilter(status);
        return buildComparisonLabel({
            baseConceptName: status.concept.concept_name,
            baseConceptOffset: status.concept.deictic_modifier,
            comparisonConcept,
            comparisonUseTimeFilter,
            useConceptPriorComparison,
            localize,
        });
    }

    return null;
};

export function applyGlobalFiltersToDashboardLayout(
    layout: DashboardLayoutItem,
    filterConcepts: ViewFilter[],
    dateFilter: DateFilterValue | undefined,
    localize: LocalizeFn
): DashboardLayoutItem {
    const dateComparison = getDateComparisonStrategy(localize, dateFilter);
    const filterObjects = buildExtraFilters({
        filterConcepts,
    });

    const shouldHideComparison = shouldHideComparisonForDate(dateFilter);
    const hasActiveDateFilter = !!dateFilter?.isActive();

    if (
        (filterObjects.length > 0 ||
            dateComparison ||
            shouldHideComparison ||
            hasActiveDateFilter) &&
        layout.graph?.query
    ) {
        const graphTypeName = layout.graph.type?.name;
        const shouldUseCompare = graphTypeName
            ? COMPARE_GRAPH_TYPES.has(graphTypeName)
            : false;
        const calculations = Array.isArray(layout.graph.query.calculations)
            ? layout.graph.query.calculations
            : [];
        const { compareIndex, targetIndex } = getCalculationIndices(
            layout.graph.display
        );
        const hasLegacyCalculationDateFilters =
            shouldUseCompare && hasLegacyCalculationDateFilter(calculations);
        const hasLegacyCalculationDateComparison =
            shouldUseCompare &&
            hasLegacyCalculationDateComparisonPattern({
                calculations,
                compareIndex,
                targetIndex,
            });
        const rewriteLegacyTargetCalculationDateFilter =
            shouldRewriteLegacyTargetCalculationDateFilter({
                calculations,
                targetIndex,
            });
        const effectiveDateComparison = hasLegacyCalculationDateFilters
            ? hasLegacyCalculationDateComparison
                ? dateComparison
                : null
            : dateComparison;
        const shouldIgnoreDomainGrouping =
            graphTypeName === 'gauge' &&
            Boolean(effectiveDateComparison) &&
            shouldIgnoreGaugeDomainGrouping({
                display: layout.graph.display,
                calculations,
                compareIndex,
            });
        const fallbackCompareLabel =
            shouldUseCompare && !effectiveDateComparison
                ? getLocalizedComparisonLabel(layout, localize)
                : null;

        const nextDisplay = buildComparisonDisplay({
            display: layout.graph.display,
            shouldUseCompare,
            effectiveDateComparison,
            shouldHideComparison,
            fallbackCompareLabel,
        });

        const nextCalculations = applyDateComparisonToCalculations({
            calculations,
            shouldUseCompare,
            compareIndex,
            targetIndex,
            effectiveDateComparison,
            dateFilter,
            hasConceptFilter: hasLegacyCalculationDateFilters,
            rewriteLegacyCalculationDateFilters:
                hasLegacyCalculationDateComparison,
            rewriteLegacyTargetCalculationDateFilter,
        });
        const nextDomain = {
            ...(layout.graph.query.domain ?? {}),
            ...(filterObjects.length > 0
                ? { extra_filters: filterObjects }
                : {}),
        };

        if (shouldIgnoreDomainGrouping) {
            const nextGroup = withoutDateDomainGroups(nextDomain.group);
            if (nextGroup) {
                nextDomain.group = nextGroup;
            } else {
                delete nextDomain.group;
            }
        }

        return {
            ...layout,
            graph: {
                ...layout.graph,
                query:
                    filterObjects.length > 0 || effectiveDateComparison
                        ? {
                              ...layout.graph.query,
                              calculations: nextCalculations,
                              domain: nextDomain,
                          }
                        : {
                              ...layout.graph.query,
                              calculations: nextCalculations,
                          },
                ...(nextDisplay ? { display: nextDisplay } : {}),
            },
        };
    }

    return layout;
}

/**
 * Enabled global filters are always present as ViewFilter instances, even before a user
 * has set values. The API will return unfiltered data in that case, but without this helper
 * we would mark filters as active and show the "no data" state too early. We only treat
 * filters as active once their `isActive()` is true (configured with a concrete value).
 */
export function hasActiveGlobalFilterValues(filters: ViewFilter[]): boolean {
    return filters.some((filter) => filter.isActive());
}
