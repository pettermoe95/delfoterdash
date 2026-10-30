import type {
    CylinderGraphFormat,
    DashboardGraphQuery,
    DashboardLayoutItem,
} from '@bv/api';
import { normalizeDashboardDisplay, queryDomainSchema } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import {
    getTargetCalculationIndex,
    hasInPeriodFilterAtIndex,
} from './commonGraphUtils';
import { TARGET_CALCULATION_INDEX } from './gaugeUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import {
    buildCalculation,
    conceptFromCalculation,
    isAlltimeData,
} from './graphTransformations';

export const templateCylinderGraph = (metricName: string) => {
    const format: CylinderGraphFormat = {
        concept: {
            concept_name: metricName,
            deictic_modifier: 0,
            time_period: 'year',
        },
        target: {
            concept_name: metricName,
            deictic_modifier: -1,
            time_period: 'year',
        },
        conceptTimeFilter: false,
        targetTimeFilter: false,
        filter: [],
        display: {
            showDecimals: false,
            target: {
                calculation: TARGET_CALCULATION_INDEX,
            },
        },
        alltimeData: true,
    };
    return format;
};

export function cylinderFormatToQuery(
    graphFormat: CylinderGraphFormat
): DashboardGraphQuery {
    const calculations: DashboardGraphQuery['calculations'] = [];

    // Base calculation from concept
    const baseCalc = buildCalculation(
        graphFormat.concept,
        graphFormat.conceptTimeFilter ?? !graphFormat.alltimeData,
        graphFormat.calculationTimeFilter
    );
    calculations.push(baseCalc);

    // Target calculation when target is concept-based; skip when it's a manual number
    const targetCalculationIndex = calculations.length;

    const targetCalc = buildCalculation(
        graphFormat.target,
        graphFormat.targetTimeFilter ?? !graphFormat.alltimeData
    );
    calculations.push(targetCalc);

    if (graphFormat.display) {
        const nextDisplay: CylinderGraphFormat['display'] = {
            ...graphFormat.display,
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
 * Transforms a DashboardLayoutItem into a CylinderGraphFormat structure.
 */
export function layoutItemToCylinderFormat(
    layout: DashboardLayoutItem
): CylinderGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    // Base concept
    const baseConcept: CylinderGraphFormat['concept'] = conceptFromCalculation(
        calculations[0]
    );

    const normalizedDisplay: unknown = normalizeDashboardDisplay(
        layout.graph.display ?? {}
    );
    const normalizedTarget = isRecord(normalizedDisplay)
        ? normalizedDisplay.target
        : undefined;
    const display: CylinderGraphFormat['display'] = isRecord(normalizedDisplay)
        ? {
              ...normalizedDisplay,
              showDecimals:
                  typeof normalizedDisplay.showDecimals === 'boolean'
                      ? normalizedDisplay.showDecimals
                      : false,
              target:
                  isRecord(normalizedTarget) &&
                  typeof normalizedTarget.target === 'number' &&
                  typeof normalizedTarget.measurement === 'string'
                      ? {
                            target: normalizedTarget.target,
                            measurement: normalizedTarget.measurement,
                        }
                      : {
                            calculation:
                                isRecord(normalizedTarget) &&
                                typeof normalizedTarget.calculation === 'number'
                                    ? normalizedTarget.calculation
                                    : TARGET_CALCULATION_INDEX,
                        },
          }
        : {
              showDecimals: false,
              target: {
                  calculation: TARGET_CALCULATION_INDEX,
              },
          };

    const targetCalculationIndex = getTargetCalculationIndex(
        display?.target,
        TARGET_CALCULATION_INDEX,
        calculations.length
    );

    // Target: prefer calculation[1] concept; else manual number from display; else fallback to last-period of base
    const targetCalculation = calculations[targetCalculationIndex];

    const target: CylinderGraphFormat['concept'] = targetCalculation
        ? conceptFromCalculation(targetCalculation, true)
        : {
              concept_name: 'invoice_hours',
              deictic_modifier: -1,
              time_period: 'year',
          };

    // Domain-level filters
    const domainFilters = Array.isArray(query?.domain?.filter)
        ? query.domain.filter
        : [];

    const cylinder: CylinderGraphFormat = {
        concept: baseConcept,
        calculationTimeFilter: calculations[0],
        target,
        filter: domainFilters,
        display,
        conceptTimeFilter: hasInPeriodFilterAtIndex(calculations, 0),
        targetTimeFilter: targetCalculation
            ? hasInPeriodFilterAtIndex(calculations, targetCalculationIndex)
            : false,
        alltimeData: isAlltimeData(calculations),
    };

    return cylinder;
}
