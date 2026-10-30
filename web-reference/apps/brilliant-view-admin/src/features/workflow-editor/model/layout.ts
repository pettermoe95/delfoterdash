import { Graph, graphlib, layout } from '@dagrejs/dagre';
import type { EdgeLabel, GraphLabel, NodeLabel } from '@dagrejs/dagre';
import type { WorkflowDocument } from './schema';

// Match the fixed worker boxes in styles/canvas.css.
const nodeWidth = 218;
const nodeHeight = 96;
const nodeGap = 64;

/** Reduce crossings in both directions and align connected workers along horizontal lanes. */
export function arrangeDocument(document: WorkflowDocument): WorkflowDocument {
    if (!document.jobs.length) return document;
    const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>();
    graph.setDefaultEdgeLabel(() => ({}));
    const jobs = [...document.jobs].sort((a, b) => a.id.localeCompare(b.id));
    // Internal IDs also keep names such as "constructor" out of graphlib's object keys.
    const ids = new Map(jobs.map((job, index) => [job.id, `worker-${index}`]));
    for (const id of ids.values())
        graph.setNode(id, { width: nodeWidth, height: nodeHeight });
    for (const job of jobs) {
        const target = ids.get(job.id);
        if (target === undefined) throw new Error(`Missing worker ${job.id}.`);
        for (const dependency of [...new Set(job.dependencies)].sort()) {
            const source = ids.get(dependency);
            if (source) graph.setEdge(source, target);
        }
    }
    if (!graphlib.alg.isAcyclic(graph))
        throw new Error('Remove cyclic connections before arranging workers.');
    for (const edge of graph.edges())
        graph.edge(edge).weight =
            graph.successors(edge.v)?.length === 1 &&
            graph.predecessors(edge.w)?.length === 1
                ? 4
                : 1;

    const positions = new Map<string, { x: number; y: number }>();
    let top = 40;
    // Independent pipelines get their own lanes rather than pushing connected nodes out of alignment.
    for (const component of graphlib.alg.components(graph)) {
        const pipeline = new Graph<GraphLabel, NodeLabel, EdgeLabel>();
        for (const id of component) pipeline.setNode(id, { ...graph.node(id) });
        for (const id of component)
            for (const edge of graph.outEdges(id) ?? [])
                pipeline.setEdge(edge.v, edge.w, { ...graph.edge(edge) });
        pipeline.setGraph({
            rankdir: 'LR',
            ranker: 'network-simplex',
            align: 'UL',
            nodesep: nodeGap,
            edgesep: 32,
            ranksep: 102,
            marginx: 40,
            marginy: 0,
        });
        layout(pipeline);
        let bottom = 0;
        for (const id of component) {
            const { x, y } = pipeline.node(id);
            if (x === undefined || y === undefined)
                throw new Error('Could not position workers.');
            positions.set(id, {
                x: x - nodeWidth / 2,
                y: top + y - nodeHeight / 2,
            });
            bottom = Math.max(bottom, y + nodeHeight / 2);
        }
        top += bottom + nodeGap;
    }
    return {
        ...document,
        jobs: document.jobs.map((job) => {
            const id = ids.get(job.id);
            const position = id === undefined ? undefined : positions.get(id);
            if (!position)
                throw new Error(`Could not position worker ${job.id}.`);
            return { ...job, position };
        }),
    };
}
