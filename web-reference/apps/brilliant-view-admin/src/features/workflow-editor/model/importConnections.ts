import { createDatabaseConnection } from './databaseConnections';
import type { DatabaseConnection } from './databaseSchema';
import type { EditorJob, WorkflowDocument } from './schema';

export function validateImportedConnections(
    jobs: EditorJob[],
    source: DatabaseConnection[] = []
) {
    const available = new Set(source.map((connection) => connection.id));
    const missing = jobs.find(
        (job) =>
            job.databaseConnectionId && !available.has(job.databaseConnectionId)
    );
    if (missing)
        throw new Error(
            `Imported worker ${missing.id} references a missing database connection.`
        );
}

/** Copy only referenced connections; never bind an imported worker to an unrelated ID collision. */
export function importConnections(
    document: WorkflowDocument,
    jobs: EditorJob[],
    source: DatabaseConnection[] = []
) {
    validateImportedConnections(jobs, source);
    const connections = [...(document.databaseConnections ?? [])];
    const ids = new Map<string, string>();
    for (const job of jobs) {
        const id = job.databaseConnectionId;
        if (!id || ids.has(id)) continue;
        const incoming = source.find((item) => item.id === id);
        if (!incoming)
            throw new Error(`Missing imported database connection ${id}.`);
        const existing = connections.find((item) => item.id === id);
        if (existing && JSON.stringify(existing) === JSON.stringify(incoming)) {
            ids.set(id, id);
            continue;
        }
        const imported = createDatabaseConnection(
            { ...document, databaseConnections: connections },
            incoming.name,
            incoming.config
        );
        if (!existing) imported.id = incoming.id;
        connections.push(imported);
        ids.set(id, imported.id);
    }
    return {
        document: connections.length
            ? { ...document, databaseConnections: connections }
            : document,
        jobs: jobs.map((job) =>
            job.databaseConnectionId
                ? {
                      ...job,
                      databaseConnectionId:
                          ids.get(job.databaseConnectionId) ??
                          job.databaseConnectionId,
                  }
                : job
        ),
    };
}
