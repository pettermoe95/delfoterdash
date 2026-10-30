import type { CSSProperties } from 'react';
import { useState } from 'react';

type SnapCardProps = {
    row: number;
    column: number;
    width: number;
    height: number;
    onHover?: (x: number, y: number) => void;
    onDropped?: (x: number, y: number) => void;
};

const dragImg = new Image(0, 0);
dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function SnapCard({ row, column, width, height, onHover, onDropped }: SnapCardProps) {
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({
        x: 0,
        y: 0,
    });

    const dragStyle: CSSProperties = {
        backgroundColor: 'red',
        opacity: 0.5,
        zIndex: 100,
    };
    const cardStyle: CSSProperties = {
        gridColumnStart: column,
        gridColumnEnd: column + width,
        gridRowStart: row,
        gridRowEnd: row + height,
        backgroundColor: 'cyan',
        margin: '1em',
        borderRadius: '1em',
    };

    function handleOnDragStart(e: React.DragEvent<HTMLDivElement>) {
        e.dataTransfer.setDragImage(dragImg, 0, 0);
        setDragging(true);
    }
    function handleOnDrag(e: React.MouseEvent<HTMLDivElement>) {
        onHover?.(e.clientX, e.clientY);
        setOffset({
            x: e.clientX,
            y: e.clientY,
        });
    }
    function handleOnEnd() {
        onDropped?.(offset.x, offset.y);
        setDragging(false);
    }
    return (
        <>
            <div
                draggable
                style={cardStyle}
                onDragStart={handleOnDragStart}
                onDrag={handleOnDrag}
                onDragEnd={handleOnEnd}
            ></div>
            {dragging && <div style={{ ...cardStyle, ...dragStyle }}></div>}
        </>
    );
}
