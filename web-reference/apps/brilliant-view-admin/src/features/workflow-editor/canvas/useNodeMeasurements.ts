import type { NodeChange } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';

type Measurements = Map<string, { width: number; height: number }>;

export function useNodeMeasurements(nodes: { id: string }[]) {
    const [measurements, setMeasurements] = useState<Measurements>(new Map());
    useEffect(() => {
        const existing = new Set(nodes.map((node) => node.id));
        setMeasurements((current) => {
            if ([...current.keys()].every((id) => existing.has(id)))
                return current;
            return new Map([...current].filter(([id]) => existing.has(id)));
        });
    }, [nodes]);

    const measure = useCallback((changes: NodeChange[]) => {
        const dimensions = changes.filter(
            (change) => change.type === 'dimensions'
        );
        if (!dimensions.length) return;
        setMeasurements((current) => {
            let next = current;
            for (const change of dimensions) {
                if (!change.dimensions) continue;
                const previous = current.get(change.id);
                if (
                    previous?.width === change.dimensions.width &&
                    previous.height === change.dimensions.height
                )
                    continue;
                if (next === current) next = new Map(current);
                next.set(change.id, change.dimensions);
            }
            return next;
        });
    }, []);
    return { measurements, measure };
}
