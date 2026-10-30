import { Icon } from '@brilliant/bds-core';
import type { Header, Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import type { CSSProperties } from 'react';
import { cn } from '../../utils';

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

type HeaderCellProps<TData, TValue> = {
    header: Header<TData, TValue>;
    table: Table<TData>;
    sticky?: boolean;
    virtual?: boolean;
};

export function HeaderCell<TData, TValue>({
    header,
    table,
    sticky,
    virtual,
}: HeaderCellProps<TData, TValue>) {
    const style: CSSProperties = {
        width: header.getSize(),
    };

    const cellProps: TableHeadProps = {
        style,
        onClick: header.column.getToggleSortingHandler(),
        colSpan: header.colSpan,
    };

    return (
        <th
            {...cellProps}
            className={cn(
                'overflow-hidden border-primary px-sm py-lg',
                sticky && 'bg-secondary',
                virtual && 'flex'
            )}
        >
            <HeaderCellContent header={header} table={table} />
        </th>
    );
}

function HeaderCellContent<TData, TValue>({
    header,
}: HeaderCellProps<TData, TValue>) {
    return (
        <div
            className={cn(
                'flex items-center gap-xs',
                'text-tertiary bv-text-font-sm-regular',
                header.column.getCanSort() ? 'cursor-pointer' : ''
            )}
        >
            {flexRender(header.column.columnDef.header, header.getContext())}
            <span className="text-base">
                {{
                    asc: (
                        <Icon icon="bv:chevron-up" style={{ flexShrink: 0 }} />
                    ),
                    desc: (
                        <Icon
                            icon="bv:chevron-down"
                            style={{ flexShrink: 0 }}
                        />
                    ),
                    none: (
                        <Icon
                            icon="bv:chevron-down"
                            style={{ flexShrink: 0 }}
                        />
                    ),
                }[header.column.getIsSorted() as string] ?? null}
            </span>
        </div>
    );
}
