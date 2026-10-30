import type { SemanticGraph } from './semanticModel';

const HORIZONTAL_GAP = 500;
const STAGGER_GAP = 250;
const VERTICAL_GAP = 170;
const START_X = 100;
const START_Y = 100;

/** Assigns semantic roles to left-to-right layers following relationship direction. */
export function layoutSemanticGraph(graph: SemanticGraph) {
    const relationNames = graph.relations.map(
        (relation) => relation.relationName
    );
    const adjacency = new Map(
        relationNames.map((name) => [name, [] as string[]])
    );
    for (const edge of graph.relationships) {
        if (
            adjacency.has(edge.sourceRelation) &&
            adjacency.has(edge.targetRelation)
        ) {
            adjacency.get(edge.sourceRelation)?.push(edge.targetRelation);
        }
    }

    // Collapse strongly connected groups first so accidental cycles cannot make
    // the layer calculation loop or push nodes arbitrarily far across the canvas.
    let nextIndex = 0;
    const index = new Map<string, number>();
    const lowLink = new Map<string, number>();
    const stack: string[] = [];
    const onStack = new Set<string>();
    const components: string[][] = [];

    const visit = (name: string) => {
        index.set(name, nextIndex);
        lowLink.set(name, nextIndex++);
        stack.push(name);
        onStack.add(name);
        for (const target of adjacency.get(name) ?? []) {
            if (!index.has(target)) {
                visit(target);
                lowLink.set(
                    name,
                    Math.min(
                        requiredGraphValue(lowLink, name),
                        requiredGraphValue(lowLink, target)
                    )
                );
            } else if (onStack.has(target)) {
                lowLink.set(
                    name,
                    Math.min(
                        requiredGraphValue(lowLink, name),
                        requiredGraphValue(index, target)
                    )
                );
            }
        }
        if (lowLink.get(name) !== index.get(name)) return;
        const component: string[] = [];
        let member: string;
        do {
            const nextMember = stack.pop();
            if (nextMember === undefined) {
                throw new Error(`Missing component member for ${name}`);
            }
            member = nextMember;
            onStack.delete(member);
            component.push(member);
        } while (member !== name);
        components.push(component.sort((a, b) => a.localeCompare(b)));
    };

    for (const name of relationNames) if (!index.has(name)) visit(name);

    const componentOf = new Map<string, number>();
    components.forEach((component, componentIndex) =>
        component.forEach((name) => componentOf.set(name, componentIndex))
    );
    const componentEdges = components.map(() => new Set<number>());
    const indegree = components.map(() => 0);
    for (const [source, targets] of adjacency) {
        const sourceComponent = requiredGraphValue(componentOf, source);
        for (const target of targets) {
            const targetComponent = requiredGraphValue(componentOf, target);
            if (
                sourceComponent === targetComponent ||
                componentEdges[sourceComponent].has(targetComponent)
            )
                continue;
            componentEdges[sourceComponent].add(targetComponent);
            indegree[targetComponent]++;
        }
    }

    const layers = components.map(() => 0);
    const queue = indegree.flatMap((degree, component) =>
        degree === 0 ? [component] : []
    );
    for (const source of queue) {
        for (const target of componentEdges[source]) {
            layers[target] = Math.max(layers[target], layers[source] + 1);
            if (--indegree[target] === 0) queue.push(target);
        }
    }

    const componentsByLayer = new Map<number, number[]>();
    layers.forEach((layer, component) => {
        const items = componentsByLayer.get(layer) ?? [];
        items.push(component);
        componentsByLayer.set(layer, items);
    });
    for (const items of componentsByLayer.values()) {
        items.sort((a, b) => components[a][0].localeCompare(components[b][0]));
    }

    const positions = new Map<string, { x: number; y: number }>();
    for (const [layer, items] of componentsByLayer) {
        const row = items.flatMap((component) => components[component]);
        row.forEach((name, itemIndex) =>
            positions.set(name, {
                // Pair nodes across adjacent columns to keep wide layers from
                // becoming a tall stack, with room for edges between nodes.
                x:
                    START_X +
                    layer * HORIZONTAL_GAP +
                    (itemIndex % 2) * STAGGER_GAP,
                y: START_Y + Math.floor(itemIndex / 2) * VERTICAL_GAP,
            })
        );
    }
    return positions;
}

function requiredGraphValue(map: Map<string, number>, name: string): number {
    const value = map.get(name);
    if (value === undefined) {
        throw new Error(`Missing graph value for ${name}`);
    }
    return value;
}
