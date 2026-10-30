import { Handle, Position } from '@xyflow/react';
import type { DragEvent } from 'react';
import type { SemanticRelation, WarehouseTable } from './semanticModel';
import { tableKey, warehouseValue } from './semanticModel';

type SemanticRoleNodeProps = {
    data: SemanticRelation & { tenantId: string };
};

export function SemanticRoleNode({ data }: SemanticRoleNodeProps) {
    const schema =
        data.physicalSchema === null || data.physicalSchema === data.tenantId
            ? 'tenant'
            : data.physicalSchema;
    return (
        <div className="min-w-40 rounded border border-brand-primary bg-primary px-3 py-2 shadow-sm">
            <Handle
                type="target"
                position={Position.Left}
                className="!h-4 !w-4 !border-[3px] !border-solid !border-[var(--bg-primary)] !bg-brand-solid-primary"
            />
            <div className="font-semibold text-brand-primary">
                {data.relationName}
            </div>
            <div className="mt-1 text-xs text-tertiary">
                {schema ? `${schema}.` : ''}
                {data.physicalTable}
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!h-4 !w-4 !border-[3px] !border-solid !border-[var(--bg-primary)] !bg-brand-solid-primary"
            />
        </div>
    );
}

type WarehouseCatalogueProps = {
    tables: WarehouseTable[];
    tenantId: string;
};

export function WarehouseCatalogue({
    tables,
    tenantId,
}: WarehouseCatalogueProps) {
    const handleDragStart = (
        table: WarehouseTable,
        event: DragEvent<HTMLDivElement>
    ) =>
        event.dataTransfer.setData(
            'application/semantic-table',
            tableKey(table)
        );

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="font-semibold">Physical table catalogue</h3>
            <p className="mb-2 text-xs text-tertiary">
                Read-only warehouse schema. A table may back more than one role.
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto text-sm">
                {tables.map((table) => (
                    <div
                        key={tableKey(table)}
                        className="mb-1 cursor-grab rounded bg-secondary px-2 py-1 active:cursor-grabbing"
                        draggable
                        onDragStart={(event) => handleDragStart(table, event)}
                    >
                        <div className="font-medium">
                            {warehouseValue(table.schema) === tenantId
                                ? 'tenant'
                                : warehouseValue(table.schema)}
                            .{warehouseValue(table.name)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
