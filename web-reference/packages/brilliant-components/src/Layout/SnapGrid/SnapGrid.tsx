import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './SnapGrid.module.scss';

type SnapGridProps = {
    columns: number;
    gap?: number | string;
    rows?: number;
};

export function SnapGrid({ columns, rows, gap = '.5rem' }: SnapGridProps) {
    // Measure for grid
    const gridRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(0);

    useEffect(() => {
        if (gridRef.current) {
            setCellSize(gridRef.current.clientWidth / columns);
        }
    }, [columns]);

    /*function screenToGrid(x: number, y: number) {
        const rx = x - gridLeft;
        const ry = y - gridTop;
        const gridX = Math.floor(rx / cellWidth);
        const gridY = Math.floor(ry / cellHeight);
        const gx = Math.min(Math.max(gridX, 0), gridColumns - 1);
        const gy = Math.min(Math.max(gridY, 0), gridRows - 1);
        return {
            x: gx,
            y: gy,
        };
    }*/

    const gStyle: CSSProperties = {
        gap: gap,
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: rows ? `repeat(${rows}, ${cellSize}px)` : 'none',
        maxHeight: rows ? `${cellSize * rows}px` : 'none',
        backgroundSize: `${cellSize}px ${cellSize}px`,
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className={styles.snapGrid} style={gStyle} ref={gridRef}>
                <div>A</div>
                <div>B</div>
                {/*<div
                    ref={gridRef}
                    className={styles.snap_grid}
                    style={gridStyle}
                    onMouseMove={handleMouseMove}
                    onClick={test2}
                >
                    {gridBackground}

                    <ResizableContainer width={cellWidth} height={cellWidth} snap={cellWidth} style={gStyle}>
                        <b></b>
                    </ResizableContainer>
                </div>*/}
            </div>
        </div>
    );
}
