import { cn } from '@brilliant/bds-core';
import type { Table as TableProp } from '@tanstack/react-table';
import { HeaderCell } from '../cells';

interface TableHeaderProps<T> {
    table: TableProp<T>;
    sticky?: boolean;
    virtual?: boolean;
}

export function TableHeader<T>({
    table,
    sticky,
    virtual,
}: TableHeaderProps<T>) {
    return (
        <thead className={cn(sticky && 'sticky top-0 z-10', virtual && 'grid')}>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr
                    key={headerGroup.id}
                    className={cn(
                        'border-b-2 border-primary',
                        virtual && 'flex w-full'
                    )}
                >
                    {headerGroup.headers.map((header) => (
                        <HeaderCell
                            header={header}
                            key={header.id}
                            table={table}
                            sticky={sticky}
                            virtual={virtual}
                        />
                    ))}
                </tr>
            ))}
        </thead>
    );
}
