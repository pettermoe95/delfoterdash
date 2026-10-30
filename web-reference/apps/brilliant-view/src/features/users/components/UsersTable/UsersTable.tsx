import { DataTable } from '@bv/ui';
import TableFooter from '~/features/users/components/TableFooter.tsx';
import { useUsersList } from '~/features/users/hooks/useUserList.tsx';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo, useState } from 'react';
import { SearchInputBox } from '../SearchUsers/SearchInputBox';
import { createUserColumns } from './columns';
import { UserMobileCard } from './UserMobileCard';
import { compareUsersByName } from './userNameSortingFn';

export function UsersTable() {
    const { data: userData, isLoading } = useUsersList();
    const [search, setSearch] = useState<string>('');

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return userData ?? [];
        return (userData ?? []).filter((user) => {
            const first = user.first_name?.toLowerCase() ?? '';
            const last = user.last_name?.toLowerCase() ?? '';
            const full = `${first} ${last}`.trim();
            return (
                first.includes(query) ||
                last.includes(query) ||
                full.includes(query)
            );
        });
    }, [userData, search]);

    const sortedMobileUsers = useMemo(() => {
        return [...filteredUsers].sort(compareUsersByName);
    }, [filteredUsers]);

    const localize = useLocalize();

    return (
        <>
            <div className="flex flex-col gap-lg pb-10 lg:hidden">
                <SearchInputBox search={search} setSearch={setSearch} />
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {sortedMobileUsers.map((user) => (
                            <UserMobileCard key={user.id} user={user} />
                        ))}
                    </div>
                ) : (
                    <p className="text-secondary">
                        {isLoading
                            ? localize('users.usersLoading')
                            : localize('users.usersNotFound')}
                    </p>
                )}
            </div>
            <div className="hidden flex-col lg:flex">
                <SearchInputBox search={search} setSearch={setSearch} />
                <div className="max-h-[calc(100dvh-(theme(spacing.80)-32px))] overflow-auto">
                    <DataTable
                        data={filteredUsers}
                        columns={createUserColumns(localize)}
                        isLoading={isLoading}
                        sortable
                        defaultSorting={{ id: 'name', desc: false }}
                        localizeFn={localize}
                    />
                </div>
                <TableFooter>
                    {userData?.length ?? '...'}{' '}
                    {userData?.length == 1
                        ? localize('users.user')
                        : localize('users.users')}
                </TableFooter>
            </div>
        </>
    );
}
