import { Background, Controls, ReactFlow, useReactFlow } from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';
import type { DragEvent } from 'react';
import { canConnect, withDependencies } from '../model/graph';
import type { ValidationIssue } from '../model/validation';
import type { ValidationTarget } from '../panels/ValidationIssues';
import type { EditorController } from '../state/useEditor';
import type { EditorTheme } from '../state/useEditorTheme';
import { workerByType } from '../workers/registry';
import { useCanvasChanges } from './useCanvasChanges';
import { useNodeMeasurements } from './useNodeMeasurements';
import { WorkerNode } from './WorkerNode';
import type { CanvasNode } from './WorkerNode';

const nodeTypes = { worker: WorkerNode };
type CanvasProps = {
    editor: EditorController;
    issues: ValidationIssue[];
    theme: EditorTheme;
    focusTarget?: ValidationTarget;
    onIssueSelect: (issue: ValidationIssue) => void;
};
export function Canvas({
    editor,
    issues,
    theme,
    focusTarget,
    onIssueSelect,
}: CanvasProps) {
    const { screenToFlowPosition, fitView } = useReactFlow();
    const { document, selectedIds, busy, renameWorker, liveJobs } = editor;
    const fittedInsertion = useRef<Set<string>>();
    useEffect(() => {
        const insertion = editor.insertion;
        if (!insertion || fittedInsertion.current === insertion) return;
        const nodes = document.jobs
            .filter((job) => !insertion.has(job.id))
            .map(({ id }) => ({ id }));
        if (!nodes.length) return;
        fittedInsertion.current = insertion;
        void fitView({
            nodes,
            padding: 0.2,
            duration: 250,
            minZoom: 0.01,
            maxZoom: 1.25,
        });
    }, [editor.insertion, document.jobs, fitView]);
    const focusJobExists = document.jobs.some(
        (job) => job.id === focusTarget?.jobId
    );
    useEffect(() => {
        if (focusTarget?.jobId && focusJobExists)
            void fitView({
                nodes: [{ id: focusTarget.jobId }],
                padding: 0.6,
                maxZoom: 1.25,
                duration: 250,
            });
    }, [focusTarget, fitView, focusJobExists]);
    const { measurements, measure } = useNodeMeasurements(editor.document.jobs);
    const {
        selectedEdgeIds,
        onNodesChange,
        onEdgesChange,
        onDelete,
        clearSelection,
    } = useCanvasChanges(editor, measure);
    const nodes: CanvasNode[] = useMemo(
        () =>
            document.jobs.map((job) => {
                const definition = workerByType(job.type);
                return {
                    id: job.id,
                    type: 'worker',
                    width: 218,
                    height: 96,
                    // Keep React Flow's bounds when rebuilding controlled nodes.
                    // Without them, it treats nodes as unmeasured during box selection.
                    measured: measurements.get(job.id),
                    position: job.position,
                    selected: selectedIds.includes(job.id),
                    data: {
                        worker: definition?.name ?? job.type,
                        category: definition?.category ?? 'Unknown',
                        errors: issues.filter((issue) => issue.jobId === job.id)
                            .length,
                        update: Object.hasOwn(liveJobs.updates, job.id)
                            ? liveJobs.updates[job.id]
                            : undefined,
                        disabled: busy,
                        onRename: (name) => renameWorker(job.id, name),
                        onIssue: () => {
                            const issue = issues.find(
                                (item) => item.jobId === job.id
                            );
                            if (issue) onIssueSelect(issue);
                        },
                    },
                };
            }),
        [
            document.jobs,
            selectedIds,
            busy,
            renameWorker,
            liveJobs.updates,
            issues,
            measurements,
            onIssueSelect,
        ]
    );
    const edges = editor.document.jobs.flatMap((job) =>
        job.dependencies.map((source) => ({
            id: `${source}:${job.id}`,
            source,
            target: job.id,
            selected: selectedEdgeIds.includes(`${source}:${job.id}`),
        }))
    );
    const connect = ({ source, target }: Connection) => {
        if (!canConnect(editor.document.jobs, source, target)) return;
        editor.updateJob(target, (job) =>
            withDependencies(job, [...job.dependencies, source])
        );
    };
    const dropWorker = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        const definition = workerByType(
            event.dataTransfer.getData('application/bv-worker-v2')
        );
        if (definition && !editor.busy)
            editor.addWorker(
                definition,
                screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
            );
    };
    return (
        <main
            className="we-canvas"
            aria-label="Workflow canvas"
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={dropWorker}
        >
            <ReactFlow<CanvasNode>
                colorMode={theme}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onConnect={connect}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onDelete={onDelete}
                onNodeDragStop={() => editor.dispatch({ type: 'endGroup' })}
                onPaneClick={clearSelection}
                isValidConnection={(connection) =>
                    canConnect(
                        editor.document.jobs,
                        connection.source,
                        connection.target
                    )
                }
                nodesDraggable={!editor.busy}
                nodesConnectable={!editor.busy}
                connectionRadius={28}
                deleteKeyCode={editor.busy ? null : ['Backspace', 'Delete']}
                minZoom={0.1}
                maxZoom={2}
                fitView
                multiSelectionKeyCode="Shift"
                selectionOnDrag
            >
                <Background gap={24} />
                <Controls />
            </ReactFlow>
            {!nodes.length && (
                <div className="we-empty">
                    <h2>Build your workflow</h2>
                    <p>
                        Drag workers from the palette, or click one to add it.
                    </p>
                    <p>
                        Connect workers to declare dependencies. Each worker
                        waits for all its inputs.
                    </p>
                </div>
            )}
        </main>
    );
}
