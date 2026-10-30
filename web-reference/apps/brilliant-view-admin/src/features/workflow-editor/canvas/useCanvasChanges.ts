import type { EdgeChange, NodeChange, OnDelete } from '@xyflow/react';
import { useEffect, useState } from 'react';
import type { EditorController } from '../state/useEditor';
import type { CanvasNode } from './WorkerNode';

type SelectionChange = { type: 'select'; id: string; selected: boolean };
function applySelection(current: string[], changes: SelectionChange[]) {
    const selected = new Set(current);
    for (const change of changes) {
        if (change.selected) selected.add(change.id);
        else selected.delete(change.id);
    }
    return [...selected];
}

export function useCanvasChanges(
    editor: EditorController,
    measure: (changes: NodeChange<CanvasNode>[]) => void
) {
    const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
    useEffect(() => {
        const existing = new Set(
            editor.document.jobs.flatMap((job) =>
                job.dependencies.map((source) => `${source}:${job.id}`)
            )
        );
        setSelectedEdgeIds((current) => {
            const retained = current.filter((id) => existing.has(id));
            return retained.length === current.length ? current : retained;
        });
    }, [editor.document.jobs]);
    const onNodesChange = (changes: NodeChange<CanvasNode>[]) => {
        measure(changes);
        const moves = changes.flatMap((change) =>
            change.type === 'position' && change.position
                ? [{ id: change.id, position: change.position }]
                : []
        );
        if (moves.length)
            editor.edit(
                (document) => ({
                    ...document,
                    jobs: document.jobs.map((job) => {
                        const move = moves.find(
                            (change) => change.id === job.id
                        );
                        return move?.position
                            ? { ...job, position: move.position }
                            : job;
                    }),
                }),
                'move'
            );
        const selections = changes.filter((change) => change.type === 'select');
        if (selections.length)
            editor.setSelectedIds((current) =>
                applySelection(current, selections)
            );
    };
    const onEdgesChange = (changes: EdgeChange[]) => {
        const selections = changes.filter((change) => change.type === 'select');
        if (selections.length)
            setSelectedEdgeIds((current) =>
                applySelection(current, selections)
            );
    };
    // React Flow emits separate removal changes first. Persist only its combined deletion.
    const onDelete: OnDelete<CanvasNode> = ({ nodes, edges }) =>
        editor.removeElements(
            nodes.map((node) => node.id),
            edges.map((edge) => edge.id)
        );
    const clearSelection = () => {
        editor.setSelectedIds([]);
        setSelectedEdgeIds([]);
    };
    return {
        selectedEdgeIds,
        onNodesChange,
        onEdgesChange,
        onDelete,
        clearSelection,
    };
}
