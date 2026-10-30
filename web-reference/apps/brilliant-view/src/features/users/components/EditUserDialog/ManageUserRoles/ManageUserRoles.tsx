import type { UserRoleItem } from '~/features/users/api/schema';
import { UserRoleCard } from './UserRoleCard';

interface ManageUserRolesProps {
    userRoleOptions: UserRoleItem[];
    selectedRoleIds: number[];
    onSelectRole: (roleId: number) => void;
    selectionDisabled?: boolean;
}

export function ManageUserRoles({
    userRoleOptions,
    selectedRoleIds,
    onSelectRole,
    selectionDisabled,
}: ManageUserRolesProps) {
    const sortedRoleOptions = [...userRoleOptions].sort((roleA, roleB) =>
        roleA.name.localeCompare(roleB.name, undefined, {
            sensitivity: 'base',
        })
    );

    return (
        <div className="flex flex-col gap-sm">
            {sortedRoleOptions.map((userRole) => (
                <UserRoleCard
                    userRole={userRole}
                    key={userRole.id}
                    isSelected={selectedRoleIds.includes(userRole.id)}
                    onSelect={onSelectRole}
                    disabled={selectionDisabled}
                />
            ))}
        </div>
    );
}
