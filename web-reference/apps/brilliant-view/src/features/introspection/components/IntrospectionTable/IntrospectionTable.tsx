import { DataTable } from '@bv/ui';
import { useDatabaseIntrospection } from '~/features/introspection/hooks/useDatabaseIntrospection';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo, useState } from 'react';
import type { IntrospectionTableItem } from './columns';
import { buildIntrospectionTableColumns } from './columns';

export function IntrospectionTable() {
    const localize = useLocalize();
    const { data: tableData } = useDatabaseIntrospection();
    const [openTables, setOpenTables] = useState<Set<number>>(new Set());
    const rows: IntrospectionTableItem[] = (tableData ?? []).map(
        (table, index) => ({
            id: index + 1,
            name: table.name,
            schema: table.schema,
            columns: table.columns
                .map((column) => ({
                    name: column.name,
                    dataType: column.data_type,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        })
    );
    const columns = useMemo(
        () =>
            buildIntrospectionTableColumns({
                isOpen: (id) => openTables.has(id),
                onToggle: (id) =>
                    setOpenTables((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) {
                            next.delete(id);
                        } else {
                            next.add(id);
                        }
                        return next;
                    }),
                localize,
            }),
        [openTables, localize]
    );

    return (
        <div className="flex flex-col pt-5">
            <div className="flex items-center justify-between">
                <h2 className="text-secondary bv-text-font-xl-medium">
                    {localize('introspection.table.tables')}
                </h2>
            </div>
            <DataTable
                data={rows}
                columns={columns}
                defaultSorting={{ id: 'name', desc: false }}
                noDataMessage={localize('introspection.table.noDataMessage')}
                sortable
            />
        </div>
    );
}
