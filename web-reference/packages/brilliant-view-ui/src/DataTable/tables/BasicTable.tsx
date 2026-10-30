import { PlaceholderRow, TableHeader, TableRow } from '../components';
import { useTableContext } from './TableContext';

export function BasicTable() {
    const {
        table,
        rowConfig,
        stickyHeader,
        isLoading,
        noDataMessage,
        height,
        localizeFn,
    } = useTableContext();
    const { rows } = table.getRowModel();
    return (
        <div className="h-full p-2" style={{ height }}>
            <div className="flex h-full flex-col">
                <table className="w-full table-fixed border-collapse">
                    <TableHeader table={table} sticky={stickyHeader} />
                </table>
                <div className="flex-1 overflow-auto">
                    <table className="relative w-full table-fixed border-collapse">
                        <tbody className="bg-inherit">
                            {rows.length ? (
                                table
                                    .getRowModel()
                                    .rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            row={row}
                                            rowConfig={rowConfig}
                                        />
                                    ))
                            ) : (
                                <PlaceholderRow
                                    noDataMessage={noDataMessage}
                                    isLoading={isLoading}
                                    localizeFn={localizeFn}
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
