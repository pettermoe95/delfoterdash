import { CellContent, DataTable } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import type { TenantCustomer } from '~/api/customers';
import { NewCustomerDialog } from '~/components/customer/NewCustomerDialog';
import { generatePath, useNavigate } from 'react-router-dom';
import { apiService } from '../../api/service';
import { AdminPageLayout } from '../../layout/AdminPageLayout';
import { APP_ROUTES } from '../../routes/routes';

const columnHelper = createColumnHelper<TenantCustomer>();

const columns = [
    columnHelper.accessor('organization_name', {
        header: 'Name',
        cell: (cell) => {
            return (
                <CellContent hierarchy="primary">{cell.getValue()}</CellContent>
            );
        },
    }),
    columnHelper.accessor('organization_number', {
        header: 'Organization Number',
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('dashboard_count', {
        header: 'Dashboards',
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('graph_count', {
        header: 'Graphs',
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('user_count', {
        header: 'Users',
        cell: (cell) => {
            return <CellContent>{cell.getValue()}</CellContent>;
        },
    }),
    columnHelper.accessor('tenant_id', {
        header: 'Tenant ID',
        cell: (cell) => {
            return (
                <CellContent className="text-xs">{cell.getValue()}</CellContent>
            );
        },
    }),
];

export function CustomersPage() {
    const { data } = useQuery<TenantCustomer[]>({
        queryKey: ['customers'] as const,
        queryFn: () =>
            apiService.getData<TenantCustomer[]>('/v1/admin/customers'),
    });
    const navigate = useNavigate();
    return (
        <AdminPageLayout title="Customers" actions={<NewCustomerDialog />}>
            <DataTable
                columns={columns}
                data={data ?? []}
                rowConfig={{
                    onClick: (row) => {
                        navigate(
                            generatePath(APP_ROUTES.customer_details, {
                                tenantId: row.original.tenant_id,
                            })
                        );
                    },
                }}
            />
        </AdminPageLayout>
    );
}
