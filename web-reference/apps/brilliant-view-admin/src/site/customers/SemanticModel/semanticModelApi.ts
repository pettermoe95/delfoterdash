import { asRecord } from '~/utils/typeGuards';
import axios from 'axios';
import type { Predicate, SemanticGraph } from './semanticModel';

export const semanticPath = (tenantId: string, suffix: string) =>
    `v1/admin/tenants/${tenantId}/semantic${suffix}`;

export function normaliseGraph(data: {
    relations: Record<string, unknown>[];
    relationships: Record<string, unknown>[];
}): SemanticGraph {
    return {
        relations: data.relations.map((item) => ({
            relationName: item.relation_name as string,
            physicalTable: item.physical_table as string,
            physicalSchema: (item.physical_schema as string | null) ?? null,
            predicate: (item.predicate as Predicate | null) ?? null,
        })),
        relationships: data.relationships.map((item) => ({
            relationshipName: item.relationship_name as string,
            sourceRelation: item.source_relation as string,
            targetRelation: item.target_relation as string,
            predicate: item.predicate as Predicate,
            maximumTargetMatches: item.maximum_target_matches as 'ONE' | 'MANY',
            requiredness: item.requiredness as 'REQUIRED' | 'OPTIONAL',
            joinType: item.join_type as 'INNER' | 'LEFT',
        })),
    };
}

export function semanticApiBody(body: Record<string, unknown>) {
    return 'relationName' in body
        ? {
              relation_name: body.relationName,
              physical_table: body.physicalTable,
              physical_schema: body.physicalSchema,
              predicate: body.predicate,
          }
        : {
              relationship_name: body.relationshipName,
              source_relation: body.sourceRelation,
              target_relation: body.targetRelation,
              predicate: body.predicate,
              maximum_target_matches: body.maximumTargetMatches,
              requiredness: body.requiredness,
              join_type: body.joinType,
          };
}

export function semanticApiError(error: unknown) {
    if (axios.isAxiosError<unknown>(error)) {
        const message = asRecord(error.response?.data)?.message;
        return typeof message === 'string' ? message : error.message;
    }
    return error instanceof Error ? error.message : 'The request failed.';
}
