import { Graph, graphlib } from '@dagrejs/dagre';
import type { EditorJob } from './schema';
import type { ValidationIssue } from './validation';

/** Strongly connected components identify every cyclic edge in one graph traversal. */
export function validateConnections(jobs: EditorJob[]): ValidationIssue[] {
    const graph = new Graph<
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>
    >();
    // Use internal IDs, as in the arranger, to support arbitrary imported worker names.
    const ids = new Map(jobs.map((job, index) => [job.id, String(index)]));
    for (const id of ids.values()) graph.setNode(id, {});
    for (const job of jobs) {
        const target = ids.get(job.id);
        if (target === undefined) continue;
        for (const dependency of job.dependencies) {
            const source = ids.get(dependency);
            if (source !== undefined) graph.setEdge(source, target, {});
        }
    }
    const components = new Map<string, number>();
    graphlib.alg.tarjan(graph).forEach((component, index) => {
        for (const id of component) components.set(id, index);
    });
    return jobs.flatMap((job) => {
        const seen = new Set<string>();
        return job.dependencies.flatMap((dependency) => {
            const source = ids.get(dependency);
            const target = ids.get(job.id);
            const invalid =
                seen.has(dependency) ||
                source === undefined ||
                target === undefined ||
                components.get(source) === components.get(target);
            seen.add(dependency);
            return invalid
                ? [
                      {
                          jobId: job.id,
                          path: 'dependencies',
                          message: `Invalid, duplicate or cyclic connection from ${dependency}.`,
                      },
                  ]
                : [];
        });
    });
}
