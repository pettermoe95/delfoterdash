import { cn } from '@brilliant/bds-core';
import type { Cell } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useTableContext } from '../tables/TableContext';

type TableCellProps<T> = {
    cell: Cell<T, unknown>;
    colSpan?: number;
};

export function TableCell<T>({ cell, colSpan }: TableCellProps<T>) {
    const { virtual } = useTableContext();

    return (
        <td
            className={cn(
                'table-cell',
                'overflow-hidden px-sm py-lg',
                'relative',
                virtual && 'flex'
            )}
            style={{
                width: cell.column.getSize(),
            }}
            title={
                typeof cell.getValue() === 'string'
                    ? (cell.getValue() as string)
                    : ''
            }
            colSpan={colSpan}
        >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
    );
}
