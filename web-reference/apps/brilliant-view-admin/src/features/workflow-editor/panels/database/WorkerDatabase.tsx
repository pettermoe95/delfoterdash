import type { ChangeEvent } from 'react';
import { useDatabaseCredentials } from '../../api/credentials';
import { Field } from '../../forms/Field';
import { isRecord, objectSchema } from '../../forms/schema';
import {
    bindDatabase,
    connectionForJob,
    detachDatabase,
    promoteDatabase,
} from '../../model/databaseConnections';
import type { EditorJob } from '../../model/schema';
import type { ValidationIssue } from '../../model/validation';
import type { EditorController } from '../../state/useEditor';
import type { WorkerDefinition } from '../../workers/types';

type WorkerDatabaseProps = {
    editor: EditorController;
    job: EditorJob;
    definition: WorkerDefinition;
    issues: ValidationIssue[];
    onManage: (id?: string) => void;
};
export function WorkerDatabase({
    editor,
    job,
    definition,
    issues,
    onManage,
}: WorkerDatabaseProps) {
    const credentials = useDatabaseCredentials(editor.tenantId);
    const connection = connectionForJob(editor.document, job);
    const schema = objectSchema(definition.schema, job.config)?.shape
        .databaseConfig;
    const changeConnection = (event: ChangeEvent<HTMLSelectElement>) => {
        try {
            const next = event.target.value
                ? bindDatabase(job, event.target.value)
                : detachDatabase(editor.document, job);
            editor.updateJob(job.id, () => next);
        } catch (error) {
            editor.notify(
                error instanceof Error
                    ? error.message
                    : 'Could not change connection.',
                'error'
            );
        }
    };
    const updateInline = (value: unknown) =>
        editor.updateJob(
            job.id,
            (current) => ({
                ...current,
                config: { ...current.config, databaseConfig: value },
            }),
            `database:${job.id}`
        );
    const saveAsConnection = () => {
        const next = promoteDatabase(editor.document, job.id);
        editor.edit(() => next);
        onManage(
            next.jobs.find((item) => item.id === job.id)?.databaseConnectionId
        );
    };
    const detach = () => {
        const next = detachDatabase(editor.document, job);
        editor.updateJob(job.id, () => next);
    };
    const editConnection = () => onManage(connection?.id);
    const renderConnection = (
        item: NonNullable<typeof editor.document.databaseConnections>[number]
    ) => (
        <option key={item.id} value={item.id}>
            {item.name || '(Unnamed connection)'}
        </option>
    );
    const config = connection?.config;
    const inline = job.config.databaseConfig;
    const canShare =
        isRecord(inline) &&
        (inline.type === 'postgres' || inline.type === 'mssql');
    return (
        <section
            data-field-path="databaseConfig"
            className="we-worker-database"
        >
            <label className="we-field">
                Database connection
                <select
                    value={job.databaseConnectionId ?? ''}
                    onChange={changeConnection}
                >
                    <option value="">Inline configuration</option>
                    {job.databaseConnectionId && !connection && (
                        <option value={job.databaseConnectionId}>
                            Missing connection
                        </option>
                    )}
                    {editor.document.databaseConnections?.map(renderConnection)}
                </select>
            </label>
            {job.databaseConnectionId ? (
                <>
                    {connection ? (
                        <p className="we-muted">
                            {typeof config?.type === 'string'
                                ? config.type
                                : ''}
                            {typeof config?.host === 'string'
                                ? ` · ${config.host}`
                                : ''}
                            {typeof config?.databaseName === 'string'
                                ? ` · ${config.databaseName}`
                                : ''}
                        </p>
                    ) : (
                        <p className="we-error">
                            This connection no longer exists. Select another
                            connection.
                        </p>
                    )}
                    <p className="we-muted">
                        Changes to this connection apply to every worker using
                        it.
                    </p>
                    <div className="we-database-actions">
                        <button type="button" onClick={editConnection}>
                            Edit connection
                        </button>
                        <button
                            type="button"
                            onClick={detach}
                            disabled={!connection}
                        >
                            Detach and customize
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {schema && (
                        <Field
                            schema={schema}
                            value={job.config.databaseConfig}
                            path="databaseConfig"
                            label="Settings"
                            onChange={updateInline}
                            environment={{
                                hints: definition.fields,
                                credentials: credentials.data,
                                errors: issues.filter(
                                    (issue) => issue.jobId === job.id
                                ),
                            }}
                        />
                    )}
                    {canShare && (
                        <button type="button" onClick={saveAsConnection}>
                            Create shared connection
                        </button>
                    )}
                </>
            )}
            {credentials.isError && (
                <p className="we-error">
                    Credentials could not be loaded. Existing selections are
                    preserved.
                </p>
            )}
            <button
                type="button"
                className="we-database-manage"
                onClick={() => onManage()}
            >
                Manage database connections
            </button>
        </section>
    );
}
