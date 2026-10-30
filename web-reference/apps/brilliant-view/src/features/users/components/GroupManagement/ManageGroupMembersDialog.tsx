import {
    Button,
    ComboBox,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import type { GroupItem } from '~/features/users/api/schema.ts';
import {
    useAddGroupMember,
    useGroupMembers,
    useRemoveGroupMember,
} from '~/features/users/hooks/useGroups.tsx';
import { useUsersList } from '~/features/users/hooks/useUserList.tsx';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import { SearchInputBox } from '../SearchUsers/SearchInputBox.tsx';

export default function ManageGroupMembersDialog({
    group,
    open,
    onOpenChange,
}: {
    group: GroupItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const localize = useLocalize();
    const { displayToast } = useToastContext();
    const { data: users, isLoading: isUsersLoading } = useUsersList();
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    const { data: membersResponse, isLoading: isMembersLoading } =
        useGroupMembers(group?.id, open && group !== null);
    const addMemberMutation = useAddGroupMember();
    const removeMemberMutation = useRemoveGroupMember();
    const isManageableGroup = group !== null && !group.system_group;

    useEffect(() => {
        if (!open) {
            setMemberSearch('');
            setSelectedUserId('');
        }
    }, [open]);

    const members = (membersResponse?.members ?? []).sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
        )
    );
    const filteredMembers = useMemo(() => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return members;
        }

        return members.filter((member) =>
            `${member.first_name} ${member.last_name}`
                .toLowerCase()
                .includes(query)
        );
    }, [memberSearch, members]);

    const availableUsers = useMemo(() => {
        const memberIds = new Set(members.map((member) => member.id));
        return (users ?? []).filter((user) => !memberIds.has(user.id));
    }, [members, users]);
    const availableUserOptions = useMemo(
        () =>
            availableUsers.map((user) => ({
                value: String(user.id),
                label: `${user.first_name} ${user.last_name}`,
            })),
        [availableUsers]
    );

    const selectedAvailableUser = availableUsers.find(
        (user) => String(user.id) === selectedUserId
    );

    const handleAddMember = async () => {
        if (!isManageableGroup || !selectedAvailableUser) {
            return;
        }

        try {
            await addMemberMutation.mutateAsync({
                groupId: group.id,
                userId: selectedAvailableUser.id,
            });
            setSelectedUserId('');
        } catch (error) {
            displayToast({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : localize('genericError'),
            });
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!isManageableGroup) {
            return;
        }

        try {
            await removeMemberMutation.mutateAsync({
                groupId: group.id,
                userId,
            });
        } catch (error) {
            displayToast({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : localize('genericError'),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-[720px] overflow-visible lg:min-w-0 xl:left-1/2">
                <DialogHeader>
                    <DialogTitle>
                        {localize('users.manageGroupMembers')}
                    </DialogTitle>
                </DialogHeader>

                {!isManageableGroup ? (
                    <p className="text-sm text-secondary">
                        {localize('users.groupUnavailable')}
                    </p>
                ) : (
                    <div className="flex max-h-[60vh] flex-col gap-lg overflow-hidden">
                        <div className="grid gap-sm lg:grid-cols-[minmax(0,1fr)_auto]">
                            <ComboBox
                                placeholder={localize('users.selectUserToAdd')}
                                options={availableUserOptions}
                                value={selectedUserId}
                                onChange={(value) =>
                                    setSelectedUserId(
                                        Array.isArray(value)
                                            ? (value[0] ?? '')
                                            : value
                                    )
                                }
                                disabled={
                                    isUsersLoading ||
                                    availableUsers.length === 0
                                }
                                localizeFn={localize}
                                portalled={false}
                            />
                            <Button
                                type="button"
                                size="sm"
                                disabled={!selectedAvailableUser}
                                isLoading={addMemberMutation.isPending}
                                onClick={() => void handleAddMember()}
                            >
                                {localize('users.addToGroup')}
                            </Button>
                        </div>

                        <SearchInputBox
                            search={memberSearch}
                            setSearch={setMemberSearch}
                        />

                        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-primary">
                            {isMembersLoading ? (
                                <div className="p-lg text-secondary">
                                    {localize('miscTerms.loading')}
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="p-lg text-secondary">
                                    {localize('users.noGroupMembers')}
                                </div>
                            ) : (
                                <div className="divide-y divide-primary">
                                    {filteredMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-md px-lg py-md"
                                        >
                                            <span className="font-medium text-primary">
                                                {member.first_name}{' '}
                                                {member.last_name}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                color="gray"
                                                size="sm"
                                                isLoading={
                                                    removeMemberMutation.isPending
                                                }
                                                onClick={() =>
                                                    void handleRemoveMember(
                                                        member.id
                                                    )
                                                }
                                            >
                                                {localize(
                                                    'users.removeFromGroup'
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-end">
                    <Button
                        type="button"
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        {localize('miscTerms.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
