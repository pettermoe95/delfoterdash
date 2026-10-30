import { useIsMobile } from '@brilliant/components';
import type { SortingState } from '@tanstack/react-table';
import {
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CellContent } from './cells/CellContent';
import { BasicTable } from './tables/BasicTable';
import { BasicTableMobile } from './tables/BasicTableMobile';
import { TableProvider } from './tables/TableContext';
import { VirtualTable } from './tables/VirtualTable';
import type { DataTableProps } from './types';

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    sortable,
    defaultSorting,
    rowConfig,
    isLoading,
    noDataMessage,
    virtual,
    height,
    stickyHeader,
    localizeFn,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>(
        defaultSorting ? [defaultSorting] : []
    );
    const isMobile = useIsMobile();

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting: sortable ? sorting : undefined,
        },
        defaultColumn: {
            cell: ({ cell }) => {
                return (
                    <CellContent className="line-clamp-2">
                        {cell.getValue() as ReactNode}
                    </CellContent>
                );
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    });
    if (isMobile) {
        return (
            <TableProvider
                value={{
                    table,
                    rowConfig,
                    noDataMessage,
                    isLoading,
                    stickyHeader,
                    virtual,
                    height,
                    localizeFn,
                }}
            >
                <BasicTableMobile />
            </TableProvider>
        );
    }

    return (
        <TableProvider
            value={{
                table,
                rowConfig,
                noDataMessage,
                isLoading,
                stickyHeader,
                virtual,
                height,
                localizeFn,
            }}
        >
            {virtual ? <VirtualTable /> : <BasicTable />}
        </TableProvider>
    );
}
