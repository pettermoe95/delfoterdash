import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { PlaceholderRow } from '../components/PlaceholderRow';
import { TableHeader } from '../components/TableHeader';
import { ROW_HEIGHT, TableRow } from '../components/TableRow';
import { useTableContext } from './TableContext';

export function VirtualTable() {
    const { table, rowConfig, isLoading, noDataMessage, height, localizeFn } =
        useTableContext();
    const { rows } = table.getRowModel();
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => ROW_HEIGHT,
        measureElement:
            typeof window !== 'undefined' &&
            !navigator.userAgent.includes('Firefox')
                ? (element) => element?.getBoundingClientRect().height
                : undefined,
        overscan: 10,
    });

    return (
        <div
            ref={tableContainerRef}
            className="relative overflow-auto"
            style={{ height }}
        >
            <table className="grid table-fixed border-collapse border-spacing-0">
                <TableHeader table={table} sticky virtual />
                <tbody
                    className="relative grid bg-inherit"
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                >
                    {rows.length === 0 && (
                        <PlaceholderRow
                            noDataMessage={noDataMessage}
                            isLoading={isLoading}
                            localizeFn={localizeFn}
                        />
                    )}
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = rows[virtualRow.index]!;
                        return (
                            <TableRow
                                ref={(node) =>
                                    rowVirtualizer.measureElement(node)
                                }
                                key={row.id}
                                dataIndex={virtualRow.index}
                                row={row}
                                rowConfig={rowConfig}
                                className="absolute flex w-full items-center"
                                // virtualConfig.start - idx * virtualConfig.size
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
