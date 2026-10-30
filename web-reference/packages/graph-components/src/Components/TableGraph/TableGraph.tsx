import { flexRender } from '@tanstack/react-table';
import type { DiscreteDimension, GraphDataSeries1D } from '../../Common/types';
import { TableCell, TableHeader, TableRow } from './Components';
import styles from './TableGraph.module.scss';
import { getColumnAlign, useDynamicTable } from './utils';

type TableGraphProps = {
    data: GraphDataSeries1D<DiscreteDimension>;
    stickyHeader?: boolean;
    showSumRow?: boolean;
    locale?: string;
    showDecimals?: boolean;
};

export function TableGraph({
    data,
    stickyHeader,
    showSumRow = true,
    locale,
    showDecimals = false,
}: TableGraphProps) {
    const table = useDynamicTable({ data, locale, showDecimals });
    const rows = table.getRowModel().rows;

    return (
        <div className={styles.container}>
            <table className={'w-full ' + styles.table}>
                <TableHeader table={table} sticky={stickyHeader} />
                <tbody>
                    {rows.map((row) => (
                        <TableRow row={row} key={row.id} />
                    ))}
                </tbody>
                {showSumRow && (
                    <tfoot>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map((header, idx) => {
                                    const align = getColumnAlign(
                                        header.column.columnDef.meta
                                    );

                                    return (
                                        <TableCell
                                            key={header.id}
                                            variant="footer"
                                            align={align}
                                            isDomainColumn={idx === 0}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .footer,
                                                      header.getContext()
                                                  )}
                                        </TableCell>
                                    );
                                })}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
        </div>
    );
}
