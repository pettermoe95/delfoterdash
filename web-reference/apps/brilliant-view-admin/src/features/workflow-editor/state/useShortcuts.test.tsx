// @vitest-environment jsdom
import { ReactFlowProvider } from '@xyflow/react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { documentSchema, emptyDocument } from '../model/schema';
import { required } from '../test/required';
import type { EditorController } from './useEditor';
import { useShortcuts } from './useShortcuts';

type ProbeProps = { editor: EditorController };
function Probe({ editor }: ProbeProps) {
    useShortcuts(editor);
    return (
        <>
            <dialog open>
                <pre tabIndex={0}>Selected JSON</pre>
            </dialog>
            <button type="button">Canvas</button>
        </>
    );
}
it('preserves native clipboard and keyboard behavior in dialogs while keeping canvas shortcuts active', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const editor = {
        busy: false,
        loading: false,
        selectedIds: ['fetch'],
        document: {
            ...emptyDocument(),
            databaseConnections: [
                {
                    id: 'used',
                    name: 'Used',
                    config: { host: 'used.example.com' },
                },
                {
                    id: 'unrelated',
                    name: 'Unrelated',
                    config: { host: 'private.example.com' },
                },
            ],
            jobs: [
                {
                    id: 'fetch',
                    name: 'fetch',
                    type: 'JsonLoader',
                    config: {},
                    position: { x: 0, y: 0 },
                    execution: {},
                    dependencies: [],
                },
            ],
        },
        dispatch: vi.fn(),
        save: vi.fn(),
        insertJobs: vi.fn(),
    } as unknown as EditorController;
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
        act(() => {
            root.render(
                <ReactFlowProvider>
                    <Probe editor={editor} />
                </ReactFlowProvider>
            );
        });
        const payload = required(container.querySelector('pre'));
        const setData = vi.fn();
        const getData = () =>
            JSON.stringify({
                kind: 'bv-workflow-v2-nodes',
                document: editor.document,
            });
        for (const type of ['copy', 'paste']) {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperty(event, 'clipboardData', {
                value: { setData, getData },
            });
            act(() => {
                payload.dispatchEvent(event);
            });
            expect(event.defaultPrevented).toBe(false);
        }
        for (const key of ['z', 's'])
            act(() => {
                payload.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key,
                        ctrlKey: true,
                        bubbles: true,
                    })
                );
            });
        expect(setData).not.toHaveBeenCalled();
        expect(editor.insertJobs).not.toHaveBeenCalled();
        expect(editor.dispatch).not.toHaveBeenCalled();
        expect(editor.save).not.toHaveBeenCalled();
        act(() => {
            required(container.querySelector('button')).dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'z',
                    ctrlKey: true,
                    bubbles: true,
                })
            );
        });
        expect(editor.dispatch).toHaveBeenCalledWith({ type: 'undo' });
        const canvas = required(container.querySelector('button'));
        const copy = () => {
            const event = new Event('copy', {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, 'clipboardData', {
                value: { setData },
            });
            act(() => {
                canvas.dispatchEvent(event);
            });
            const [, text] = required(setData.mock.calls.at(-1)) as [
                string,
                string,
            ];
            const copied = JSON.parse(text) as { document: unknown };
            return documentSchema.parse(copied.document);
        };
        expect(copy().databaseConnections).toEqual([]);
        editor.document.jobs[0].databaseConnectionId = 'used';
        expect(
            copy().databaseConnections?.map((connection) => connection.id)
        ).toEqual(['used']);
        expect(editor.document.databaseConnections).toHaveLength(2);
    } finally {
        act(() => {
            root.unmount();
        });
        container.remove();
    }
});
