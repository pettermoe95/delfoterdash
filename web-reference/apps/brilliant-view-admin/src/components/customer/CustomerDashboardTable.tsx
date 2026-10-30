import type { Dashboard } from '@bv/api';
import {
    CellContent,
    DashboardIcon,
    DataTable,
    getRelativeHumanDate,
    parseDashboardColor,
    parseDashboardIconName,
} from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { generatePath } from 'react-router-dom';
import { apiService } from '../../api/service';

const columnHelper = createColumnHelper<Dashboard>();

const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
        maxSize: 30,
    }),
    columnHelper.accessor('color', {
        header: '',
        size: 40,
        cell: (cell) => {
            const color = cell.getValue();
            if (color == null) {
                return <CellContent>none</CellContent>;
            }
            return (
                <CellContent>
                    <DashboardIcon
                        color={parseDashboardColor(color)}
                        icon={parseDashboardIconName(cell.row.original.icon)}
                        size="md"
                    />
                </CellContent>
            );
        },
    }),

    columnHelper.accessor('name', {
        header: 'Name',
    }),
    columnHelper.accessor('layout_count', {
        header: 'Layouts',
    }),
    columnHelper.accessor('updated_at', {
        header: 'Last Updated',
        cell: (cell) => {
            return (
                <CellContent>
                    {getRelativeHumanDate(cell.getValue())}
                </CellContent>
            );
        },
    }),
    columnHelper.accessor('layout_updated_at', {
        header: 'Layout Changed',
        cell: (cell) => {
            const value = cell.getValue();
            if (value == null) {
                return <CellContent>Never</CellContent>;
            }
            return <CellContent>{getRelativeHumanDate(value)}</CellContent>;
        },
    }),
];

export function CustomerDashboardsTable({ tenantId }: { tenantId: string }) {
    const { data } = useQuery<Dashboard[]>({
        queryKey: ['customer_dashboards', tenantId] as const,
        queryFn: () =>
            apiService.getData<Dashboard[]>(
                generatePath('/v1/admin/customers/:tenantId/dashboards', {
                    tenantId,
                })
            ),
    });
    return (
        <DataTable
            columns={columns}
            data={data ?? []}
            sortable
            stickyHeader
            defaultSorting={{ id: 'updated_at', desc: true }}
        />
    );
}
