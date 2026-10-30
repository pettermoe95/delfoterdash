import type {
    Dispatch,
    KeyboardEvent,
    PointerEvent,
    SetStateAction,
} from 'react';
import { useEffect, useRef, useState } from 'react';

type ActivityResizeHandleProps = {
    height: number;
    onResize: Dispatch<SetStateAction<number>>;
};
const minHeight = 120;
const canvasSpace = 128;

export function ActivityResizeHandle({
    height,
    onResize,
}: ActivityResizeHandleProps) {
    const handle = useRef<HTMLDivElement>(null);
    const drag = useRef<{ y: number; height: number }>();
    const [maxHeight, setMaxHeight] = useState(height);
    useEffect(() => {
        const parent = handle.current?.parentElement;
        if (!parent) return;
        const observer = new ResizeObserver(() => {
            const maximum = Math.max(
                minHeight,
                parent.clientHeight - canvasSpace
            );
            setMaxHeight(maximum);
            onResize((current) =>
                Math.max(minHeight, Math.min(current, maximum))
            );
        });
        observer.observe(parent);
        return () => observer.disconnect();
    }, [onResize]);
    const resize = (next: number) =>
        onResize(Math.max(minHeight, Math.min(next, maxHeight)));
    const startResize = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { y: event.clientY, height };
    };
    const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 50 : 10;
        if (event.key === 'ArrowUp') resize(height + step);
        else if (event.key === 'ArrowDown') resize(height - step);
        else if (event.key === 'Home') resize(minHeight);
        else if (event.key === 'End') resize(maxHeight);
        else return;
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <div
            ref={handle}
            className="we-activity-resize"
            role="separator"
            tabIndex={0}
            aria-label="Resize activity log"
            aria-controls="workflow-activity"
            aria-orientation="horizontal"
            aria-valuemin={minHeight}
            aria-valuemax={maxHeight}
            aria-valuenow={height}
            title="Drag to resize activity log; use arrow keys to adjust"
            onPointerDown={startResize}
            onPointerMove={(event) => {
                if (drag.current)
                    resize(
                        drag.current.height + drag.current.y - event.clientY
                    );
            }}
            onPointerUp={(event) => {
                drag.current = undefined;
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => {
                drag.current = undefined;
            }}
            onLostPointerCapture={() => {
                drag.current = undefined;
            }}
            onKeyDown={handleResizeKeyDown}
        />
    );
}
