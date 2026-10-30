import { useReactFlow, useStoreApi } from '@xyflow/react';
import type { DragEvent } from 'react';
import { useState } from 'react';
import { workers } from '../workers/registry';
import type { WorkerDefinition } from '../workers/types';

type PaletteProps = {
    onAdd: (
        worker: WorkerDefinition,
        position: { x: number; y: number }
    ) => void;
    disabled: boolean;
};
export function Palette({ onAdd, disabled }: PaletteProps) {
    const [search, setSearch] = useState('');
    const { screenToFlowPosition } = useReactFlow();
    const store = useStoreApi();
    const matching = workers.filter((worker) =>
        `${worker.name} ${worker.description}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const renderCategory = (category: WorkerDefinition['category']) => {
        const items = matching.filter((worker) => worker.category === category);
        const renderWorker = (worker: WorkerDefinition) => {
            const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
                event.dataTransfer.setData(
                    'application/bv-worker-v2',
                    worker.type
                );
                event.dataTransfer.effectAllowed = 'copy';
            };
            const handleClick = () => {
                const bounds = store
                    .getState()
                    .domNode?.getBoundingClientRect();
                if (!bounds) return;
                onAdd(
                    worker,
                    screenToFlowPosition({
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2,
                    })
                );
            };
            return (
                <button
                    key={worker.type}
                    type="button"
                    className="we-palette-worker"
                    data-category={category}
                    disabled={disabled}
                    draggable={!disabled}
                    onDragStart={handleDragStart}
                    onClick={handleClick}
                    title={worker.description}
                >
                    <strong>{worker.name}</strong>
                </button>
            );
        };
        return items.length ? (
            <section key={category}>
                <h3>{category}</h3>
                {items.map(renderWorker)}
            </section>
        ) : null;
    };
    return (
        <aside className="we-palette" aria-label="Worker palette">
            <h2>
                Workers <span>{workers.length}</span>
            </h2>
            <input
                type="search"
                aria-label="Search workers"
                placeholder="Search workers…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />
            {(['Fetch', 'Load', 'Model', 'Store'] as const).map(renderCategory)}
            {!matching.length && <p>No matching workers.</p>}
            <footer>
                Drag to place · Click to add
                <br />
                Shift to select multiple
                <br />
                ⌘/Ctrl+C and V to copy/paste
            </footer>
        </aside>
    );
}
