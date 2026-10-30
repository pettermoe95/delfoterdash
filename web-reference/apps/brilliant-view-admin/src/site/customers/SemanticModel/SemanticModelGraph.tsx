import type { Connection, Node, ReactFlowProps } from '@xyflow/react';
import { Background, Controls, ReactFlow, useReactFlow } from '@xyflow/react';
import type {
    SemanticGraph,
    SemanticModelDeleteTarget,
    SemanticRelation,
    SemanticRelationship,
    WarehouseSchema,
    WarehouseTable,
} from './semanticModel';
import { tableKey } from './semanticModel';
import { SemanticRoleNode } from './SemanticModelCanvas';
import type { useSemanticModelGraph } from './useSemanticModelGraph';

type SemanticModelGraphProps = ReturnType<typeof useSemanticModelGraph> & {
    graph?: SemanticGraph;
    warehouse?: WarehouseSchema;
    onSelectRelation: (relation: SemanticRelation) => void;
    onSelectRelationship: (
        relationship: SemanticRelationship | undefined
    ) => void;
    onConnect: (connection: Connection) => void;
    onCreateRole: (
        table: WarehouseTable,
        position: { x: number; y: number }
    ) => void;
    onDelete: (targets: SemanticModelDeleteTarget[]) => void;
};

export function SemanticModelGraph({
    graph,
    warehouse,
    nodes,
    edges,
    onNodesChange,
    onSelectRelation,
    onSelectRelationship,
    onConnect,
    onCreateRole,
    onDelete,
}: SemanticModelGraphProps) {
    const { screenToFlowPosition } = useReactFlow();
    const handleBeforeDelete: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onBeforeDelete']
    > = ({ nodes, edges }) => {
        const edgeIds = new Set(edges.map((edge) => edge.id));
        const targets: SemanticModelDeleteTarget[] = nodes.map((node) => ({
            kind: 'role',
            value: node.data,
        }));
        targets.push(
            ...(graph?.relationships ?? [])
                .filter((item) => edgeIds.has(item.relationshipName))
                .map((value) => ({ kind: 'edge' as const, value }))
        );
        if (targets.length) onDelete(targets);
        return Promise.resolve(false);
    };

    const handleNodeClick: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onNodeClick']
    > = (_, node) => onSelectRelation(node.data);

    const handleEdgeClick: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onEdgeClick']
    > = (_, edge) =>
        onSelectRelationship(
            graph?.relationships.find(
                (item) => item.relationshipName === edge.id
            )
        );

    const handleConnect: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onConnect']
    > = (connection) => {
        if (
            connection.source &&
            connection.target &&
            connection.source !== connection.target
        ) {
            onConnect(connection);
        }
    };

    const handleDragOver: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onDragOver']
    > = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop: NonNullable<
        ReactFlowProps<Node<SemanticRelation>>['onDrop']
    > = (event) => {
        event.preventDefault();
        const key = event.dataTransfer.getData('application/semantic-table');
        const table = warehouse?.tables.find((item) => tableKey(item) === key);
        if (table) {
            onCreateRole(
                table,
                screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
            );
        }
    };

    return (
        <div className="flex min-w-0 flex-1 flex-col rounded border border-secondary bg-primary">
            <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
                <div>
                    <h2 className="font-semibold">Relationship graph</h2>
                    <p className="text-sm text-tertiary">
                        Drag from a role’s right handle to another role to
                        define a directed join.
                    </p>
                </div>
            </div>
            <div className="min-h-[540px] flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={{ role: SemanticRoleNode }}
                    fitView
                    onBeforeDelete={handleBeforeDelete}
                    onNodesChange={onNodesChange}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onConnect={handleConnect}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
            <div className="border-t border-secondary px-4 py-2 text-sm text-error-primary">
                {graph?.relationships.some(
                    (item) => item.maximumTargetMatches === 'MANY'
                ) &&
                    'Red MANY edges cannot be used by the planner for aggregate joins.'}
            </div>
        </div>
    );
}
