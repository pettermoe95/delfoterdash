import type {
    DashboardGraphQuery,
    DashboardGraphQueryCalculations,
    DashboardGraphQueryDomain,
    DashboardLayoutItem,
    GaugeGraphFormat,
    StatusGraphFormat,
} from '@bv/api';
import {
    queryCalculationSchema,
    queryDateFilterSchema,
    queryDomainSchema,
} from '@bv/api';
import { DateInPeriodFilter, PeriodType } from '~/filters/filters';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import {
    buildComparisonLabel,
    getComparisonConceptAndFilter,
    getDisplayCalculationIndex,
    getTargetCalculationIndex,
    hasInPeriodFilterAtIndex,
} from './commonGraphUtils';
import type { LocalizeFn } from './compareTextUtils';
import { buildConceptCompareText } from './compareTextUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import {
    buildCalculation,
    conceptFromCalculation,
    isAlltimeData,
} from './graphTransformations';
import { normalizeKpiDisplay } from './kpiDisplayUtils';
import { isTimePeriod, isValidInPeriod } from './offsetAndPeriodFilterHelpers';

const STATUS_CALCULATION_INDEX = {
    base: 0,
    comparison: 1,
    target: 2,
    trend: 3,
} as const;

export const templateStatusGraph = (
    metricName: string,
    localize: LocalizeFn
) => {
    const format: StatusGraphFormat = {
        concept: {
            concept_name: metricName,
            deictic_modifier: 0,
            time_period: 'year',
        },
        comparison: {
            concept_name: metricName,
            deictic_modifier: -1,
            time_period: 'year',
        },
        target: {
            concept_name: metricName,
            deictic_modifier: -1,
            time_period: 'year',
        },
        conceptTimeFilter: false,
        targetTimeFilter: false,
        comparisonTimeFilter: false,
        domain: {
            group: ['month'],
        },
        display: {
            showDecimals: false,
            compare: {
                isShowingComparison: true,
                isShowingGoal: true,
                isShowingGraph: true,
                calculation: STATUS_CALCULATION_INDEX.comparison,
                compareText: buildConceptCompareText({
                    baseConceptName: metricName,
                    period: 'year',
                    offset: -1,
                    useTimeFilter: true,
                    localize,
                }),
                measurement: '%',
            },
            target: {
                calculation: STATUS_CALCULATION_INDEX.target,
            },
        },
        alltimeData: true,
    };
    return format;
};

const LINEGRAPH_POINTS = 6;

function buildLinegraphFromConcept(
    concept: GaugeGraphFormat['concept'],
    period: GaugeGraphFormat['concept']['time_period']
): DashboardGraphQueryCalculations[] {
    const calculations: DashboardGraphQueryCalculations[] = [];
    const initialOffset = 0;

    for (let step = 0; step <= LINEGRAPH_POINTS; step += 1) {
        const offsetValue = initialOffset - step;
        calculations.push(
            queryCalculationSchema.parse({
                aggregate: concept.concept_name,
                filter: [
                    queryDateFilterSchema.parse(
                        new DateInPeriodFilter(
                            PeriodType.fromTypeName(period),
                            offsetValue
                        ).toQueryFilter()
                    ),
                ],
            })
        );
    }

    return calculations;
}

/**
 * Transforms a StatusGraphFormat object into a DashboardGraphQuery.
 */
export function statusFormatToQuery(
    graphFormat: StatusGraphFormat,
    localize: LocalizeFn
): DashboardGraphQuery {
    const calculations: DashboardGraphQuery['calculations'] = [];

    // Base calculation from concept
    const baseCalc = buildCalculation(
        graphFormat.concept,
        graphFormat.conceptTimeFilter ?? !graphFormat.alltimeData,
        graphFormat.calculationTimeFilter
    );
    calculations.push(baseCalc);

    const {
        comparisonConcept,
        comparisonUseTimeFilter,
        useConceptPriorComparison,
    } = getComparisonConceptAndFilter(graphFormat);
    const comparisonCalc = buildCalculation(
        comparisonConcept,
        comparisonUseTimeFilter
    );
    calculations.push(comparisonCalc);

    const targetCalc = buildCalculation(
        graphFormat.target,
        graphFormat.targetTimeFilter ?? !graphFormat.alltimeData
    );
    calculations.push(targetCalc);

    const comparisonLabel = buildComparisonLabel({
        baseConceptName: graphFormat.concept.concept_name,
        baseConceptOffset: graphFormat.concept.deictic_modifier,
        comparisonConcept,
        comparisonUseTimeFilter,
        useConceptPriorComparison,
        localize,
    });

    const nextDisplay: StatusGraphFormat['display'] = {
        ...graphFormat.display,
        compare: {
            ...graphFormat.display.compare,
            calculation: STATUS_CALCULATION_INDEX.comparison,
            compareText: comparisonLabel,
        },
    };

    const displayTarget = graphFormat.display.target;
    if (typeof displayTarget === 'object' && 'calculation' in displayTarget) {
        nextDisplay.target = {
            ...displayTarget,
            calculation: STATUS_CALCULATION_INDEX.target,
        };
    }

    graphFormat.display = nextDisplay;

    const domainGroup = graphFormat.domain?.group;
    const groupPeriod =
        Array.isArray(domainGroup) && domainGroup.length > 0
            ? domainGroup[domainGroup.length - 1]
            : undefined;
    const lineGraphPeriod =
        groupPeriod && isTimePeriod(groupPeriod)
            ? groupPeriod
            : graphFormat.concept.time_period;

    const lineGraph = buildLinegraphFromConcept(
        graphFormat.concept,
        lineGraphPeriod
    );
    calculations.push(...lineGraph);

    const domainFilters = stripEmptyCompareFilters(
        getGraphDomainFilters(graphFormat)
    );
    const hasDomain = domainFilters.length > 0;

    const query: DashboardGraphQuery = {
        calculations,
        ...(hasDomain
            ? {
                  domain: queryDomainSchema.parse({
                      ...(domainFilters.length > 0
                          ? { filter: domainFilters }
                          : {}),
                  }),
              }
            : {}),
    };

    return query;
}

