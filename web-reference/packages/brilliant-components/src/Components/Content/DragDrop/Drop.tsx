import type { MouseEvent } from 'react';
import type React from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import type { DragItem } from '~/Components/Content/DragDrop/DragAndDrop';
import { DragDropContext } from '~/Components/Content/DragDrop/DragAndDrop';

type DropAreaProps<T, U> = {
    id: string;
    types: string[];
    handleHover?: (data: T, e: MouseEvent) => U;
    handleLeave?: (data: T, e: MouseEvent) => void;
    handleDrop?: (item: DragItem<T>) => void;
};

type DropAreaReturnType = {
    // Callback bindings for drag and drop actions. Must be attached to the droppable area element.
    bindings: {
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseLeave: (e: React.MouseEvent) => void;
        onMouseEnter: (e: React.MouseEvent) => void;
    };
    // True if something is being dragged right now that can be dropped in this area.
    canDrop: boolean;
};

/***
 * Hook used to define a drop target for elements using the drag hook.
 * The hook enables you to receive data from the drag element, as well
 * as handle different rendering for hover, dropping etc.
 *
 * The hook returns bindings that must be attached to the droppable arae.
 * The hook also returns a boolean indicating whether an item that can be dropped
 * in the area is currently being dragged. This can be used for highlighting the
 * area to make the action evident for the user.
 *
 * @param id Unique identifier for this drop area
 * @param types The types of drag items this drop area accepts
 * @param handleHover Callback when a drag item hovers this area
 * @param handleLeave Callback when a drag item leaves this area
 * @param handleDrop Callback when a drag item is dropped on this area
 */
export function useDrop<T, U>({
    id,
    types,
    handleHover,
    handleLeave,
    handleDrop,
}: DropAreaProps<T, U>): DropAreaReturnType {
    const { drag, drop, dragDropAction, setDrop } = useContext(DragDropContext);
    const typeAccepted = useMemo(() => drag !== undefined && types.includes(drag.type), [drag, types]);
    const canDrop = useMemo(() => drop?.id === id && typeAccepted, [drop?.id, id, typeAccepted]);

    const handleMouseEnter = useCallback(
        function handleMouseEnter(e: MouseEvent) {
            if (drag !== undefined && typeAccepted) {
                const dropData = handleHover?.(drag.data as T, e);
                setDrop({
                    id: id,
                    data: dropData,
                    types: types,
                });
            }
        },
        [drag, typeAccepted, handleHover, setDrop, id, types],
    );

    const handleMouseLeave = useCallback(
        function handleMouseLeave(e: MouseEvent) {
            setDrop(undefined);
            if (drag !== undefined && typeAccepted) {
                handleLeave?.(drag.data as T, e);
            }
        },
        [drag, handleLeave, setDrop, typeAccepted],
    );

    // Drop is handled in drag drop context manager
    useEffect(() => {
        if (canDrop && dragDropAction !== undefined) {
            handleDrop?.(dragDropAction.drag as DragItem<T>);
        }
    });

    return {
        canDrop: canDrop,
        bindings: {
            onMouseDown: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onMouseEnter: handleMouseEnter,
        },
    };
}
