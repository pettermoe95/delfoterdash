import { CellContent, DataTable } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { apiService } from '~/api/service';

export type AdminCustomGraphListing = {
    tenant_id: string;
    organization_name: string;
    graph_name: string;
    graph_type_id: number;
    graph_type_name: string;
    graph_query: unknown;
    template_id: number;
    template_name: string;
    template_graph_type_id: number;
    template_graph_type_name: string;
    template_graph_display: unknown;
    template_query: unknown;
};

const columnHelper = createColumnHelper<AdminCustomGraphListing>();

const columns = [
    columnHelper.accessor('graph_name', {
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
    columnHelper.accessor('organization_name', {
        header: 'Customer',
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
];

type SharedTemplatesTableProps = {
    onSelect: (template: AdminCustomGraphListing) => void;
};
export function CustomGraphsTable({ onSelect }: SharedTemplatesTableProps) {
    const { data: customGraphs } = useQuery<AdminCustomGraphListing[]>({
        queryKey: ['custom_graphs'] as const,
        queryFn: () =>
            apiService.getData<AdminCustomGraphListing[]>(
                '/v1/admin/library/custom_graphs'
            ),
    });
    return (
        <DataTable
            columns={columns}
            data={customGraphs ?? []}
            sortable
            rowConfig={{
                onClick: (row) => {
                    onSelect(row.original);
                },
            }}
        />
    );
}
