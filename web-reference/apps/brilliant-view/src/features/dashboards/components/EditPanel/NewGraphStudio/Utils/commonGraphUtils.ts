import type {
    DashboardGraphQueryCalculations,
    GaugeGraphFormat,
    StatusGraphFormat,
} from '@bv/api';
import type { LocalizeFn } from './compareTextUtils';
import { buildConceptCompareText } from './compareTextUtils';
import { isValidInPeriod } from './offsetAndPeriodFilterHelpers';

// Gauge and Status
type ComparisonInput = Pick<
    GaugeGraphFormat | StatusGraphFormat,
    | 'concept'
    | 'comparison'
    | 'conceptTimeFilter'
    | 'comparisonTimeFilter'
    | 'alltimeData'
>;

export function getComparisonConceptAndFilter(input: ComparisonInput) {
    const useConceptPriorComparison = input.conceptTimeFilter === true;
    const comparisonConcept = useConceptPriorComparison
        ? {
              ...input.comparison,
              time_period: input.concept.time_period,
              deictic_modifier: (input.concept.deictic_modifier ?? 0) - 1,
          }
        : input.comparison;
    const comparisonUseTimeFilter = useConceptPriorComparison
        ? true
        : (input.comparisonTimeFilter ?? !input.alltimeData);

    return {
        comparisonConcept,
        comparisonUseTimeFilter,
        useConceptPriorComparison,
    };
}

export function buildComparisonLabel(params: {
    baseConceptName: string;
    baseConceptOffset?: number;
    comparisonConcept: GaugeGraphFormat['comparison'];
    comparisonUseTimeFilter: boolean;
    useConceptPriorComparison: boolean;
    localize: LocalizeFn;
}) {
    const {
        baseConceptName,
        baseConceptOffset,
        comparisonConcept,
        comparisonUseTimeFilter,
        useConceptPriorComparison,
        localize,
    } = params;

    const effectiveUsePriorLabel =
        useConceptPriorComparison && (baseConceptOffset ?? 0) < 0;

    return buildConceptCompareText({
        baseConceptName,
        period: comparisonConcept.time_period,
        offset: comparisonConcept.deictic_modifier,
        useTimeFilter: comparisonUseTimeFilter,
        usePriorLabel: effectiveUsePriorLabel,
        localize,
    });
}

export function getDisplayCalculationIndex(
    displaySection: unknown,
    fallbackIndex: number,
    calculationsLength: number
): number | undefined {
    if (
        displaySection &&
        typeof displaySection === 'object' &&
        'calculation' in displaySection
    ) {
        const calculation = (displaySection as { calculation?: unknown })
            .calculation;
        if (typeof calculation === 'number') {
            return calculation;
        }
    }

    return calculationsLength > fallbackIndex ? fallbackIndex : undefined;
}

export function getTargetCalculationIndex(
    displaySection: unknown,
    fallbackIndex: number,
    calculationsLength: number
): number {
    if (
        displaySection &&
        typeof displaySection === 'object' &&
        'calculation' in displaySection
    ) {
        const calculation = (displaySection as { calculation?: unknown })
            .calculation;
        if (typeof calculation === 'number') {
            return calculation;
        }
    }

    return calculationsLength > fallbackIndex
        ? fallbackIndex
        : Math.min(calculationsLength - 1, fallbackIndex);
}

export function hasInPeriodFilterAtIndex(
    calculations: DashboardGraphQueryCalculations[],
    index: number | undefined
): boolean {
    if (index === undefined) return false;
    const target = calculations?.[index];
    return Array.isArray(target?.filter)
        ? target.filter?.some(isValidInPeriod)
        : false;
}
