import { HttpError } from '~/api/util/http';
import { useLocalize } from '~/i18n/I18nContext';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect } from 'react';
import type { UserItem } from '../../api/schema';
import { normalizeRoleIds } from './normalizeRoleIds';

type UpdateUserRolesFn = (args: {
    userId: number;
    roles: number[];
}) => Promise<unknown>;

type UseEditUserDialogHandlersParams = {
    isDialogOpen: boolean;
    onOpenDialogChange?: (open: boolean) => void;
    userData?: UserItem;
    resetUpdateMutation: () => void;
    updateUserRoles: UpdateUserRolesFn;
    selectedRoleIds: number[];
    setSelectedRoleIds: Dispatch<SetStateAction<number[]>>;
    setSubmitError: Dispatch<SetStateAction<string | null>>;
    onRolesUpdateSuccess?: () => void;
};

const getHttpErrorMessage = (error: HttpError): string | null => {
    const body = error.body;
    if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof body.message === 'string'
    ) {
        return body.message;
    }

    return null;
};

export function getInitialSelectedRoleIds(userData?: UserItem) {
    const normalizedRoles = normalizeRoleIds(userData?.roles);

    return normalizedRoles;
}

export function useEditUserDialogHandlers({
    isDialogOpen,
    onOpenDialogChange,
    userData,
    resetUpdateMutation,
    updateUserRoles,
    selectedRoleIds,
    setSelectedRoleIds,
    setSubmitError,
    onRolesUpdateSuccess,
}: UseEditUserDialogHandlersParams) {
    const localize = useLocalize();

    const handleOpenChange = useCallback(
        (open: boolean) => {
            onOpenDialogChange?.(open);
        },
        [onOpenDialogChange]
    );

    useEffect(() => {
        if (!isDialogOpen) {
            return;
        }

        setSelectedRoleIds(getInitialSelectedRoleIds(userData));
        setSubmitError(null);
        resetUpdateMutation();
    }, [
        isDialogOpen,
        resetUpdateMutation,
        setSelectedRoleIds,
        setSubmitError,
        userData,
    ]);

    const selectRole = useCallback(
        (roleId: number) => {
            setSelectedRoleIds((prev) => {
                if (prev.includes(roleId)) {
                    return prev.filter((id) => id !== roleId);
                }
                return [...prev, roleId];
            });
        },
        [setSelectedRoleIds]
    );

    const handleUpdateUserRoles = useCallback(async () => {
        if (!userData) {
            return;
        }

        try {
            setSubmitError(null);
            await updateUserRoles({
                userId: userData.id,
                roles: selectedRoleIds,
            });
            handleOpenChange(false);
            onRolesUpdateSuccess?.();
        } catch (error: unknown) {
            if (
                error instanceof HttpError &&
                error.status >= 400 &&
                error.status < 500
            ) {
                return setSubmitError(
                    getHttpErrorMessage(error) ??
                        localize('users.rolesUpdateFailed')
                );
            } else {
                console.error('Failed to update user roles', error);
                setSubmitError(localize('users.rolesUpdateFailed'));
            }
        }
    }, [
        handleOpenChange,
        localize,
        onRolesUpdateSuccess,
        selectedRoleIds,
        setSubmitError,
        updateUserRoles,
        userData,
    ]);

    return {
        handleOpenChange,
        selectRole,
        handleUpdateUserRoles,
    };
}
