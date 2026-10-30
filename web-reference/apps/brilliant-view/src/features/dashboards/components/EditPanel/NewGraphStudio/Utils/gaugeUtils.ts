import type {
    DashboardGraphQuery,
    DashboardGraphQueryDomain,
    DashboardLayoutItem,
    GaugeGraphFormat,
} from '@bv/api';
import { queryDomainSchema } from '@bv/api';
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

const COMPARISON_CALCULATION_INDEX = 1;
export const TARGET_CALCULATION_INDEX = 2;

export const templateGaugeGraph = (
    metricName: string,
    localize: LocalizeFn
) => {
    const format: GaugeGraphFormat = {
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
        filter: [],
        display: {
            showDecimals: false,
            compare: {
                isShowingComparison: true,
                calculation: COMPARISON_CALCULATION_INDEX,
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
                calculation: TARGET_CALCULATION_INDEX,
            },
        },
        alltimeData: true,
    };
    return format;
};

/**
 * Transforms a GaugeGraphFormat object into a DashboardGraphQuery.
 * - Builds a base calculation from `concept`.
 * - Adds a target calculation if `target` is a concept series (skips if `target` is a number).
 * - Applies domain filters from `filter` when provided.
 */
export function gaugeFormatToQuery(
    graphFormat: GaugeGraphFormat,
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

    // Target calculation when target is concept-based; skip when it's a manual number
    const targetCalculationIndex = calculations.length;

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

    if (graphFormat.display) {
        const nextDisplay: GaugeGraphFormat['display'] = {
            ...graphFormat.display,
            compare: {
                ...graphFormat.display.compare,
                calculation: COMPARISON_CALCULATION_INDEX,
                compareText: comparisonLabel,
            },
        };

        const displayTarget = graphFormat.display.target;
        if (
            displayTarget &&
            typeof displayTarget === 'object' &&
            'calculation' in displayTarget
        ) {
            nextDisplay.target = {
                ...displayTarget,
                calculation: targetCalculationIndex,
            };
        }

        graphFormat.display = nextDisplay;
    }

    // Domain-level filters (if any)
    const domainFilters = stripEmptyCompareFilters(
        getGraphDomainFilters(graphFormat)
    );
    const hasDomainFilters = domainFilters.length > 0;

    const query: DashboardGraphQuery = {
        calculations,
        ...(hasDomainFilters
            ? {
                  domain: queryDomainSchema.parse({
                      filter: domainFilters,
                  }),
              }
            : {}),
    };

    return query;
}

/**
 * Transforms a DashboardLayoutItem into a GaugeGraphFormat structure.
 */
export function layoutItemToGaugeFormat(
    layout: DashboardLayoutItem
): GaugeGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    // Base concept
    const baseConcept: GaugeGraphFormat['concept'] = conceptFromCalculation(
        calculations[0]
    );

    const display: GaugeGraphFormat['display'] = normalizeKpiDisplay(
        layout.graph.display,
        {
            comparisonCalculationIndex: COMPARISON_CALCULATION_INDEX,
            targetCalculationIndex: TARGET_CALCULATION_INDEX,
        }
    ) ?? {
        showDecimals: false,
        compare: {
            isShowingComparison: true,
            calculation: COMPARISON_CALCULATION_INDEX,
            compareText: '',
            measurement: '',
        },
        target: {
            calculation: TARGET_CALCULATION_INDEX,
        },
    };

    const displayTarget = display?.target;
    const displayCompare = display?.compare;
    const compareCalculationIndex = getDisplayCalculationIndex(
        displayCompare,
        COMPARISON_CALCULATION_INDEX,
        calculations.length
    );
    const targetCalculationIndex = getTargetCalculationIndex(
        displayTarget,
        TARGET_CALCULATION_INDEX,
        calculations.length
    );

    // Target: prefer calculation[1] concept; else manual number from display; else fallback to last-period of base
    const targetCalculation = calculations[targetCalculationIndex];

    const target: GaugeGraphFormat['concept'] = targetCalculation
        ? conceptFromCalculation(targetCalculation, true)
        : {
              concept_name: 'invoice_hours',
              deictic_modifier: -1,
              time_period: 'year',
          };

    const comparison: GaugeGraphFormat['comparison'] =
        compareCalculationIndex !== undefined &&
        calculations[compareCalculationIndex]
            ? conceptFromCalculation(calculations[compareCalculationIndex])
            : {
                  concept_name: baseConcept.concept_name,
                  deictic_modifier: -1,
                  time_period: baseConcept.time_period,
              };

    // Domain-level filters
    const domainFilters: DashboardGraphQueryDomain['filter'] = Array.isArray(
        query?.domain?.filter
    )
        ? [...query.domain.filter]
        : [];

    return {
        concept: baseConcept,
        calculationTimeFilter: calculations[0],
        comparison,
        target,
        filter: domainFilters,
        display,
        conceptTimeFilter: hasInPeriodFilterAtIndex(calculations, 0),
        comparisonTimeFilter: hasInPeriodFilterAtIndex(
            calculations,
            compareCalculationIndex
        ),
        targetTimeFilter: targetCalculation
            ? hasInPeriodFilterAtIndex(calculations, targetCalculationIndex)
            : false,
        alltimeData: isAlltimeData(calculations.slice(0, 3)),
    };
}
