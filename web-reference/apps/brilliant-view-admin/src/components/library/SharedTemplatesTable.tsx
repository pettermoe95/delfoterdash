import { CellContent, DataTable } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { apiService } from '../../api/service';
import type { AdminTemplateListing } from './sharedTemplateTypes';

const columnHelper = createColumnHelper<AdminTemplateListing>();

const columns = [
    columnHelper.accessor('template_id', {
        header: 'ID',
        size: 14,
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('template_name', {
        header: 'Name',
        cell: (cell) => {
            return (
                <CellContent className="font-bold">
                    {cell.getValue()}
                </CellContent>
            );
        },
    }),
    columnHelper.accessor('graph_type_name', {
        header: 'Type',
        cell: (cell) => {
            return (
                <CellContent className="capitalize">
                    {cell.getValue()}
                </CellContent>
            );
        },
    }),
    columnHelper.accessor('total_uses', {
        header: 'Uses',
        size: 50,
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('total_customers', {
        header: 'Tenants',
        size: 50,
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('template_status', {
        header: 'Status',
        size: 50,
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
];

type SharedTemplatesTableProps = {
    onSelect: (template: AdminTemplateListing) => void;
};
export function SharedTemplatesTable({ onSelect }: SharedTemplatesTableProps) {
    const { data: templates } = useQuery<AdminTemplateListing[]>({
        queryKey: ['library_templates'] as const,
        queryFn: () =>
            apiService.getData<AdminTemplateListing[]>(
                '/v1/admin/library/templates'
            ),
    });
    return (
        <DataTable
            columns={columns}
            data={templates ?? []}
            sortable
            rowConfig={{
                onClick: (row) => {
                    onSelect(row.original);
                },
            }}
            defaultSorting={{ id: 'total_uses', desc: true }}
        />
    );
}
