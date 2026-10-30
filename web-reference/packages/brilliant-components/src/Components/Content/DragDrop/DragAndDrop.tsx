import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';

export type DragItem<T> = {
    data: T;
    id: string;
    type: string;
    origin?: DragDropPosition;
};

export type DroppedDragItem<T> = DragItem<T> & {
    fromPosition: DragDropPosition;
};

export type DropArea<U> = {
    id: string;
    data?: U;
    types?: string[];
};

// Recently performed drag/drop
export type DragDropAction<T, U> = {
    drag: DragItem<T>;
    drop: DropArea<U>;
};

// Global D&D context
type DragDropContextType = {
    drag?: DragItem<unknown>; // Currently dragging item
    drop?: DropArea<unknown>; // Currently hovering drop area
    mouse: DragDropPosition; // Global mouse position
    mouseDelta: DragDropPosition; // Global mouse delta
    setDrag: (item?: DragItem<unknown>) => void; // Set drag item
    setDrop: (data?: DropArea<unknown>) => void; // Set hover drop area
    justDropped?: DroppedDragItem<unknown>; // Just dropped item (for animating placement)

    // Single frame state indicating item dragged to drop area
    // Used by hooks to move data in a single frame.
    dragDropAction?: DragDropAction<unknown, unknown>;
};

export type DragDropPosition = {
    x: number;
    y: number;
};

export const DragDropContext = createContext<DragDropContextType>({
    drag: undefined,
    drop: undefined,
    dragDropAction: undefined,
    justDropped: undefined,
    mouse: {
        x: 0,
        y: 0,
    },
    mouseDelta: {
        x: 0,
        y: 0,
    },
    setDrag() {
        return;
    },
    setDrop() {
        return;
    },
});

type DragAndDropWrapperProps = {
    children: ReactNode;
};

const cursorStyle = document.createElement('style');
cursorStyle.innerHTML = '*{ cursor: grabbing!important; }';

/**
 * Drag and drop wrapper handles context for DnD system
 */
export function DragAndDropWrapper({ children }: DragAndDropWrapperProps) {
    const [drag, setDrag] = useState<DragItem<unknown> | undefined>(undefined);
    const [drop, setDrop] = useState<DropArea<unknown> | undefined>(undefined);
    const [dragDropAction, setDragDropAction] = useState<DragDropAction<unknown, unknown> | undefined>(undefined);
    const [justDropped, setJustDropped] = useState<DroppedDragItem<unknown> | undefined>(undefined);
    const [mouse, setMouse] = useState<DragDropPosition>({ x: 0, y: 0 });
    const [mouseDelta, setMouseDelta] = useState<DragDropPosition>({ x: 0, y: 0 });

    const context: DragDropContextType = {
        drag: drag,
        drop: drop,
        dragDropAction: dragDropAction,
        justDropped: justDropped,
        mouse: {
            x: mouse.x,
            y: mouse.y,
        },
        mouseDelta: {
            x: mouseDelta.x,
            y: mouseDelta.y,
        },
        setDrag: setDrag,
        setDrop: setDrop,
    };

    // Reset drag/drop after a single frame with the dragDrop action (received by drag/drop hooks).
    // This enables both events (e.g. removing from one box and adding to another) to
    // happen in a single frame without flickering/duplicate data.
    useEffect(() => {
        if (dragDropAction !== undefined) {
            setDrag(undefined);
            setDrop(undefined);
            setDragDropAction(undefined);
            setJustDropped({
                ...dragDropAction.drag,
                fromPosition: {
                    x: mouse.x,
                    y: mouse.y,
                },
            });
        }
    }, [dragDropAction, mouse]);

    // Override cursor style when dragging
    useEffect(() => {
        if (drag !== undefined) {
            if (!document.head.contains(cursorStyle)) {
                document.head.appendChild(cursorStyle);
            }
        } else {
            if (document.head.contains(cursorStyle)) {
                document.head.removeChild(cursorStyle);
            }
        }
    }, [drag]);

    // Global event listeners
    useEffect(() => {
        function start() {
            setJustDropped(undefined);
        }

        // Stop dragging
        function stop() {
            if (drag !== undefined) {
                if (drop !== undefined) {
                    // Perform D&D action
                    setDragDropAction({ drag: drag, drop: drop });
                } else {
                    // Cancelled with no target
                    setDrag(undefined);
                    setJustDropped({
                        ...drag,
                        fromPosition: {
                            x: mouse.x,
                            y: mouse.y,
                        },
                    });
                }
            }
        }

        // Update mouse position
        function track(e: MouseEvent) {
            if (drag !== undefined) {
                e.preventDefault();
                e.stopPropagation();
                setMouse({
                    x: e.clientX,
                    y: e.clientY,
                });
                setMouseDelta({
                    x: e.movementX,
                    y: e.movementY,
                });
            }
        }
        window.addEventListener('mousedown', start);
        window.addEventListener('mouseup', stop);
        window.addEventListener('mousemove', track);
        window.addEventListener('mousedown', track);
        return () => {
            window.removeEventListener('mousedown', start);
            window.removeEventListener('mouseup', stop);
            window.removeEventListener('mousemove', track);
            window.removeEventListener('mousedown', track);
        };
    }, [drag, drop, mouse]);

    return <DragDropContext.Provider value={context}>{children}</DragDropContext.Provider>;
}
