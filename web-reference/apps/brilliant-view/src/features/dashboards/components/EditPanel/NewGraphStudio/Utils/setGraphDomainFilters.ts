import type { DashboardGraphQueryDomain, GraphFormatUnion } from '@bv/api';

export function setGraphDomainFilters(
    graph: GraphFormatUnion,
    filters: NonNullable<DashboardGraphQueryDomain['filter']>
): GraphFormatUnion {
    return 'target' in graph
        ? { ...graph, filter: filters }
        : { ...graph, domain: { ...graph.domain, filter: filters } };
}
