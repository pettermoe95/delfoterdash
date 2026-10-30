import { PlaceholderRow } from '../components/PlaceholderRow';
import { TableHeader } from '../components/TableHeader';
import { TableRow } from '../components/TableRow';
import { useTableContext } from './TableContext';

export function BasicTableMobile() {
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
        <div className="w-screen overflow-x-auto p-2" style={{ height }}>
            <table className="relative w-full table-fixed border-collapse">
                <TableHeader table={table} sticky={stickyHeader} />
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
    );
}
