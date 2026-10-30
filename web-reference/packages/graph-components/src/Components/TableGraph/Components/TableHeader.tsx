import { flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import type { BaseTableProps } from '../types';
import { getColumnAlign } from '../utils';
import styles from './TableHeader.module.scss';

type TableHeaderProps = {
    sticky?: boolean;
} & BaseTableProps;

export function TableHeader({ table, sticky }: TableHeaderProps) {
    return (
        <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                        const align = getColumnAlign(
                            header.column.columnDef.meta
                        );
                        const sortDirection = header.column.getIsSorted();
                        const ariaSort =
                            sortDirection === 'asc'
                                ? 'ascending'
                                : sortDirection === 'desc'
                                  ? 'descending'
                                  : 'none';

                        return (
                            <HeaderCell
                                key={header.id}
                                sticky={sticky}
                                isDomainColumn={idx === 0}
                                canSort={header.column.getCanSort()}
                                sortDirection={sortDirection}
                                ariaSort={ariaSort}
                                onSort={header.column.getToggleSortingHandler()}
                                align={align}
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                      )}
                            </HeaderCell>
                        );
                    })}
                </tr>
            ))}
        </thead>
    );
}

type HeaderCellProps = PropsWithChildren<{
    sticky?: boolean;
    canSort?: boolean;
    sortDirection?: false | 'asc' | 'desc';
    ariaSort?: 'none' | 'ascending' | 'descending';
    onSort?: (event: unknown) => void;
    align?: 'left' | 'right';
    isDomainColumn?: boolean;
}>;

function HeaderCell({
    children,
    sticky,
    canSort,
    sortDirection,
    ariaSort = 'none',
    onSort,
    align = 'right',
    isDomainColumn = false,
}: HeaderCellProps) {
    return (
        <th
            className={clsx(
                styles.headerCell,
                sticky && styles.sticky,
                canSort && styles.isSortable,
                isDomainColumn && styles.domainHeaderCell,
                align === 'left' ? styles.alignLeft : styles.alignRight
            )}
            aria-sort={canSort ? ariaSort : undefined}
        >
            <span
                className={clsx(
                    styles.headerContent,
                    align === 'left' ? styles.alignLeft : styles.alignRight
                )}
            >
                {canSort ? (
                    <button
                        type="button"
                        className={clsx(
                            styles.sortButton,
                            align === 'left'
                                ? styles.alignLeft
                                : styles.alignRight
                        )}
                        onClick={onSort}
                    >
                        {children}
                        <span className={styles.sortIndicator}>
                            {sortDirection === 'asc'
                                ? '↑'
                                : sortDirection === 'desc'
                                  ? '↓'
                                  : '↕'}
                        </span>
                    </button>
                ) : (
                    children
                )}
            </span>
        </th>
    );
}
