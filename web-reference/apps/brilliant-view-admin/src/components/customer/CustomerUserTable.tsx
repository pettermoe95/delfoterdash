import { Button } from '@brilliant/bds-core';
import type { Account, AccountPermission } from '@bv/api';
import { CellContent, DataTable } from '@bv/ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { generatePath } from 'react-router-dom';
import { apiService } from '../../api/service';

type CustomerUser = Account & {
    permissions?: AccountPermission[];
    canSetUserRoles?: boolean;
    canCreateConnectors?: boolean;
    canCreateDashboards?: boolean;
    canEditDashboards?: boolean;
};

const columnHelper = createColumnHelper<CustomerUser>();

function isAdminUser({
    permissions,
    canSetUserRoles,
    canCreateConnectors,
    canCreateDashboards,
    canEditDashboards,
}: CustomerUser): boolean {
    const permissionNames = new Set(
        (permissions ?? []).map((permission) => permission.name)
    );
    const hasPermission = (permission: string) =>
        permissionNames.has(permission);
    const effectiveCanSetUserRoles =
        canSetUserRoles ?? hasPermission('users.roles.set');
    const effectiveCanCreateConnectors =
        canCreateConnectors ?? hasPermission('connectors.create');
    const effectiveCanCreateDashboards =
        canCreateDashboards ?? hasPermission('dashboards.create');
    const effectiveCanEditDashboards =
        canEditDashboards ?? hasPermission('dashboards.edit');

    return (
        effectiveCanSetUserRoles &&
        effectiveCanCreateConnectors &&
        effectiveCanCreateDashboards &&
        effectiveCanEditDashboards
    );
}

const columns = (
    actionMutation: UseMutationResult<unknown, unknown, number, unknown>
) => [
    columnHelper.accessor('id', {
        header: 'ID',
        maxSize: 30,
    }),
    columnHelper.accessor('picture_url', {
        header: 'Picture',
        size: 30,
        cell: (cell) => {
            const url = cell.getValue();
            if (url != null) {
                return (
                    <CellContent>
                        <img
                            src={url}
                            className="h-8 w-8 rounded-full border border-gray-300"
                        />
                    </CellContent>
                );
            }
            return <CellContent>-</CellContent>;
        },
    }),
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
        header: 'Name',
        cell: (cell) => {
            const isAdmin = isAdminUser(cell.row.original);
            return (
                <CellContent className={isAdmin ? 'font-bold' : ''}>
                    {cell.getValue() ?? '-'}
                </CellContent>
            );
        },
    }),
    columnHelper.accessor('email', {
        header: 'Email',
    }),
    columnHelper.accessor('phone_number', {
        header: 'Phone Number',
        cell: (cell) => {
            return <CellContent>{cell.getValue() ?? '-'}</CellContent>;
        },
    }),
    columnHelper.display({
        id: 'admin',
        header: 'Admin',
        maxSize: 40,
        cell: (cell) => {
            const isAdmin = isAdminUser(cell.row.original);
            return (
                <CellContent className="font-bold">
                    {isAdmin ? 'Yes' : '-'}
                </CellContent>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        maxSize: 80,
        cell: (cell) => {
            const user = cell.row.original;

            return (
                <CellContent>
                    <Button
                        size="sm"
                        isLoading={
                            actionMutation.isPending &&
                            actionMutation.variables === user.id
                        }
                        onClick={() => actionMutation.mutate(user.id)}
                    >
                        Impersonate
                    </Button>
                </CellContent>
            );
        },
    }),
];

export function CustomerUserTable({ tenantId }: { tenantId: string }) {
    function redirectFromAdmin() {
        const { protocol, hostname, port } = window.location;

        if (hostname === 'localhost') {
            if (port === '7576') {
                window.location.href = `${protocol}//localhost:7575`;
            }
            return;
        }

        if (!hostname.startsWith('admin.')) {
            return;
        }

        let targetHost: string | null = null;

        switch (hostname) {
            case 'admin.brilliantview.no':
                targetHost = 'app.brilliantview.no';
                break;
            case 'admin.dev.brilliantview.no':
                targetHost = 'dev.brilliantview.no';
                break;
            case 'admin.test.brilliantview.no':
                targetHost = 'test.brilliantview.no';
                break;
            default:
                return; // unknown admin host, do nothing
        }

        window.location.href = `${protocol}//${targetHost}`;
    }
    const { data } = useQuery<Account[]>({
        queryKey: ['customer_users', tenantId] as const,
        queryFn: () =>
            apiService.getData<Account[]>(
                generatePath('/v1/admin/customers/:tenantId/users', {
                    tenantId,
                })
            ),
    });
    const actionMutation = useMutation({
        mutationFn: async (userId: number) => {
            return apiService.postData('/v1/admin/impersonate_user', {
                user_id: userId,
            });
        },
        onSuccess: (_data, _userId, _context) => {
            redirectFromAdmin();
        },
    });
    return (
        <DataTable
            columns={columns(actionMutation)}
            data={data ?? []}
            sortable
            stickyHeader
            defaultSorting={{ id: 'id', desc: false }}
        />
    );
}
