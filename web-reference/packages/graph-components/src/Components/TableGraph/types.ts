import type { Row, Table } from '@tanstack/react-table';

export type DynamicData = { id: string } & Record<string, string | number>;

export type BaseTableProps = {
    table: Table<DynamicData>;
};

export type BaseRowProps = {
    row: Row<DynamicData>;
};
