import { Tooltip } from '@brilliant/bds-core';
import type { CellContext } from '@tanstack/react-table';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import type { UserItem } from '../../api/schema';
import { useUserRoles } from '../../hooks/useUserRoles';
import { EditUserDialog } from '../EditUserDialog/EditUserDialog';
import { normalizeRoleIds } from '../EditUserDialog/normalizeRoleIds';
import { RoleIcon } from '../RoleIcons/RoleIcons';

export function UserRoleCell<T extends UserItem>(
    cell: CellContext<T, number[]>
) {
    const { hasPermission } = useAccount();
    const localize = useLocalize();
    const { data: availableRoles = [] } = useUserRoles();
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const userData = cell.row.original as UserItem;
    const roleNamesById = new Map(
        availableRoles.map((role) => [role.id, role.name])
    );
    const roles = normalizeRoleIds(cell.getValue())
        .map((roleId) => ({
            id: roleId,
            name:
                roleNamesById.get(roleId) ??
                localize('users.roleFallback', { id: roleId }),
        }))
        .sort((roleA, roleB) =>
            roleA.name.localeCompare(roleB.name, undefined, {
                sensitivity: 'base',
            })
        );

    const canOpenDialog =
        hasPermission(PERMISSION.USERS_ROLES_READ) &&
        hasPermission(PERMISSION.USERS_SET_ROLES);
    const roleNames = roles.map((role) => role.name);

    return (
        <div>
            <button
                type="button"
                className={`${canOpenDialog ? 'hover:cursor-pointer' : 'hover:cursor-default'} flex items-center gap-2`}
                onClick={() => setIsUserDialogOpen(true)}
                disabled={!canOpenDialog}
                aria-label={localize('users.rolesLabel', {
                    roles: roleNames.join(', ') || localize('users.noRoles'),
                })}
            >
                {roles.map((role) => (
                    <Tooltip
                        key={`${userData.id}-${role.id}`}
                        title={role.name}
                        side="top"
                    >
                        <span className="inline-flex">
                            <RoleIcon roleId={role.id} size="sm" />
                        </span>
                    </Tooltip>
                ))}
            </button>
            <EditUserDialog
                userData={userData}
                isDialogOpen={isUserDialogOpen}
                onOpenDialogChange={setIsUserDialogOpen}
            />
        </div>
    );
}
