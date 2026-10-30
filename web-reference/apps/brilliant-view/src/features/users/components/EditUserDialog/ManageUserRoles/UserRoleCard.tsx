import { CheckIcon } from '~/assets/svg/Check';
import type { UserRoleItem } from '~/features/users/api/schema';
import { RoleIcon } from '../../RoleIcons/RoleIcons';

interface UserRoleCardProps {
    userRole: UserRoleItem;
    isSelected: boolean;
    onSelect: (roleId: number) => void;
    disabled?: boolean;
}

export function UserRoleCard({
    userRole,
    isSelected,
    onSelect,
    disabled = false,
}: UserRoleCardProps) {
    const handleClick = () => {
        if (disabled) return;
        onSelect(userRole.id);
    };
    const stateClasses = isSelected
        ? 'border-2 border-brand-primary-solid'
        : 'border border-primary';
    const cursorClass = disabled
        ? 'hover:cursor-not-allowed opacity-60'
        : 'hover:cursor-pointer';

    return (
        <div
            className={`${stateClasses} focus-visible:outline-brand-primary-solid mb-xl rounded-sm border p-3 transition-colors ${cursorClass} focus-visible:outline focus-visible:outline-2`}
        >
            <button
                type="button"
                onClick={handleClick}
                className="flex w-full items-center justify-between"
                aria-disabled={disabled}
                disabled={disabled}
                aria-pressed={isSelected}
            >
                <div className="flex items-center text-left">
                    <RoleIcon roleId={userRole.id} />
                    <div className="flex flex-col pl-3">
                        <p className="bv-text-font-md-medium">
                            {userRole.name}
                        </p>
                        <p className="bv-text-font-sm-regular">
                            {userRole.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col pl-3">
                    {isSelected && (
                        <CheckIcon
                            className="text-brand-tertiary"
                            height="38"
                            width="38"
                        />
                    )}
                </div>
            </button>
        </div>
    );
}
