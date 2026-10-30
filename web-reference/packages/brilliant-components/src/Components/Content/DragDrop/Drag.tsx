import type { CSSProperties, HTMLProps, MouseEvent, ReactNode, RefObject } from 'react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { DragItem, DropArea } from '~/Components/Content/DragDrop/DragAndDrop';
import { DragDropContext } from '~/Components/Content/DragDrop/DragAndDrop';
import type { SpringValue } from '@react-spring/web';
import { useSpring, animated, to } from '@react-spring/web';
import styles from './DragAndDrop.module.scss';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ThemeContext, ThemeContextWrapper } from '~/Theme';

// ===================================== //
//                Types                  //
// ===================================== //

type OriginalDisplay = 'same' | 'transparent' | 'fade' | 'hide';

type UseDragProps<T, U = unknown> = {
    id: string; // Unique id for drag element
    data: () => T; // Data associated with element
    type?: string; // Type (accepted by drop zones)
    fullAnchor?: boolean; // Allow dragging anywhere (default true)
    originalDisplay?: OriginalDisplay; // How to display the original element when dragging
    onDropped?: (drop: DropArea<U>) => void; // Callback when the element is dropped in a drop area
};

type WrapperProps = Omit<HTMLProps<HTMLDivElement>, 'onDragStart'> & {
    children: ReactNode;
};

type UseDragReturn<U> = {
    isDragging: boolean;
    Original: (p: WrapperProps) => JSX.Element;
    Preview: (p: DragPreviewProps) => JSX.Element;
    dropTarget?: DropArea<U>;
    anchorBindings: {
        onMouseDown(e: MouseEvent): void;
    };
};

// ===================================== //
//               Drag Hook               //
// ===================================== //

/***
 * Hook used to bind a drag action to an element.
 * This enables drag-and-drop actions in the UI.
 *
 * The hook returns an object with various bindings to use.
 * The most important bindings are the Original and Preview wrappers.
 * You should use these as wrappers around the element that should be dragged,
 * as well as for the preview that should be shown while dragging.
 *
 * @param id Unique ID for this element. Used by the context to recognize the item
 * @param data Callback to get data associated with the element, can be passed to drop-hooks
 * @param type The type of element. Can be used to group different drag-and-drop categories.
 * @param originalDisplay How to display the original while dragging (same, transparent, fade, hide)
 * @param onDropped Action to perform when the element is dropped in a matching drop container
 */
export function useDrag<DragDataType, DropDataType>({
    id,
    data,
    type = 'all',
    originalDisplay = 'same',
    onDropped,
}: UseDragProps<DragDataType, DropDataType>): UseDragReturn<DropDataType> {
    const { drag, dragDropAction, justDropped, mouse, setDrag } = useContext(DragDropContext);
    const ref = useRef<HTMLDivElement>(null);

    const dragObject = drag?.id === id ? drag : undefined;
    const isDragging = dragObject !== undefined;
    const originalBounds = ref.current?.getBoundingClientRect();
    const [didDrop, setDidDrop] = useState(justDropped?.id === id);
    const [didStartDrag, setDidStartDrag] = useState(false);

    // Spring animation config
    const [springs, springApi] = useSpring(() => ({
        from: {
            width: originalBounds?.width ?? -1,
            height: originalBounds?.height ?? -1,
            x: mouse.x,
            y: mouse.y,
        },
        config: {
            mass: 1,
            friction: 45,
            tension: 1200,
        },
    }));

    // Drag position animation
    useEffect(() => {
        if (isDragging) {
            springApi.set({
                x: mouse.x,
                y: mouse.y,
            });
        }
    }, [didStartDrag, isDragging, mouse, springApi]);

    // Start drag action
    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            // Calculate offset origin
            const originalBounds = ref.current?.getBoundingClientRect();
            const offX = (e.clientX - (originalBounds?.x ?? 0)) / (originalBounds?.width ?? 1);
            const offY = (e.clientY - (originalBounds?.y ?? 0)) / (originalBounds?.height ?? 1);
            // Start drag in global context
            setDrag({
                id: id,
                type: type,
                data: data(),
                origin: {
                    x: offX,
                    y: offY,
                },
            });
        },
        [setDrag, id, type, data],
    );

    // End drag
    useEffect(() => {
        if (dragDropAction?.drag.id === id) {
            onDropped?.(dragDropAction.drop as DropArea<DropDataType>);
        }
    }, [dragDropAction, id, onDropped]);

    // Start/stop animation
    useEffect(() => {
        if (isDragging && !didStartDrag) {
            springApi.set({
                width: -1,
                height: -1,
            });
            setDidStartDrag(true);
        }
        if (!isDragging && didStartDrag) {
            setDidStartDrag(false);
        }
    }, [didStartDrag, isDragging, originalBounds, springApi]);

    // Wrapper around the original element
    const Original = useCallback(
        function Original({ children, ...rest }: WrapperProps) {
            const op = originalDisplay === 'fade' ? '0.25' : '1';
            const internalStyle: CSSProperties = {
                display: isDragging && originalDisplay === 'hide' ? 'none' : '',
                opacity: isDragging ? (originalDisplay === 'transparent' ? '0' : op) : '1',
            };
            return (
                <DragOriginal
                    key={id}
                    forwardRef={ref}
                    didDrop={didDrop}
                    onDropComplete={() => setDidDrop(false)}
                    internalStyle={internalStyle}
                    onDragStart={handleDragStart}
                    {...rest}
                >
                    {children}
                </DragOriginal>
            );
        },
        [didDrop, handleDragStart, id, isDragging, originalDisplay],
    );

    // Wrapper around the drag preview element
    const Preview = useCallback(
        function Preview({ scaleSize = 1, width, height, children, ...rest }: DragPreviewProps) {
            if (dragObject === undefined) {
                return <></>;
            }
            // Initial sizing (equal to original)
            if (springs.width.get() === -1 || springs.height.get() === -1) {
                springApi.set({
                    width: originalBounds?.width ?? 10,
                    height: originalBounds?.height ?? 10,
                });
                void springApi.start({
                    width: (originalBounds?.width ?? 10) * scaleSize,
                    height: (originalBounds?.height ?? 10) * scaleSize,
                });
            }
            // External resize request (undefined values are ignored)
            void springApi.start({
                width: width ? width * scaleSize : undefined,
                height: height ? height * scaleSize : undefined,
            });

            return (
                <DragPreview dragObject={dragObject} springs={springs} {...rest}>
                    {children}
                </DragPreview>
            );
        },
        [dragObject, originalBounds, springApi, springs],
    );

    // Return
    return {
        isDragging: isDragging,
        Original: Original,
        Preview: Preview,
        dropTarget: undefined, //dropTarget,
        anchorBindings: {
            onMouseDown: handleDragStart,
        },
    };
}

