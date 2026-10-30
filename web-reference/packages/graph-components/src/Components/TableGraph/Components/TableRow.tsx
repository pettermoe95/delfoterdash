import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import type { PropsWithChildren } from 'react';
import type { DynamicData } from '../types';
import { getColumnAlign } from '../utils';
import { TableCell } from './TableCell';
import styles from './TableRow.module.scss';

type TableRowProps = PropsWithChildren<{
    row: Row<DynamicData>;
}>;

export function TableRow({ row }: TableRowProps) {
    return (
        <tr className={styles.row}>
            {row.getVisibleCells().map((cell, idx) => {
                const align = getColumnAlign(cell.column.columnDef.meta);

                return (
                    <TableCell
                        key={cell.id}
                        align={align}
                        isDomainColumn={idx === 0}
                    >
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                );
            })}
        </tr>
    );
}
