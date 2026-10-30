import { normalizeConfig } from '../workers/normalizeConfig';
import { workerByType } from '../workers/registry';
import { sharedDatabase } from '../workers/shared';
import { resolvedConfig } from './databaseConnections';
import { validateConnections } from './graphValidation';
import { documentSchema, incrementalSchema, schedulingSchema } from './schema';
import type { WorkflowDocument } from './schema';

export type ValidationIssue = {
    jobId?: string;
    connectionId?: string;
    path: string;
    message: string;
};
export function validateDocument(
    document: WorkflowDocument
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const structural = documentSchema.safeParse(document);
    if (!structural.success)
        issues.push(
            ...structural.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }))
        );
    for (const [key, schema] of [
        ['incremental', incrementalSchema],
        ['scheduling', schedulingSchema],
    ] as const) {
        const result = schema.safeParse(document[key]);
        if (!result.success)
            issues.push(
                ...result.error.issues.map((issue) => ({
                    path: key + '.' + issue.path.join('.'),
                    message: issue.message,
                }))
            );
    }
    if (!document.jobs.length)
        issues.push({ path: 'jobs', message: 'Add at least one worker.' });
    const connectionNames = new Set<string>();
    for (const connection of document.databaseConnections ?? []) {
        const name = connection.name.trim().toLowerCase();
        if (!name || connectionNames.has(name))
            issues.push({
                connectionId: connection.id,
                path: 'name',
                message: name
                    ? 'Connection names must be unique.'
                    : 'A connection name is required.',
            });
        connectionNames.add(name);
        const result = sharedDatabase.safeParse(
            normalizeConfig(sharedDatabase, connection.config)
        );
        if (!result.success)
            issues.push(
                ...result.error.issues.map((issue) => ({
                    connectionId: connection.id,
                    path: ['databaseConfig', ...issue.path].join('.'),
                    message: issue.message,
                }))
            );
    }
    for (const job of document.jobs) {
        if (/\s/.test(job.id))
            issues.push({
                jobId: job.id,
                path: 'id',
                message:
                    'Worker names cannot contain spaces or other whitespace.',
            });
        const def = workerByType(job.type);
        if (!def) {
            issues.push({
                jobId: job.id,
                path: 'type',
                message:
                    'Unsupported worker: ' +
                    job.type +
                    '. Configuration is preserved.',
            });
            continue;
        }
        let config = job.config;
        try {
            config = resolvedConfig(document, job);
        } catch (error) {
            issues.push({
                jobId: job.id,
                path: 'databaseConfig',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Missing database connection.',
            });
            continue;
        }
        const result = def.schema.safeParse(
            normalizeConfig(def.schema, config)
        );
        if (!result.success)
            issues.push(
                ...result.error.issues.map((issue) => ({
                    jobId: job.id,
                    connectionId:
                        issue.path[0] === 'databaseConfig'
                            ? job.databaseConnectionId
                            : undefined,
                    path: issue.path.join('.'),
                    message: issue.message,
                }))
            );
        else if (def.validate)
            issues.push(
                ...def
                    .validate(
                        { ...job, config: result.data },
                        document.jobs.filter((item) =>
                            job.dependencies.includes(item.id)
                        )
                    )
                    .map((issue) => ({ ...issue, jobId: job.id }))
            );
    }
    return [...issues, ...validateConnections(document.jobs)];
}
