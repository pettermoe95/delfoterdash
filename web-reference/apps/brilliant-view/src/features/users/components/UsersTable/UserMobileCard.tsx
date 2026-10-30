import { Avatar } from '@brilliant/bds-core';
import type { UserItem } from '../../api/schema';
import { normalizeRoleIds } from '../EditUserDialog/normalizeRoleIds';
import { RoleIcon } from '../RoleIcons/RoleIcons';

type UserMobileCardProps = {
    user: UserItem;
};

export function UserMobileCard({ user }: UserMobileCardProps) {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const email = user.email.toLocaleLowerCase();
    const roleIds = normalizeRoleIds(user.roles);

    return (
        <div className="rounded-sm border border-primary bg-primary p-xl text-left hover:bg-primary-hover">
            <div className="flex gap-4">
                <Avatar
                    name={fullName || email}
                    src={user.picture_url}
                    size="md"
                />
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="bv-text-font-md-medium">
                                {fullName || email}
                            </p>
                            <a
                                href={`mailto:${email}`}
                                className="text-brand bv-text-font-sm-regular"
                            >
                                Contact {user.first_name}
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {roleIds.map((roleId) => (
                        <RoleIcon
                            key={`${user.id}-${roleId}`}
                            roleId={roleId}
                            size="sm"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
