import { useCallback, useRef, useState } from 'react';

type UseDragReorderOptions = {
    itemCount: number;
    onMove: (from: number, to: number) => void;
};

type UseDragReorderResult = {
    dropIndex: number | null;
    isDragging: boolean;
    onDragStart: (
        index: number
    ) => (event: React.DragEvent<HTMLElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
    onContainerDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
};

export function useDragReorder({
    itemCount,
    onMove,
}: UseDragReorderOptions): UseDragReorderResult {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const didDropRef = useRef(false);
    const draggedIndexRef = useRef<number | null>(null);
    const dropIndexRef = useRef<number | null>(null);
    const pendingDropIndexRef = useRef<number | null>(null);
    const frameRequestRef = useRef<number | null>(null);

    const getResolvedIndex = useCallback(
        (insertionIndex: number): number | null => {
            if (draggedIndexRef.current === null) {
                return null;
            }

            const clampedInsertion = Math.max(
                0,
                Math.min(insertionIndex, itemCount)
            );
            return clampedInsertion > draggedIndexRef.current
                ? clampedInsertion - 1
                : clampedInsertion;
        },
        [itemCount]
    );

    const reset = useCallback(() => {
        setDraggedIndex(null);
        setDropIndex(null);
        draggedIndexRef.current = null;
        dropIndexRef.current = null;
        pendingDropIndexRef.current = null;
        if (frameRequestRef.current !== null) {
            cancelAnimationFrame(frameRequestRef.current);
            frameRequestRef.current = null;
        }
    }, []);

    const onDragStart = useCallback(
        (index: number) => (event: React.DragEvent<HTMLElement>) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
            const rowElement = event.currentTarget.closest(
                '[data-drag-row="true"]'
            );
            if (rowElement instanceof HTMLElement) {
                event.dataTransfer.setDragImage(rowElement, 24, 24);
            }
            didDropRef.current = false;
            draggedIndexRef.current = index;
            setDraggedIndex(index);
            setDropIndex(null);
        },
        []
    );

    const onDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>, index: number) => {
            if (draggedIndexRef.current === null) {
                return;
            }
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            const insertionIndex = Math.max(0, Math.min(index, itemCount));
            const resolvedIndex = getResolvedIndex(insertionIndex);
            const isNoOpDropTarget =
                resolvedIndex === null ||
                resolvedIndex === draggedIndexRef.current;
            const nextIndex = isNoOpDropTarget ? null : insertionIndex;

            if (dropIndexRef.current === nextIndex) {
                return;
            }

            // Keep reorder logic in sync with the latest drag target immediately.
            dropIndexRef.current = nextIndex;
            pendingDropIndexRef.current = nextIndex;
            if (frameRequestRef.current !== null) {
                return;
            }

            frameRequestRef.current = requestAnimationFrame(() => {
                frameRequestRef.current = null;
                setDropIndex(pendingDropIndexRef.current);
            });
        },
        [getResolvedIndex, itemCount]
    );

    const onContainerDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (draggedIndexRef.current === null) {
                return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';

            const target = event.target;
            if (
                target instanceof Element &&
                target.closest('[data-drag-row="true"]') !== null
            ) {
                return;
            }

            const rows = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                    '[data-drag-row="true"]'
                )
            );

            let nextIndex = itemCount;
            if (rows.length > 0) {
                const firstTop = rows[0].getBoundingClientRect().top;
                const lastBottom =
                    rows[rows.length - 1].getBoundingClientRect().bottom;

                if (event.clientY < firstTop) {
                    nextIndex = 0;
                } else if (event.clientY > lastBottom) {
                    nextIndex = itemCount;
                } else {
                    return;
                }
            }

            const resolvedIndex = getResolvedIndex(nextIndex);
            if (
                resolvedIndex === null ||
                resolvedIndex === draggedIndexRef.current
            ) {
                if (dropIndexRef.current !== null) {
                    dropIndexRef.current = null;
                    pendingDropIndexRef.current = null;
                    if (frameRequestRef.current === null) {
                        frameRequestRef.current = requestAnimationFrame(() => {
                            frameRequestRef.current = null;
                            setDropIndex(null);
                        });
                    }
                }
                return;
            }

            if (dropIndexRef.current === nextIndex) {
                return;
            }

            dropIndexRef.current = nextIndex;
            pendingDropIndexRef.current = nextIndex;
            if (frameRequestRef.current !== null) {
                return;
            }

            frameRequestRef.current = requestAnimationFrame(() => {
                frameRequestRef.current = null;
                setDropIndex(pendingDropIndexRef.current);
            });
        },
        [getResolvedIndex, itemCount]
    );

    const applyReorder = useCallback(() => {
        if (
            draggedIndexRef.current === null ||
            dropIndexRef.current === null ||
            itemCount < 2
        ) {
            reset();
            return;
        }

        const insertionIndex = Math.max(
            0,
            Math.min(dropIndexRef.current, itemCount)
        );
        const nextIndex =
            insertionIndex > draggedIndexRef.current
                ? insertionIndex - 1
                : insertionIndex;
        if (nextIndex !== draggedIndexRef.current) {
            onMove(draggedIndexRef.current, nextIndex);
        }
        reset();
    }, [itemCount, onMove, reset]);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            didDropRef.current = true;
            applyReorder();
        },
        [applyReorder]
    );

    const onDragEnd = useCallback(() => {
        if (didDropRef.current) {
            didDropRef.current = false;
            return;
        }
        if (dropIndexRef.current !== null) {
            applyReorder();
            return;
        }

        reset();
    }, [applyReorder, reset]);

    return {
        dropIndex,
        isDragging: draggedIndex !== null,
        onDragStart,
        onDragOver,
        onContainerDragOver,
        onDrop,
        onDragEnd,
    };
}
