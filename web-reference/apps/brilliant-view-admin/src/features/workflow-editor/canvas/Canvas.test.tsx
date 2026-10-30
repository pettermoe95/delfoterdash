// @vitest-environment jsdom
import type { ReactFlowProps } from '@xyflow/react';
import type * as ReactFlowModule from '@xyflow/react';
import { act, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { emptyDocument } from '../model/schema';
import type { EditorJob, WorkflowDocument } from '../model/schema';
import { createHistory, historyReducer } from '../state/history';
import type { History } from '../state/history';
import type { EditorController } from '../state/useEditor';
import { useJobActions } from '../state/useJobActions';
import { required } from '../test/required';
import { Canvas } from './Canvas';
import type { CanvasNode } from './WorkerNode';

const flow = vi.hoisted((): { props: ReactFlowProps<CanvasNode> } => ({
    props: {},
}));
vi.mock('@xyflow/react', async (original) => ({
    ...(await original<typeof ReactFlowModule>()),
    useReactFlow: () => ({ screenToFlowPosition: vi.fn() }),
    ReactFlow: (props: ReactFlowProps<CanvasNode>) => {
        flow.props = props;
        return null;
    },
}));

it('keeps measured bounds on controlled nodes across selection, live status and position updates', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const editor = {
        document: {
            ...emptyDocument(),
            jobs: [
                {
                    id: 'fetch',
                    name: 'fetch',
                    type: 'JsonFetcher',
                    config: {},
                    dependencies: [],
                    execution: {},
                    position: { x: 0, y: 0 },
                },
            ],
        },
        selectedIds: [],
        busy: false,
        liveJobs: { updates: {} },
    } as unknown as EditorController;
    const container = document.createElement('div');
    const root = createRoot(container);
    const render = () =>
        act(() => {
            root.render(
                <Canvas
                    editor={editor}
                    issues={[]}
                    theme="light"
                    onIssueSelect={vi.fn()}
                />
            );
        });
    try {
        render();
        act(() => {
            flow.props.onNodesChange?.([
                {
                    type: 'dimensions',
                    id: 'fetch',
                    dimensions: { width: 218, height: 96 },
                },
            ]);
        });
        const measured = { width: 218, height: 96 };
        expect(flow.props.nodes?.[0].measured).toEqual(measured);
        editor.selectedIds = ['fetch'];
        render();
        expect(flow.props.nodes?.[0].measured).toEqual(measured);
        editor.liveJobs.updates = {
            fetch: {
                receivedAt: Date.now(),
                message: {
                    name: 'WorkflowJobWasStarted',
                    workflowId: 'workflow',
                    tenantId: 'tenant',
                    occurredAt: '2026-10-22T12:00:00Z',
                    payload: { jobId: 'fetch' },
                },
            },
        };
        render();
        expect(flow.props.nodes?.[0].data.update).toBeDefined();
        expect(flow.props.nodes?.[0].measured).toEqual(measured);
        editor.document = {
            ...editor.document,
            jobs: editor.document.jobs.map((job) => ({
                ...job,
                position: { x: 100, y: 100 },
            })),
        };
        render();
        expect(flow.props.nodes?.[0].measured).toEqual(measured);
        expect(editor.document.jobs[0]).not.toHaveProperty('measured');
    } finally {
        act(() => {
            root.unmount();
        });
    }
});

it.each([
    { name: 'a connected worker', jobIds: ['a'], edgeIds: [] },
    { name: 'multiple connected workers', jobIds: ['a', 'b'], edgeIds: [] },
    { name: 'only a connection', jobIds: [], edgeIds: ['a:dim'] },
    {
        name: 'a worker and an unrelated selected connection',
        jobIds: ['a'],
        edgeIds: ['b:dim'],
    },
])(
    'deletes $name in one undo step, including Dim input configuration',
    ({ jobIds, edgeIds }) => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const sources: EditorJob[] = ['a', 'b', 'c'].map((id) => ({
            id,
            name: id,
            type: 'JsonLoader',
            config: {},
            dependencies: [],
            execution: {},
            position: { x: 0, y: 0 },
        }));
        const original: WorkflowDocument = {
            ...emptyDocument(),
            jobs: [
                ...sources,
                {
                    id: 'dim',
                    name: 'dim',
                    type: 'DimWorkerV2',
                    dependencies: ['a', 'b', 'c'],
                    config: {
                        entity: 'employees',
                        dataConfig: {
                            inputs: sources.map(({ id }) => ({
                                jobId: id,
                                identityColumn: `${id}_id`,
                            })),
                            merging: [],
                            columnPriorities: [],
                        },
                    },
                    execution: {},
                    position: { x: 280, y: 0 },
                },
            ],
        };
        let history: History | undefined;
        let undo: () => void;
        let redo: () => void;
        function Probe() {
            const [state, dispatch] = useReducer(
                historyReducer<WorkflowDocument>,
                createHistory(original)
            );
            const [selectedIds, setSelectedIds] = useState<string[]>([]);
            history = state;
            undo = () => dispatch({ type: 'undo' });
            redo = () => dispatch({ type: 'redo' });
            const actions = useJobActions({
                document: state.present,
                edit: (update, group) =>
                    dispatch({ type: 'edit', update, group }),
                setSelectedIds,
            });
            const editor = {
                ...actions,
                document: state.present,
                selectedIds,
                setSelectedIds,
                dispatch,
                busy: false,
                liveJobs: { updates: {} },
            } as unknown as EditorController;
            return (
                <Canvas
                    editor={editor}
                    issues={[]}
                    theme="light"
                    onIssueSelect={vi.fn()}
                />
            );
        }
        const root = createRoot(document.createElement('div'));
        try {
            act(() => root.render(<Probe />));
            const nodes = required(flow.props.nodes).filter((node) =>
                jobIds.includes(node.id)
            );
            const edges = required(flow.props.edges).filter(
                (edge) =>
                    jobIds.includes(edge.source) ||
                    jobIds.includes(edge.target) ||
                    edgeIds.includes(edge.id)
            );
            // Match React Flow's actual callback order: edges, nodes, then combined deletion.
            act(() =>
                flow.props.onEdgesChange?.(
                    edges.map(({ id }) => ({ type: 'remove', id }))
                )
            );
            act(() =>
                flow.props.onNodesChange?.(
                    nodes.map(({ id }) => ({ type: 'remove', id }))
                )
            );
            expect(required(history).present).toEqual(original);
            expect(required(history).past).toHaveLength(0);
            act(() => flow.props.onDelete?.({ nodes, edges }));
            const deleted = required(history).present;
            const remainingInputs = sources
                .filter(
                    ({ id }) =>
                        !jobIds.includes(id) && !edgeIds.includes(`${id}:dim`)
                )
                .map(({ id }) => id);
            expect(deleted.jobs.map(({ id }) => id)).toEqual(
                original.jobs
                    .map(({ id }) => id)
                    .filter((id) => !jobIds.includes(id))
            );
            expect(deleted.jobs.at(-1)).toMatchObject({
                dependencies: remainingInputs,
                config: {
                    dataConfig: {
                        inputs: remainingInputs.map((id) => ({
                            jobId: id,
                            identityColumn: `${id}_id`,
                        })),
                    },
                },
            });
            expect(required(history).past).toHaveLength(1);
            act(() => undo());
            expect(required(history).present).toEqual(original);
            expect(required(history).past).toHaveLength(0);
            act(() => redo());
            expect(required(history).present).toEqual(deleted);
        } finally {
            act(() => root.unmount());
        }
    }
);
