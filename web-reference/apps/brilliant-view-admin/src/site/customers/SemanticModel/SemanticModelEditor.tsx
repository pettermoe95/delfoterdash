import type { Connection } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import type {
    SemanticModelDeleteTarget,
    SemanticRelation,
    SemanticRelationship,
    WarehouseTable,
} from './semanticModel';
import { semanticApiError } from './semanticModelApi';
import { WarehouseCatalogue } from './SemanticModelCanvas';
import { SemanticModelEditorDialog } from './SemanticModelEditorDialog';
import { SemanticModelGraph } from './SemanticModelGraph';
import { useSemanticModel } from './useSemanticModel';
import { useSemanticModelGraph } from './useSemanticModelGraph';

type SemanticModelEditorProps = {
    tenantId: string;
};

export function SemanticModelEditor({ tenantId }: SemanticModelEditorProps) {
    const [selectedRelation, setSelectedRelation] =
        useState<SemanticRelation>();
    const [selectedRelationship, setSelectedRelationship] =
        useState<SemanticRelationship>();
    const [createTable, setCreateTable] = useState<WarehouseTable>();
    const [createPosition, setCreatePosition] = useState<
        { x: number; y: number } | undefined
    >();
    const [preferredPositions, setPreferredPositions] = useState(
        new Map<string, { x: number; y: number }>()
    );
    const [connection, setConnection] = useState<Connection>();
    const [deleteTargets, setDeleteTargets] =
        useState<SemanticModelDeleteTarget[]>();
    const [error, setError] = useState<string>();
    const [refreshError, setRefreshError] = useState<string>();
    const closeEditorDialog = () => {
        setError(undefined);
        setRefreshError(undefined);
        setCreateTable(undefined);
        setCreatePosition(undefined);
        setConnection(undefined);
        setSelectedRelation(undefined);
        setSelectedRelationship(undefined);
        setDeleteTargets(undefined);
    };

    const { graph, warehouse, request, deleteElements, refreshGraph } =
        useSemanticModel({
            tenantId,
            onSaved: (modelRequest) => {
                const previousName = selectedRelation?.relationName;
                const nextName = modelRequest.body.relationName;
                const position = canvas.nodes.find(
                    (node) => node.id === previousName
                )?.position;
                if (
                    modelRequest.method === 'patch' &&
                    previousName !== undefined &&
                    modelRequest.suffix ===
                        `/relations/${encodeURIComponent(previousName)}` &&
                    typeof nextName === 'string' &&
                    nextName !== previousName &&
                    position
                ) {
                    setPreferredPositions((current) => {
                        const positions = new Map(current);
                        positions.delete(previousName);
                        positions.set(nextName, position);
                        return positions;
                    });
                }
            },
            onSuccess: closeEditorDialog,
            onError: setError,
            onRefreshError: (error) => {
                closeEditorDialog();
                setRefreshError(error);
            },
            onDeleteSuccess: closeEditorDialog,
            onDeleteError: (targets, error) => {
                setDeleteTargets(targets);
                setError(error);
            },
        });
    const canvas = useSemanticModelGraph({
        graph: graph.data,
        tenantId,
        preferredPositions,
    });
    if (graph.isLoading || warehouse.isLoading)
        return <p>Loading semantic model…</p>;
    if (
        (graph.isError && !graph.data) ||
        (warehouse.isError && !warehouse.data)
    )
        return (
            <p className="text-error-primary">
                {semanticApiError(graph.error ?? warehouse.error)}
            </p>
        );

    const handleSelectRelation: NonNullable<
        ComponentProps<typeof SemanticModelGraph>['onSelectRelation']
    > = (relation) => {
        setSelectedRelationship(undefined);
        setSelectedRelation(relation);
    };

    const handleSelectRelationship: NonNullable<
        ComponentProps<typeof SemanticModelGraph>['onSelectRelationship']
    > = (relationship) => {
        setSelectedRelation(undefined);
        setSelectedRelationship(relationship);
    };

    const handleConnect: NonNullable<
        ComponentProps<typeof SemanticModelGraph>['onConnect']
    > = (connection) => {
        setSelectedRelation(undefined);
        setSelectedRelationship(undefined);
        setConnection(connection);
    };

    const handleCreateRole: NonNullable<
        ComponentProps<typeof SemanticModelGraph>['onCreateRole']
    > = (table, position) => {
        setCreatePosition(position);
        setSelectedRelation(undefined);
        setSelectedRelationship(undefined);
        setConnection(undefined);
        setCreateTable(table);
    };

    const handleDelete = (targets: SemanticModelDeleteTarget[]) => {
        const relationNames = new Set(
            targets.flatMap((target) =>
                target.kind === 'role' ? [target.value.relationName] : []
            )
        );
        const connectedRelationships: SemanticModelDeleteTarget[] = (
            graph.data?.relationships ?? []
        )
            .filter(
                (relationship) =>
                    relationNames.has(relationship.sourceRelation) ||
                    relationNames.has(relationship.targetRelation)
            )
            .map((value) => ({ kind: 'edge', value }));
        const uniqueTargets = new Map(
            [...targets, ...connectedRelationships].map((target) => [
                target.kind === 'role'
                    ? `role:${target.value.relationName}`
                    : `edge:${target.value.relationshipName}`,
                target,
            ])
        );
        setError(undefined);
        setDeleteTargets([...uniqueTargets.values()]);
    };

    const handleConfirmDelete = () => {
        if (deleteTargets?.length) deleteElements.mutate(deleteTargets);
    };
    const handleRefresh = () => refreshGraph.mutate();

    const handleSubmitRole: NonNullable<
        ComponentProps<typeof SemanticModelEditorDialog>['onCreateRole']
    > = (body) => {
        if (createPosition && typeof body.relationName === 'string') {
            setPreferredPositions((current) =>
                new Map(current).set(
                    body.relationName as string,
                    createPosition
                )
            );
        }
        request.mutate({
            method: 'post',
            suffix: '/relations',
            body,
        });
    };

    return (
        <div className="flex min-h-0 flex-1 gap-4 text-primary">
            <SemanticModelGraph
                {...canvas}
                graph={graph.data}
                warehouse={warehouse.data}
                onSelectRelation={handleSelectRelation}
                onSelectRelationship={handleSelectRelationship}
                onConnect={handleConnect}
                onCreateRole={handleCreateRole}
                onDelete={handleDelete}
            />
            <aside className="flex h-full w-96 shrink-0 flex-col overflow-y-auto rounded border border-secondary bg-primary p-4">
                <WarehouseCatalogue
                    tables={warehouse.data?.tables ?? []}
                    tenantId={tenantId}
                />
            </aside>
            <SemanticModelEditorDialog
                state={{
                    createTable,
                    connection,
                    selectedRelation,
                    selectedRelationship,
                    deleteTargets,
                    error,
                    refreshError,
                }}
                tenantId={tenantId}
                relations={graph.data?.relations ?? []}
                warehouse={warehouse.data}
                pending={
                    request.isPending ||
                    deleteElements.isPending ||
                    refreshGraph.isPending
                }
                onCancel={closeEditorDialog}
                onRequest={request.mutate}
                onDelete={handleDelete}
                onConfirmDelete={handleConfirmDelete}
                onRefresh={handleRefresh}
                onCreateRole={handleSubmitRole}
            />
        </div>
    );
}
