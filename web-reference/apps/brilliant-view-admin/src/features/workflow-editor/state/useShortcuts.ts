import { useReactFlow, useStoreApi } from '@xyflow/react';
import { useEffect } from 'react';
import { documentSchema } from '../model/schema';
import type { EditorController } from './useEditor';

export function useShortcuts(editor: EditorController) {
    const { screenToFlowPosition } = useReactFlow();
    const store = useStoreApi();
    useEffect(() => {
        const isInput = (target: EventTarget | null) =>
            target instanceof HTMLElement &&
            (target.isContentEditable ||
                !!target.closest(
                    'input, textarea, select, dialog, [role="dialog"]'
                ));
        const keydown = (event: KeyboardEvent) => {
            if (editor.busy || editor.loading || event.defaultPrevented) return;
            if (
                event.target instanceof Element &&
                event.target.closest('dialog, [role="dialog"]')
            )
                return;
            const modifier = event.metaKey || event.ctrlKey;
            if (modifier && event.key.toLowerCase() === 's') {
                event.preventDefault();
                void editor.save();
                return;
            }
            if (isInput(event.target)) return;
            if (modifier && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                editor.dispatch({ type: event.shiftKey ? 'redo' : 'undo' });
            }
            if (modifier && event.key.toLowerCase() === 'y') {
                event.preventDefault();
                editor.dispatch({ type: 'redo' });
            }
        };
        const copy = (event: ClipboardEvent) => {
            if (
                editor.busy ||
                isInput(event.target) ||
                !editor.selectedIds.length
            )
                return;
            const jobs = editor.document.jobs.filter((job) =>
                editor.selectedIds.includes(job.id)
            );
            const connectionIds = new Set(
                jobs.map((job) => job.databaseConnectionId)
            );
            event.preventDefault();
            event.clipboardData?.setData(
                'text/plain',
                JSON.stringify({
                    kind: 'bv-workflow-v2-nodes',
                    document: {
                        ...editor.document,
                        jobs,
                        databaseConnections:
                            editor.document.databaseConnections?.filter(
                                (connection) => connectionIds.has(connection.id)
                            ),
                    },
                })
            );
        };
        const paste = (event: ClipboardEvent) => {
            if (editor.busy || isInput(event.target)) return;
            try {
                const parsed = JSON.parse(
                    event.clipboardData?.getData('text/plain') ?? ''
                ) as { kind?: string; document?: unknown };
                if (parsed.kind !== 'bv-workflow-v2-nodes') return;
                const document = documentSchema.parse(parsed.document);
                const bounds = store
                    .getState()
                    .domNode?.getBoundingClientRect();
                if (!bounds) return;
                event.preventDefault();
                editor.insertJobs(
                    document.jobs,
                    document.databaseConnections,
                    screenToFlowPosition({
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2,
                    })
                );
            } catch {
                /* Clipboard may contain unrelated text. */
            }
        };
        window.addEventListener('keydown', keydown);
        window.addEventListener('copy', copy);
        window.addEventListener('paste', paste);
        return () => {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('copy', copy);
            window.removeEventListener('paste', paste);
        };
    }, [editor, screenToFlowPosition, store]);
}
