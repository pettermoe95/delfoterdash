export type Predicate =
    | {
          type: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte';
          left: Operand;
          right: Operand;
      }
    | {
          type: 'between';
          operand: ColumnOperand;
          lower: ColumnOperand;
          upper: ColumnOperand;
      }
    | { type: 'and' | 'or'; predicates: Predicate[] }
    | { type: 'not'; predicate: Predicate }
    | { type: 'in'; operand: ColumnOperand; values: LiteralOperand[] }
    | { type: 'is_null'; operand: Operand };

export type ColumnOperand = { relation: string; column: string };
export const literalTypes = ['TEXT', 'NUMBER', 'BOOLEAN', 'DATE'] as const;

export type LiteralOperand = {
    value: string;
    literal_type: (typeof literalTypes)[number];
};
export type Operand = ColumnOperand | LiteralOperand;

export type SemanticRelation = {
    relationName: string;
    physicalTable: string;
    physicalSchema: string | null;
    predicate: Predicate | null;
};

export type SemanticRelationship = {
    relationshipName: string;
    sourceRelation: string;
    targetRelation: string;
    predicate: Predicate;
    maximumTargetMatches: 'ONE' | 'MANY';
    requiredness: 'REQUIRED' | 'OPTIONAL';
    joinType: 'INNER' | 'LEFT';
};

export type SemanticGraph = {
    relations: SemanticRelation[];
    relationships: SemanticRelationship[];
};

export type SemanticModelDeleteTarget =
    | { kind: 'role'; value: SemanticRelation }
    | { kind: 'edge'; value: SemanticRelationship };

export type WarehouseColumn = { name: string; dataType?: string };
export type WarehouseTable = {
    schema: string | { value: string };
    name: string | { value: string };
    columns: WarehouseColumn[];
};

export type WarehouseSchema = { tables: WarehouseTable[] };

export function warehouseValue(value: string | { value: string }) {
    return typeof value === 'string' ? value : value.value;
}

export function tableKey(table: WarehouseTable) {
    return `${warehouseValue(table.schema)}.${warehouseValue(table.name)}`;
}

export function relationColumns(
    relation: SemanticRelation | undefined,
    warehouse: WarehouseSchema | undefined,
    tenantId: string
) {
    if (!relation || !warehouse) return [];
    return (
        warehouse.tables.find(
            (table) =>
                warehouseValue(table.name) === relation.physicalTable &&
                warehouseValue(table.schema) ===
                    (relation.physicalSchema ?? tenantId)
        )?.columns ?? []
    );
}
