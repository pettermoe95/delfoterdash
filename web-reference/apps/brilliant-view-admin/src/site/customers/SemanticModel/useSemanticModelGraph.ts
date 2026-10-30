import type { Node, NodeChange } from '@xyflow/react';
import { applyNodeChanges, MarkerType } from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';
import type { SemanticGraph, SemanticRelation } from './semanticModel';
import { layoutSemanticGraph } from './semanticModelLayout';

export function useSemanticModelGraph({
    graph,
    tenantId,
    preferredPositions,
}: {
    graph?: SemanticGraph;
    tenantId: string;
    preferredPositions: Map<string, { x: number; y: number }>;
}) {
    const [canvasNodes, setCanvasNodes] = useState<Node<SemanticRelation>[]>(
        []
    );
    useEffect(() => {
        if (!graph) return;
        const positions = layoutSemanticGraph(graph);
        setCanvasNodes((currentNodes) =>
            graph.relations.map((relation) => {
                const currentNode = currentNodes.find(
                    (node) => node.id === relation.relationName
                );
                return {
                    id: relation.relationName,
                    type: 'role',
                    position: currentNode?.position ??
                        preferredPositions.get(relation.relationName) ??
                        positions.get(relation.relationName) ?? {
                            x: 100,
                            y: 100,
                        },
                    data: { ...relation, tenantId },
                };
            })
        );
    }, [graph, tenantId, preferredPositions]);

    const onNodesChange = (changes: NodeChange<Node<SemanticRelation>>[]) =>
        setCanvasNodes((currentNodes) =>
            applyNodeChanges(changes, currentNodes)
        );
    const edges = useMemo(
        () =>
            (graph?.relationships ?? []).map((relationship) => ({
                id: relationship.relationshipName,
                source: relationship.sourceRelation,
                target: relationship.targetRelation,
                label: `${relationship.relationshipName} · ${relationship.maximumTargetMatches}`,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 28,
                    height: 28,
                },
                className:
                    relationship.maximumTargetMatches === 'MANY'
                        ? '[&_.react-flow__edge-path]:!stroke-[var(--fg-error-primary)] [&_.react-flow__edge-path]:!stroke-2'
                        : undefined,
            })),
        [graph?.relationships]
    );
    return { nodes: canvasNodes, edges, onNodesChange };
}
