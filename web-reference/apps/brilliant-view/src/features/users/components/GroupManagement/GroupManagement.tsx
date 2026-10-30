import { Button, IconButton } from '@brilliant/bds-core';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import type { GroupItem } from '../../api/schema';
import { useGroupsList } from '../../hooks/useGroups';
import { SearchInputBox } from '../SearchUsers/SearchInputBox';
import TableFooter from '../TableFooter.tsx';
import CreateGroupDialog from './CreateGroupDialog.tsx';
import DeleteGroupDialog from './DeleteGroupDialog.tsx';
import ManageGroupMembersDialog from './ManageGroupMembersDialog.tsx';
import RenameGroupDialog from './RenameGroupDialog.tsx';

export function GroupManagement() {
    const localize = useLocalize();
    const { hasPermission } = useAccount();
    const canManageGroups = hasPermission(PERMISSION.GROUPS_WRITE);
    const canManageMembers = hasPermission(PERMISSION.GROUPS_MEMBERS_WRITE);

    const { data: groupsResponse, isLoading: isGroupsLoading } = useGroupsList(
        hasPermission(PERMISSION.GROUPS_READ)
    );

    const groups = useMemo(
        () =>
            (groupsResponse?.groups ?? []).filter(
                (group) => !group.system_group
            ),
        [groupsResponse?.groups]
    );

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [manageUsersDialogOpen, setManageUsersDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
    const [search, setSearch] = useState('');

    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return groups;
        }

        return groups.filter((group) =>
            group.name.toLowerCase().includes(query)
        );
    }, [groups, search]).sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        if (!selectedGroup) {
            return;
        }

        const stillManageable = groups.some(
            (group) => group.id === selectedGroup.id && !group.system_group
        );

        if (!stillManageable) {
            setSelectedGroup(null);
            setRenameDialogOpen(false);
            setManageUsersDialogOpen(false);
            setDeleteDialogOpen(false);
        }
    }, [groups, selectedGroup]);

    if (!canManageGroups) {
        return <p>{localize('users.noAccess')}</p>;
    }

    return (
        <>
            <div className="flex flex-col gap-lg pb-10">
                <div className="flex items-center justify-between gap-md">
                    <SearchInputBox
                        search={search}
                        setSearch={setSearch}
                        placeholder={localize('users.searchGroups')}
                    />
                    <Button
                        type="button"
                        size="sm"
                        leftIcon="bv:plus"
                        onClick={() => setCreateDialogOpen(true)}
                        style={{}}
                    >
                        {localize('users.createGroup')}
                    </Button>
                </div>
                <div>
                    {isGroupsLoading && (
                        <>
                            <div className="p-lg text-secondary">
                                {localize('miscTerms.loading')}
                            </div>
                        </>
                    )}
                    {filteredGroups.length === 0 && (
                        <div className="p-lg text-secondary">
                            {localize('users.noGroupsFound')}
                        </div>
                    )}
                    {filteredGroups.map((group) => (
                        <div
                            key={group.id}
                            className={`flex items-center justify-between gap-md border-b border-secondary px-lg py-md`}
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium text-primary">
                                    {group.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-xs">
                                <IconButton
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    color="gray"
                                    icon="bv:pen"
                                    aria-label={localize('users.renameGroup')}
                                    disabled={group.system_group}
                                    onClick={() => {
                                        setSelectedGroup(group);
                                        setRenameDialogOpen(true);
                                    }}
                                />
                                <IconButton
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    color="gray"
                                    icon="bv:users"
                                    aria-label={localize(
                                        'users.manageGroupMembers'
                                    )}
                                    disabled={
                                        group.system_group || !canManageMembers
                                    }
                                    onClick={() => {
                                        setSelectedGroup(group);
                                        setManageUsersDialogOpen(true);
                                    }}
                                />
                                <IconButton
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    color="gray"
                                    icon="bv:trash"
                                    aria-label={localize('miscTerms.delete')}
                                    disabled={group.system_group}
                                    onClick={() => {
                                        setSelectedGroup(group);
                                        setDeleteDialogOpen(true);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <TableFooter>
                    {groups.length}{' '}
                    {groups.length == 1
                        ? localize('users.group')
                        : localize('users.groups')}
                </TableFooter>
            </div>

            <CreateGroupDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
            <RenameGroupDialog
                group={selectedGroup}
                open={renameDialogOpen}
                onOpenChange={setRenameDialogOpen}
            />
            <ManageGroupMembersDialog
                group={selectedGroup}
                open={manageUsersDialogOpen}
                onOpenChange={setManageUsersDialogOpen}
            />
            <DeleteGroupDialog
                group={selectedGroup}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </>
    );
}