export function layoutItemToStatusFormat(
    layout: DashboardLayoutItem
): StatusGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    // Base concept
    const baseConcept: StatusGraphFormat['concept'] = conceptFromCalculation(
        calculations[STATUS_CALCULATION_INDEX.base]
    );

    const layoutDisplay = normalizeKpiDisplay(layout.graph.display, {
        comparisonCalculationIndex: STATUS_CALCULATION_INDEX.comparison,
        targetCalculationIndex: STATUS_CALCULATION_INDEX.target,
        isShowingGraph: true,
        isShowingGoal: true,
    });

    const compareCalculationIndex = getDisplayCalculationIndex(
        layoutDisplay?.compare,
        STATUS_CALCULATION_INDEX.comparison,
        calculations.length
    );

    const targetCalculationIndex = getTargetCalculationIndex(
        layoutDisplay?.target,
        STATUS_CALCULATION_INDEX.target,
        calculations.length
    );

    const comparison: StatusGraphFormat['comparison'] =
        compareCalculationIndex !== undefined &&
        calculations[compareCalculationIndex]
            ? conceptFromCalculation(calculations[compareCalculationIndex])
            : {
                  concept_name: baseConcept.concept_name,
                  deictic_modifier: -1,
                  time_period: baseConcept.time_period,
              };

    const targetCalculation = calculations.at(targetCalculationIndex);
    const target: StatusGraphFormat['concept'] = targetCalculation
        ? conceptFromCalculation(targetCalculation, true)
        : {
              concept_name: baseConcept.concept_name,
              deictic_modifier: -1,
              time_period: baseConcept.time_period,
          };

    const trendCalculation = calculations.at(STATUS_CALCULATION_INDEX.trend);
    const trendFilters = Array.isArray(trendCalculation?.filter)
        ? trendCalculation.filter
        : [];
    const trendPeriod = trendFilters.find(isValidInPeriod)?.period;
    const domainGroup =
        trendPeriod && isTimePeriod(trendPeriod) ? [trendPeriod] : undefined;

    // Domain-level filters
    const domainFilters: DashboardGraphQueryDomain['filter'] = Array.isArray(
        query?.domain?.filter
    )
        ? [...query.domain.filter]
        : [];

    const display: StatusGraphFormat['display'] = layoutDisplay ?? {
        showDecimals: false,
        compare: {
            isShowingComparison: true,
            isShowingGraph: true,
            isShowingGoal: true,
            calculation: STATUS_CALCULATION_INDEX.comparison,
            compareText: '',
            measurement: '',
        },
        target: {
            calculation: STATUS_CALCULATION_INDEX.target,
        },
    };

    return {
        concept: baseConcept,
        calculationTimeFilter: calculations[0],
        comparison,
        target,
        filter: domainFilters,
        ...(domainGroup && domainGroup.length > 0
            ? { domain: { group: domainGroup } }
            : {}),
        conceptTimeFilter: hasInPeriodFilterAtIndex(
            calculations,
            STATUS_CALCULATION_INDEX.base
        ),
        comparisonTimeFilter: hasInPeriodFilterAtIndex(
            calculations,
            compareCalculationIndex
        ),
        targetTimeFilter: targetCalculation
            ? hasInPeriodFilterAtIndex(calculations, targetCalculationIndex)
            : false,
        display,
        alltimeData: isAlltimeData(calculations.slice(0, 3)),
    };
}
