import type { ColumnDef, ColumnSort, Row, Table } from '@tanstack/react-table';

export type DataTableProps<T> = {
    data: T[];
    // TanStack columns can have different accessor value types in one table.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
    noDataMessage?: string;
    defaultSorting?: ColumnSort;
    globalFilter?: ControlledState<string>;
    sortable?: boolean;
    rowConfig?: RowConfig<T>;
    stickyHeader?: boolean;
    localizeFn?: (key: string) => string;
} & MaybeVirtual;

export type BasicTableRenderProps<T> = Pick<
    DataTableProps<T>,
    'rowConfig' | 'isLoading' | 'noDataMessage' | 'stickyHeader' | 'localizeFn'
> & {
    table: Table<T>;
};

type MaybeVirtual =
    | {
          virtual: true;
          // In pixels
          height: number;
      }
    | {
          virtual?: false | undefined;
          height?: number;
      };

export type RowConfig<T> = {
    getRowBackground?: (row: Row<T>) => string | undefined;
    onClick?: (row: Row<T>) => void;
    onMouseEnter?: (row: Row<T>) => void;
    onMouseLeave?: (row: Row<T>) => void;
};

type ControlledState<T> = {
    state?: T;
    onChange?: (value: T) => void;
};
