import { useEffect, useState } from 'react';
import { Dialog } from '../../components/Dialog';
import {
    createDatabaseConnection,
    deleteDatabaseConnection,
} from '../../model/databaseConnections';
import type { DatabaseConnection } from '../../model/databaseSchema';
import type { ValidationIssue } from '../../model/validation';
import type { EditorController } from '../../state/useEditor';
import { ConnectionEditor } from './ConnectionEditor';

export type DatabaseTarget = { id?: string; path?: string };
type DatabaseConnectionsDialogProps = {
    editor: EditorController;
    target: DatabaseTarget;
    issues: ValidationIssue[];
    onClose: () => void;
    onWorkerSelect: (id: string) => void;
};
export function DatabaseConnectionsDialog({
    editor,
    target,
    issues,
    onClose,
    onWorkerSelect,
}: DatabaseConnectionsDialogProps) {
    const connections = editor.document.databaseConnections ?? [];
    const [selectedId, setSelectedId] = useState(
        target.id ?? connections.at(0)?.id
    );
    useEffect(() => {
        if (target.id) setSelectedId(target.id);
    }, [target]);
    const selected =
        connections.find((item) => item.id === selectedId) ?? connections.at(0);
    const addConnection = () => {
        const connection = createDatabaseConnection(
            editor.document,
            'Database connection'
        );
        editor.edit((document) => ({
            ...document,
            databaseConnections: [
                ...(document.databaseConnections ?? []),
                connection,
            ],
        }));
        setSelectedId(connection.id);
    };
    const deleteConnection = () => {
        if (!selected) return;
        const next = deleteDatabaseConnection(editor.document, selected.id);
        editor.edit(() => next);
    };
    const renderConnection = (connection: DatabaseConnection) => (
        <button
            type="button"
            key={connection.id}
            aria-pressed={selected?.id === connection.id}
            onClick={() => setSelectedId(connection.id)}
        >
            {connection.name || '(Unnamed connection)'}
        </button>
    );
    return (
        <Dialog
            title="Database connections"
            onClose={onClose}
            className="we-databases-dialog"
        >
            <p>
                Named database settings shared within this workflow. Changes
                apply to all workers using the connection and are saved when you
                save the workflow.
            </p>
            <fieldset disabled={editor.busy}>
                <div className="we-databases-layout">
                    <nav aria-label="Database connections">
                        <button type="button" onClick={addConnection}>
                            + Add connection
                        </button>
                        {connections.map(renderConnection)}
                    </nav>
                    {selected ? (
                        <ConnectionEditor
                            key={`${selected.id}:${target.path ?? ''}`}
                            editor={editor}
                            connection={selected}
                            issues={issues.filter(
                                (issue) => issue.connectionId === selected.id
                            )}
                            focusPath={
                                target.id === selected.id
                                    ? target.path
                                    : undefined
                            }
                            onWorkerSelect={onWorkerSelect}
                            onDelete={deleteConnection}
                        />
                    ) : (
                        <p>
                            No database connections yet. Add one or save a
                            worker's existing database configuration as a
                            connection.
                        </p>
                    )}
                </div>
            </fieldset>
            <div className="we-database-actions">
                <button type="button" onClick={onClose}>
                    Done
                </button>
            </div>
        </Dialog>
    );
}
