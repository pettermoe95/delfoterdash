import type { Row } from '@tanstack/react-table';
import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../utils';
import { TableCell } from '../cells';
import type { RowConfig } from '../types';

type TableRowProps<T> = {
    className?: string;
    row: Row<T>;
    rowConfig?: RowConfig<T>;
    style?: CSSProperties;
    dataIndex?: number;
};

export const ROW_HEIGHT = 48;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps<unknown>>(
    ({ row, className, rowConfig, style, dataIndex }, ref) => {
        return (
            <tr
                ref={ref}
                data-index={dataIndex}
                className={cn(
                    'border-b border-secondary',
                    'hover:bg-secondary-hover',
                    rowConfig?.onClick ? 'cursor-pointer' : 'initial',
                    rowConfig?.getRowBackground?.(row),
                    className
                )}
                style={{
                    minHeight: ROW_HEIGHT,
                    ...style,
                }}
                onMouseEnter={handleRowEvent(row, rowConfig?.onMouseEnter)}
                onMouseLeave={handleRowEvent(row, rowConfig?.onMouseLeave)}
                onClick={() => rowConfig?.onClick?.(row)}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} cell={cell} />
                ))}
            </tr>
        );
    }
);

function handleRowEvent<T>(row: Row<T>, handler?: (row: Row<T>) => void) {
    if (!handler) return undefined;
    return () => {
        handler(row);
    };
}
