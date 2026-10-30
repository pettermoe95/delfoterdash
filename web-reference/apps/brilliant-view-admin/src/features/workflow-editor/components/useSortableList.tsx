import { useId, useRef, useState } from 'react';
import type { DragEvent, HTMLAttributes, KeyboardEvent } from 'react';

const dragType = 'application/x-workflow-list-item';
type SortableItemProps = HTMLAttributes<HTMLDivElement> & {
    'data-sort-item': string;
    'data-sort-target'?: 'before' | 'after';
};

export function useSortableList(
    count: number,
    onMove: (from: number, to: number) => void
) {
    const listId = useId();
    const source = useRef<number | null>(null);
    const [target, setTarget] = useState<number | null>(null);
    const clear = () => {
        source.current = null;
        setTarget(null);
    };
    const isOwnDrag = (event: DragEvent) =>
        source.current !== null && event.dataTransfer.types.includes(dragType);
    const itemProps = (index: number): SortableItemProps => ({
        'data-sort-item': listId,
        'data-sort-target':
            target === index && source.current !== index
                ? (source.current ?? 0) < index
                    ? 'after'
                    : 'before'
                : undefined,
        onDragOver: (event) => {
            if (!isOwnDrag(event)) return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            setTarget(index);
        },
        onDrop: (event) => {
            if (!isOwnDrag(event)) return;
            event.preventDefault();
            event.stopPropagation();
            const from = source.current;
            const own = event.dataTransfer.getData(dragType) === listId;
            clear();
            if (own && from !== null && from !== index) onMove(from, index);
        },
    });
    const handle = (index: number, label: string) =>
        count > 1 && (
            <button
                type="button"
                className="we-drag-handle"
                draggable
                aria-label={`Reorder ${label}`}
                title="Drag to reorder. Use Up and Down arrow keys to move."
                onDragStart={(event) => {
                    event.stopPropagation();
                    source.current = index;
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData(dragType, listId);
                    const row =
                        event.currentTarget.closest<HTMLElement>(
                            '[data-sort-item]'
                        );
                    if (row) event.dataTransfer.setDragImage(row, 12, 12);
                }}
                onDragEnd={clear}
                onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                    const direction =
                        event.key === 'ArrowUp'
                            ? -1
                            : event.key === 'ArrowDown'
                              ? 1
                              : 0;
                    if (!direction) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const next = index + direction;
                    if (next >= 0 && next < count) {
                        const row =
                            event.currentTarget.closest('[data-sort-item]');
                        const parent = row?.parentElement;
                        onMove(index, next);
                        requestAnimationFrame(() => {
                            const rows = Array.from(
                                parent?.children ?? []
                            ).filter(
                                (child) =>
                                    child.getAttribute('data-sort-item') ===
                                    listId
                            );
                            rows[next]
                                ?.querySelector<HTMLButtonElement>(
                                    '.we-drag-handle'
                                )
                                ?.focus();
                        });
                    }
                }}
            />
        );
    return { itemProps, handle };
}
