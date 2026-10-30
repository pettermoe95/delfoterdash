import { Icon } from '@brilliant/bds-core';
import { createColumnHelper } from '@tanstack/react-table';

type TableColumn = {
    name: string;
    dataType: string;
};

export type IntrospectionTableItem = {
    id: number;
    name: string;
    schema: string;
    columns: TableColumn[];
};

type ColumnOptions = {
    isOpen: (id: number) => boolean;
    onToggle: (id: number) => void;
    localize: (key: string) => string;
};

const columnHelper = createColumnHelper<IntrospectionTableItem>();

export const buildIntrospectionTableColumns = ({
    isOpen,
    onToggle,
    localize,
}: ColumnOptions) => [
    columnHelper.accessor('name', {
        header: localize('introspection.table.tableName'),
        cell: (cell) => {
            const row = cell.row.original;
            const open = isOpen(row.id);
            return (
                <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-sm text-left hover:cursor-pointer"
                            onClick={() => onToggle(row.id)}
                        >
                            <Icon
                                icon={
                                    open
                                        ? 'bv:chevron-down'
                                        : 'bv:chevron-right'
                                }
                            />
                            <Icon icon="bv:table" />
                            <span className="text-secondary bv-text-font-sm-regular">
                                {row.name}
                            </span>
                        </button>
                        {open && (
                            <div className="flex flex-row items-center gap-md">
                                <span className="pr-md text-secondary bv-text-font-sm-regular">
                                    {localize('introspection.table.type')}
                                </span>
                            </div>
                        )}
                    </div>
                    {open && (
                        <div className="ml-xl flex max-w-full flex-col gap-xs">
                            {row.columns.length ? (
                                row.columns.map((column) => (
                                    <div
                                        key={column.name}
                                        className="flex items-center justify-between gap-sm rounded px-md py-sm text-secondary bv-text-font-sm-regular hover:cursor-default hover:bg-secondary"
                                    >
                                        <div className="flex flex-row items-center gap-sm">
                                            <Icon icon="mdi:table-column" />
                                            <span className="text-secondary bv-text-font-sm-regular">
                                                {column.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="flex items-center gap-xs text-sm text-tertiary bv-text-font-sm-regular">
                                                {column.dataType.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-tertiary">
                                    {localize(
                                        'introspection.table.noColumnsFound'
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            );
        },
    }),
];
