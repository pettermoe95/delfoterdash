import { createColumnHelper } from '@tanstack/react-table';
import type { UserItem } from '../../api/schema';
import { EditUserCell } from './EditUserCell';
import { UserNameCell } from './UserNameCell';
import { userNameSortingFn } from './userNameSortingFn';
import { UserRoleCell } from './UserRoleCell';

const columnHelper = createColumnHelper<UserItem>();

export function createUserColumns(localize: (key: string) => string) {
    return [
        columnHelper.accessor(
            (user) => `${user.first_name} ${user.last_name}`.trim(),
            {
                id: 'name',
                header: localize('users.user'),
                cell: UserNameCell,
                size: 250,
                sortingFn: userNameSortingFn,
            }
        ),
        columnHelper.accessor('roles', {
            header: localize('users.role'),
            cell: UserRoleCell,
            size: 250,
            enableSorting: false,
        }),
        columnHelper.accessor('id', {
            header: '',
            cell: EditUserCell,
            size: 20,
        }),
    ];
}
