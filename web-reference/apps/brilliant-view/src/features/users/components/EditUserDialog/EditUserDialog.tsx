import {
    Avatar,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import { CheckIcon } from '~/assets/svg/Check';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import type { UserItem } from '../../api/schema';
import { useUpdateUserRoles, useUserRoles } from '../../hooks/useUserRoles';
import {
    getInitialSelectedRoleIds,
    useEditUserDialogHandlers,
} from './editUserDialogHandlers';
import { ManageUserRoles } from './ManageUserRoles/ManageUserRoles';

type EditUserDialogProps = {
    isDialogOpen: boolean;
    onOpenDialogChange?: (open: boolean) => void;
    userData?: UserItem;
};

export function EditUserDialog({
    isDialogOpen,
    onOpenDialogChange,
    userData,
}: EditUserDialogProps) {
    const { hasPermission } = useAccount();
    const { data: userRoles } = useUserRoles();
    const { displayToast } = useToastContext();
    const localize = useLocalize();
    const { mutateAsync: updateUserRoles, reset: resetUpdateMutation } =
        useUpdateUserRoles();
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(() =>
        getInitialSelectedRoleIds(userData)
    );
    const [submitError, setSubmitError] = useState<string | null>(null);

    const initialRoleIds = getInitialSelectedRoleIds(userData);
    const hasRoleChanges =
        selectedRoleIds.length !== initialRoleIds.length ||
        !selectedRoleIds.every((id) => initialRoleIds.includes(id));

    const { handleOpenChange, selectRole, handleUpdateUserRoles } =
        useEditUserDialogHandlers({
            isDialogOpen,
            onOpenDialogChange,
            userData,
            resetUpdateMutation,
            updateUserRoles,
            selectedRoleIds,
            setSelectedRoleIds,
            setSubmitError,
            onRolesUpdateSuccess: () =>
                displayToast({
                    type: 'success',
                    text: localize('users.rolesSuccessfullyUpdated'),
                }),
        });

    const userName = `${userData?.first_name} ${userData?.last_name}`;
    const userEmail = `${userData?.email.toLocaleLowerCase()}`;
    const cannotViewRolesMessage = localize('users.noPermissionToAdminRoles');

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onOpenChange={handleOpenChange}
                modal={true}
            >
                {userData && (
                    <DialogContent
                        className="max-w-[320px] text-primary lg:max-w-screen-sm"
                        aria-describedby={undefined}
                    >
                        <DialogHeader className="border-b border-primary pb-4">
                            <div className="flex items-center gap-sm">
                                <Avatar
                                    name={userName}
                                    src={userData.picture_url}
                                    size="lg"
                                />
                                <div className="ml-2">
                                    <DialogTitle>{userName}</DialogTitle>
                                    <p className="text-tertiary bv-text-font-sm-regular">
                                        {userEmail}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="flex flex-col gap-sm">
                            <div className="flex items-center gap-sm">
                                <p className="bv-text-font-lg-medium">
                                    {localize('users.userRoles')}
                                </p>
                            </div>
                            {!hasPermission(PERMISSION.USERS_READ) ? (
                                <p className="text-tertiary bv-text-font-sm-regular">
                                    {cannotViewRolesMessage}
                                </p>
                            ) : (
                                userRoles && (
                                    <ManageUserRoles
                                        userRoleOptions={userRoles}
                                        selectedRoleIds={selectedRoleIds}
                                        onSelectRole={selectRole}
                                        selectionDisabled={
                                            !hasPermission(
                                                PERMISSION.USERS_SET_ROLES
                                            )
                                        }
                                    />
                                )
                            )}
                            {submitError && (
                                <p className="text-error-primary bv-text-font-sm-regular">
                                    {submitError}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-primary pt-4xl">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="filled"
                                size="sm"
                                onClick={() => {
                                    if (
                                        !hasPermission(
                                            PERMISSION.USERS_SET_ROLES
                                        )
                                    )
                                        return;
                                    void handleUpdateUserRoles();
                                }}
                                disabled={
                                    !hasPermission(
                                        PERMISSION.USERS_SET_ROLES
                                    ) || !hasRoleChanges
                                }
                            >
                                <CheckIcon stroke="white" />
                                Confirm changes
                            </Button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}
