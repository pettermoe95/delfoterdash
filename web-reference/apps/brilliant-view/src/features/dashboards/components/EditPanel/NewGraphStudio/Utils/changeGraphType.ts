import type {
    ExtensiveDashboardConceptMetric,
    GraphFormatUnion,
} from '@bv/api';
import { templateAxisGraph } from './axisUtils';
import {
    getCalculationTimeFilter,
    setCalculationTimeFilter,
} from './calculationTimeFilter';
import type { LocalizeFn } from './compareTextUtils';
import { templateCylinderGraph } from './cylinderUtils';
import { templateFunnelGraph } from './funnelUtils';
import { templateGaugeGraph } from './gaugeUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import { GraphTypeId } from './graphTypeIds';
import { isValidInPeriod } from './offsetAndPeriodFilterHelpers';
import { templatePieGraph } from './pieUtils';
import { setGraphDomainFilters } from './setGraphDomainFilters';
import { templateStatusGraph } from './statusUtils';
import { templateTableGraph } from './tableUtils';

export function changeGraphType(
    graphData: GraphFormatUnion,
    nextGraphType: GraphTypeId,
    metrics: ExtensiveDashboardConceptMetric[],
    localize: LocalizeFn,
    graphToRestore?: GraphFormatUnion
): GraphFormatUnion {
    const filters = getGraphDomainFilters(graphData);
    const calculation = getCalculationTimeFilter(graphData);

    // Returning to the original type restores its series and presentation,
    // while retaining filter edits made when previewing other graph types.
    if (graphToRestore) {
        const originalCalculation = getCalculationTimeFilter(graphToRestore);
        const restored =
            calculation && originalCalculation
                ? setCalculationTimeFilter(graphToRestore, {
                      ...originalCalculation,
                      filter: [
                          ...(originalCalculation.filter ?? []).filter(
                              (filter) => !isValidInPeriod(filter)
                          ),
                          ...(calculation.filter ?? []).filter(isValidInPeriod),
                      ],
                  })
                : graphToRestore;
        return setGraphDomainFilters(restored, filters);
    }

    const metricName = calculation?.aggregate ?? '';
    const metric = metrics.find((item) => item.concept_name === metricName);
    const selectedMetric = metric ?? {
        concept_name: metricName,
        concept_name_pretty: metricName,
    };

    let graph: GraphFormatUnion;
    switch (nextGraphType) {
        case GraphTypeId.axis:
            graph = templateAxisGraph(selectedMetric, true, {
                group: ['month'],
            });
            break;
        case GraphTypeId.gauge:
            graph = templateGaugeGraph(metricName, localize);
            break;
        case GraphTypeId.cylinder:
            graph = templateCylinderGraph(metricName);
            break;
        case GraphTypeId.status:
            graph = templateStatusGraph(metricName, localize);
            break;
        case GraphTypeId.pie:
            graph = templatePieGraph(metricName);
            break;
        case GraphTypeId.table:
            graph = templateTableGraph(selectedMetric, metric?.unit_name);
            break;
        case GraphTypeId.funnel:
            graph = templateFunnelGraph(selectedMetric, true);
            break;
    }

    return setGraphDomainFilters(
        calculation ? setCalculationTimeFilter(graph, calculation) : graph,
        filters
    );
}
