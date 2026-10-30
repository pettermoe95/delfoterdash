import type {
    DashboardGraphQueryCalculations,
    GraphFormatUnion,
} from '@bv/api';
import {
    buildCalculation,
    conceptFromCalculation,
    isAlltimeData,
} from './graphTransformations';
import { isValidInPeriod } from './offsetAndPeriodFilterHelpers';

export function getCalculationTimeFilter(
    graph: GraphFormatUnion
): DashboardGraphQueryCalculations | undefined {
    if ('concept' in graph) {
        return buildCalculation(
            graph.concept,
            'conceptTimeFilter' in graph
                ? (graph.conceptTimeFilter ?? !graph.alltimeData)
                : !graph.alltimeData,
            graph.calculationTimeFilter
        );
    }

    return graph.calculations[0];
}

export function setCalculationTimeFilter(
    graph: GraphFormatUnion,
    calculation: DashboardGraphQueryCalculations
): GraphFormatUnion {
    if ('concept' in graph) {
        const hasTimeFilter =
            calculation.filter?.some(isValidInPeriod) ?? false;
        return {
            ...graph,
            calculationTimeFilter: calculation,
            concept: conceptFromCalculation(calculation),
            alltimeData: !hasTimeFilter,
            ...('target' in graph ? { conceptTimeFilter: hasTimeFilter } : {}),
        };
    }

    const calculations = [calculation, ...graph.calculations.slice(1)];
    return { ...graph, calculations, alltimeData: isAlltimeData(calculations) };
}
