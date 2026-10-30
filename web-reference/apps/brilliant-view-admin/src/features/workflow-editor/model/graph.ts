import { isRecord } from '../forms/schema';
import { getFieldHint } from '../workers/fieldHints';
import { workerByType } from '../workers/registry';
import type { DatabaseConnection } from './databaseSchema';
import { importConnections } from './importConnections';
import type { EditorJob, WorkflowDocument } from './schema';

export function withDependencies(
    job: EditorJob,
    dependencies: string[]
): EditorJob {
    if (
        dependencies.length === job.dependencies.length &&
        dependencies.every((id, index) => id === job.dependencies[index])
    )
        return job;
    return {
        ...job,
        dependencies,
        config:
            workerByType(job.type)?.onDependenciesChange?.(
                job.config,
                dependencies
            ) ?? job.config,
    };
}

export function canConnect(
    jobs: EditorJob[],
    source: string,
    target: string
): boolean {
    const byId = new Map(jobs.map((job) => [job.id, job]));
    if (source === target || !byId.has(source) || !byId.has(target))
        return false;
    if (byId.get(target)?.dependencies.includes(source)) return false;
    const visited = new Set<string>();
    const stack = [source];
    while (stack.length) {
        const id = stack.pop();
        if (id === undefined) break;
        if (id === target) return false;
        if (visited.has(id)) continue;
        visited.add(id);
        stack.push(...(byId.get(id)?.dependencies ?? []));
    }
    return true;
}

/** Only fields explicitly declared as job references participate in rename/import. */
function remapReferences(
    job: EditorJob,
    ids: Map<string, string>
): EditorJob['config'] {
    const fields = workerByType(job.type)?.fields;
    if (
        !fields ||
        !Object.values(fields).some((hint) => hint?.reference === 'job')
    )
        return job.config;
    const remap = (value: unknown, path: string[]): unknown => {
        if (
            typeof value === 'string' &&
            getFieldHint(fields, path)?.reference === 'job'
        )
            return ids.get(value) ?? value;
        if (Array.isArray(value))
            return value.map((entry, index) =>
                remap(entry, [...path, String(index)])
            );
        if (isRecord(value))
            return Object.fromEntries(
                Object.entries(value).map(([key, entry]) => [
                    key,
                    remap(entry, [...path, key]),
                ])
            );
        return value;
    };
    return remap(job.config, []) as EditorJob['config'];
}

export function renameJob(
    document: WorkflowDocument,
    id: string,
    nextId: string
): WorkflowDocument {
    nextId = nextId.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(nextId))
        throw new Error(
            'Use letters, numbers, underscores and hyphens; start with a letter or number. Spaces are not allowed.'
        );
    if (document.jobs.some((job) => job.id !== id && job.id === nextId))
        throw new Error('A worker already has this name.');
    const ids = new Map([[id, nextId]]);
    return {
        ...document,
        jobs: document.jobs.map((job) => ({
            ...job,
            id: ids.get(job.id) ?? job.id,
            name: job.id === id ? nextId : job.name,
            dependencies: job.dependencies.map((dep) => ids.get(dep) ?? dep),
            config: remapReferences(job, ids),
        })),
    };
}

export function appendJobs(
    document: WorkflowDocument,
    incoming: EditorJob[],
    connections: DatabaseConnection[] = [],
    center?: { x: number; y: number }
): WorkflowDocument {
    const imported = importConnections(document, incoming, connections);
    document = imported.document;
    incoming = imported.jobs;
    const taken = new Set(document.jobs.map((job) => job.id));
    const ids = new Map<string, string>();
    for (const job of incoming) {
        let id = job.id;
        let suffix = 2;
        while (taken.has(id)) id = `${job.id}-${suffix++}`;
        taken.add(id);
        ids.set(job.id, id);
    }
    const xPositions = incoming.map((job) => job.position.x);
    const yPositions = incoming.map((job) => job.position.y);
    const top = Math.min(0, ...yPositions);
    const offset = document.jobs.length
        ? Math.max(...document.jobs.map((job) => job.position.y)) + 180
        : 0;
    // Include the fixed 218 × 96 worker boxes when centering the pasted group.
    const shiftX = center
        ? center.x -
          (Math.min(...xPositions) + Math.max(...xPositions) + 218) / 2
        : 40;
    const shiftY = center
        ? center.y -
          (Math.min(...yPositions) + Math.max(...yPositions) + 96) / 2
        : offset - top;
    return {
        ...document,
        jobs: [
            ...document.jobs,
            ...incoming.map((job) => {
                const id = ids.get(job.id) ?? job.id;
                const dependencies = job.dependencies.flatMap((dep) => {
                    const mapped = ids.get(dep);
                    return mapped === undefined ? [] : [mapped];
                });
                const remapped = {
                    ...job,
                    id,
                    name: id !== job.id ? id : job.name,
                    dependencies: job.dependencies.map(
                        (dep) => ids.get(dep) ?? dep
                    ),
                    config: remapReferences(job, ids),
                    position: {
                        x: job.position.x + shiftX,
                        y: job.position.y + shiftY,
                    },
                };
                return withDependencies(remapped, dependencies);
            }),
        ],
    };
}
