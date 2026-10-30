import clsx from 'clsx';
import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Column, Row } from '../../../Layout';
import styles from './ResizableContainer.module.scss';

type ResizableContainerProps = {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    snap?: number;
    style?: CSSProperties;
    children?: ReactElement;
};

type DragState = {
    axis: 'x' | 'y' | 'xy' | undefined;
    widthBefore: number;
    heightBefore: number;
    startX: number;
    startY: number;
};

const dragImg = new Image(0, 0);
dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function ResizableContainer({
    width = 400,
    height = 250,
    minWidth = 60,
    minHeight = 60,
    snap = 256,
    style,
    children,
}: ResizableContainerProps) {
    const snapSize = useCallback(
        (size: number, min?: number) => {
            const snapped = Math.round(size / snap) * snap;
            return Math.max(snapped, min ?? snapped);
        },
        [snap],
    );

    const snapMinWidth = snapSize(minWidth, snap);
    const snapMinHeight = snapSize(minHeight, snap);

    const [currentWidth, setCurrentWidth] = useState<number>(snapSize(width, snapMinWidth));
    const [currentHeight, setCurrentHeight] = useState<number>(snapSize(height, snapMinHeight));
    const [drag, setDrag] = useState<DragState>({
        axis: undefined,
        widthBefore: width,
        heightBefore: height,
        startX: 0,
        startY: 0,
    });

    const setSize = useCallback(
        (w: number, h: number, doSnap: boolean) => {
            if (doSnap) {
                setCurrentWidth(snapSize(w, snapMinWidth));
                setCurrentHeight(snapSize(h, snapMinHeight));
            } else {
                setCurrentWidth(Math.max(w, snapMinWidth));
                setCurrentHeight(Math.max(h, snapMinHeight));
            }
        },
        [snapMinWidth, snapMinHeight, snapSize],
    );

    function handleDragStart(axis: 'x' | 'y' | 'xy') {
        return (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.setDragImage(dragImg, 0, 0);
            setDrag({
                axis: axis,
                widthBefore: currentWidth,
                heightBefore: currentHeight,
                startX: e.pageX,
                startY: e.pageY,
            });
            console.log('Start drag ' + axis);
        };
    }

    const handleOnDrag = useMemo(
        () =>
            function handleOnDrag(e: React.MouseEvent<HTMLDivElement>) {
                // Bug with chrome
                if (e.clientY === 0 || e.clientX === 0) return;

                let tx = currentWidth;
                let ty = currentHeight;
                const dx = drag.startX - e.pageX;
                const dy = drag.startY - e.pageY;
                if (drag.axis === 'x' || drag.axis === 'xy') {
                    tx = drag.widthBefore - dx;
                }
                if (drag.axis === 'y' || drag.axis === 'xy') {
                    ty = drag.heightBefore - dy;
                }
                setSize(tx, ty, true);
            },
        [
            currentHeight,
            currentWidth,
            drag.axis,
            drag.heightBefore,
            drag.startX,
            drag.startY,
            drag.widthBefore,
            setSize,
        ],
    );

    function handleOnDragEnd() {
        setSize(currentWidth, currentHeight, true);
        setDrag({ ...drag, axis: undefined });
    }

    const wrapperStyle = {
        width: currentWidth,
        height: currentHeight,
        maxHeight: currentHeight,
        maxWidth: currentWidth,
        ...style,
    };

    return (
        <div className={clsx(styles.wrapper, drag.axis !== undefined && styles.is_dragging)} style={wrapperStyle}>
            <Column className={styles.column} gap="none">
                <Row className={styles.row} gap="none">
                    <div className={styles.content}>{children}</div>
                    <div
                        draggable
                        className={styles.drag_right}
                        onDragStart={handleDragStart('x')}
                        onDrag={handleOnDrag}
                        onDragEnd={handleOnDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                    />
                </Row>
                <Row gap="none">
                    <div
                        draggable
                        className={styles.drag_bottom}
                        onDragStart={handleDragStart('y')}
                        onDrag={handleOnDrag}
                        onDragEnd={handleOnDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                    />
                    <div
                        draggable
                        className={styles.drag_corner}
                        onDragStart={handleDragStart('xy')}
                        onDrag={handleOnDrag}
                        onDragEnd={handleOnDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                    />
                </Row>
            </Column>
        </div>
    );
}