// ===================================== //
//             Drag Original             //
// ===================================== //

type SpringType = {
    width: SpringValue<number>;
    height: SpringValue<number>;
    x: SpringValue<number>;
    y: SpringValue<number>;
};

type DragOriginalInternalProps = {
    fullAnchor?: boolean;
    forwardRef?: RefObject<HTMLDivElement>;
    internalStyle: CSSProperties;
    didDrop: boolean;
    onDropComplete: () => void;
    onDragStart: (e: MouseEvent) => void;
};

type DragOriginalProps = Omit<HTMLProps<HTMLDivElement>, 'onDragStart'> & {
    fullAnchor?: boolean;
    children: ReactNode;
};

/***
 * Wrapper for the original item that becomes draggable
 * @param forwardRef Reference to drag div
 * @param internalStyle Interal style handling
 * @param onDragStart Callback for drag start
 * @param onDropComplete Callback for drag complete
 * @param didDrop Boolean for drop animation
 * @param fullAnchor Whether or not the whole div should be a drag anchor
 * @param children Items inside container
 * @param rest Additional parameters for the div
 * @constructor
 */
export function DragOriginal({
    // Internal
    forwardRef,
    internalStyle,
    onDragStart,
    onDropComplete,
    didDrop,
    // External
    fullAnchor,
    children,
    ...rest
}: DragOriginalInternalProps & DragOriginalProps) {
    return (
        <div
            ref={forwardRef}
            onMouseDown={fullAnchor ? onDragStart : undefined}
            {...rest}
            className={clsx({
                [styles.dropAnim]: didDrop,
                [rest.className ?? '']: true,
            })}
            style={{
                ...rest.style,
                ...internalStyle,
            }}
            // This prevents pointer events until drop animation is done
            // Also forces rerender on animation complete which prevents a
            // browser bug that requires two initial clicks to perform an action
            onAnimationEnd={onDropComplete}
        >
            {children}
        </div>
    );
}

// ===================================== //
//             Drag Preview              //
// ===================================== //

type DragPreviewInternalProps = {
    originalBounds?: DOMRect;
    dragObject: DragItem<unknown>;
    springs: SpringType;
};

type DragPreviewProps = {
    width?: number;
    height?: number;
    scaleSize?: number;
    style?: CSSProperties;
    children: ReactNode;
};

/**
 * Wraps the preview used for drag-and-drop
 * @param dragObject Drag item data
 * @param springs Spring animator from parent
 * @param style Custom provided style
 * @param children Children within preview
 * @constructor
 */
export function DragPreview({
    // Internal
    dragObject,
    springs,

    // External
    style,
    children,
}: DragPreviewProps & DragPreviewInternalProps) {
    const theme = useContext(ThemeContext);
    const posX = springs.x;
    const posY = springs.y;
    const originX = dragObject.origin?.x ?? 0.5;
    const originY = dragObject.origin?.y ?? 0.5;
    const preview = (
        <animated.div
            className={clsx({
                [styles.dragPreview]: true,
            })}
            style={{
                width: 1,
                height: 1,
                overflow: 'visible',
                position: 'absolute',
                transform: to([posX, posY], (x, y) => `translate(${x}px, ${y}px)`),
                top: 0,
                left: 0,
                zIndex: 100,
            }}
        >
            {/* Since we use a portal we must also wrap the preview in a theme wrapper */}
            <ThemeContextWrapper defaultTheme={theme.theme}>
                <animated.div
                    style={{
                        ...style,
                        transform: `translate(-${originX * 100}%, -${originY * 100}%)`,
                        ...springs,
                    }}
                >
                    {children}
                </animated.div>
            </ThemeContextWrapper>
        </animated.div>
    );
    return createPortal(preview, document.body, 'drag-preview');
}
