import type { GraphFormatUnion } from '@bv/api';

export function getGraphDomainFilters(graph: GraphFormatUnion) {
    // KPI forms store graph filters at the root, independently of their domain.
    if ('target' in graph) {
        return graph.filter ?? [];
    }

    // Other forms use domain.filter; pie graphs also support the legacy root field.
    return (
        ('domain' in graph ? graph.domain?.filter : undefined) ??
        ('filter' in graph ? graph.filter : undefined) ??
        []
    );
}
