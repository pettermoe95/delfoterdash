import { initialValue, isRecord } from '../forms/schema';
import { sharedDatabase } from '../workers/shared';
import type { DatabaseConnection } from './databaseSchema';
import type { EditorJob, WorkflowDocument } from './schema';

export function connectionForJob(document: WorkflowDocument, job: EditorJob) {
    return document.databaseConnections?.find(
        (connection) => connection.id === job.databaseConnectionId
    );
}

export function resolvedConfig(document: WorkflowDocument, job: EditorJob) {
    if (!job.databaseConnectionId) return job.config;
    const connection = connectionForJob(document, job);
    if (!connection)
        throw new Error(
            `Database connection for ${job.id} is missing. Select another connection.`
        );
    return { ...job.config, databaseConfig: connection.config };
}

export function bindDatabase(job: EditorJob, connectionId: string): EditorJob {
    const { databaseConfig: _inline, ...config } = job.config;
    return { ...job, config, databaseConnectionId: connectionId };
}

export function detachDatabase(
    document: WorkflowDocument,
    job: EditorJob
): EditorJob {
    const config = resolvedConfig(document, job);
    const { databaseConnectionId: _reference, ...inline } = job;
    return { ...inline, config };
}

export function createDatabaseConnection(
    document: WorkflowDocument,
    name: string,
    config: Record<string, unknown> = initialValue(sharedDatabase) as Record<
        string,
        unknown
    >
): DatabaseConnection {
    const names = new Set(
        document.databaseConnections?.map((item) =>
            item.name.trim().toLowerCase()
        )
    );
    let unique = name;
    let suffix = 2;
    while (names.has(unique.trim().toLowerCase()))
        unique = `${name} ${suffix++}`;
    return { id: crypto.randomUUID(), name: unique, config };
}

export function promoteDatabase(
    document: WorkflowDocument,
    jobId: string
): WorkflowDocument {
    const job = document.jobs.find((item) => item.id === jobId);
    if (!job) throw new Error('Worker no longer exists.');
    const current = resolvedConfig(document, job).databaseConfig;
    if (
        !isRecord(current) ||
        (current.type !== 'postgres' && current.type !== 'mssql')
    )
        throw new Error(
            'Select PostgreSQL or SQL Server before saving a shared connection.'
        );
    const connection = createDatabaseConnection(
        document,
        `${job.id} database`,
        current
    );
    return {
        ...document,
        databaseConnections: [
            ...(document.databaseConnections ?? []),
            connection,
        ],
        jobs: document.jobs.map((item) =>
            item.id === jobId ? bindDatabase(item, connection.id) : item
        ),
    };
}

export function deleteDatabaseConnection(
    document: WorkflowDocument,
    id: string
): WorkflowDocument {
    if (document.jobs.some((job) => job.databaseConnectionId === id))
        throw new Error(
            'Detach or reassign workers before deleting this connection.'
        );
    return {
        ...document,
        databaseConnections: document.databaseConnections?.filter(
            (item) => item.id !== id
        ),
    };
}
