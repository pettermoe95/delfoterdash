import { useRef } from 'react';
import { useDatabaseCredentials } from '../../api/credentials';
import { isRecord } from '../../forms/schema';
import { SchemaForm } from '../../forms/SchemaForm';
import type { DatabaseConnection } from '../../model/databaseSchema';
import type { ValidationIssue } from '../../model/validation';
import type { EditorController } from '../../state/useEditor';
import { databaseHints } from '../../workers/fieldHints';
import { sharedDatabase } from '../../workers/shared';
import { useValidationFocus } from '../useValidationFocus';

type ConnectionEditorProps = {
    editor: EditorController;
    connection: DatabaseConnection;
    issues: ValidationIssue[];
    focusPath?: string;
    onWorkerSelect: (id: string) => void;
    onDelete: () => void;
};
export function ConnectionEditor({
    editor,
    connection,
    issues,
    focusPath,
    onWorkerSelect,
    onDelete,
}: ConnectionEditorProps) {
    const panel = useRef<HTMLDivElement>(null);
    const credentials = useDatabaseCredentials(editor.tenantId);
    // The target object stays stable while fields are edited, avoiding repeated focus jumps.
    const target = useRef(focusPath ? { path: focusPath } : undefined);
    useValidationFocus(panel, target.current);
    const users = editor.document.jobs.filter(
        (job) => job.databaseConnectionId === connection.id
    );
    const update = (changes: Partial<DatabaseConnection>, group: string) =>
        editor.edit(
            (document) => ({
                ...document,
                databaseConnections: document.databaseConnections?.map(
                    (item) =>
                        item.id === connection.id
                            ? { ...item, ...changes }
                            : item
                ),
            }),
            `connection:${connection.id}:${group}`
        );
    const updateConfig = (value: unknown) => {
        if (isRecord(value)) update({ config: value }, 'config');
    };
    const renderUser = (job: (typeof users)[number]) => (
        <button
            type="button"
            key={job.id}
            onClick={() => onWorkerSelect(job.id)}
        >
            {job.id}
        </button>
    );
    const messages = [
        ...new Set(issues.map((issue) => `${issue.path}: ${issue.message}`)),
    ];
    const renderMessage = (message: string) => <li key={message}>{message}</li>;
    return (
        <div
            className="we-connection-editor"
            ref={panel}
            onFocusCapture={() => editor.dispatch({ type: 'endGroup' })}
        >
            <label className="we-field" data-field-path="name">
                Connection name
                <input
                    value={connection.name}
                    onChange={(event) =>
                        update({ name: event.target.value }, 'name')
                    }
                />
            </label>
            <SchemaForm
                schema={sharedDatabase}
                value={connection.config}
                onChange={updateConfig}
                pathPrefix="databaseConfig"
                environment={{
                    hints: databaseHints,
                    credentials: credentials.data,
                    errors: issues,
                }}
            />
            {credentials.isError && (
                <p className="we-error">
                    Credentials could not be loaded. Existing selections are
                    preserved.
                </p>
            )}
            {!!messages.length && (
                <ul className="we-error we-connection-errors">
                    {messages.map(renderMessage)}
                </ul>
            )}
            <h3>
                Used by {users.length}{' '}
                {users.length === 1 ? 'worker' : 'workers'}
            </h3>
            <div className="we-database-actions">{users.map(renderUser)}</div>
            <p className="we-muted">
                {users.length
                    ? 'Detach or reassign these workers before deleting this connection.'
                    : 'This connection is not used by any workers.'}
            </p>
            <button
                type="button"
                className="we-danger"
                onClick={onDelete}
                disabled={!!users.length}
            >
                Delete connection
            </button>
        </div>
    );
}
