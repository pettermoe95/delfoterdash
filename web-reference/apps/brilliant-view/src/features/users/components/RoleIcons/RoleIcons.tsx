import type { BVIconName } from '@brilliant/bds-core';
import { Icon } from '@brilliant/bds-core';
import { AdminUser } from '~/assets/svg/Admin';
import { ViewerUser } from '~/assets/svg/Viewer';
import { useActiveTheme } from '~/stores/system';

type Size = 'xs' | 'sm' | 'md';

function sizeToBox(size: Size) {
    switch (size) {
        case 'xs':
            return 'h-6 w-6'; // 24px
        case 'sm':
            return 'h-8 w-8'; // 32px
        case 'md':
        default:
            return 'h-10 w-10'; // 40px
    }
}

function sizeToIcon(size: Size): { width: number; height: number } {
    switch (size) {
        case 'xs':
            return { width: 16, height: 16 };
        case 'sm':
            return { width: 24, height: 24 };
        case 'md':
        default:
            return { width: 32, height: 32 };
    }
}

type RoleIconProps = {
    roleId: number;
    size?: Size;
    className?: string;
};

type BaseRoleIconProps = {
    size: Size;
    className?: string;
};

type TemplateRoleIconProps = BaseRoleIconProps & {
    iconName: BVIconName;
    colorClasses: string;
};

function TemplateRoleIcon({
    iconName,
    colorClasses,
    size,
    className,
}: TemplateRoleIconProps) {
    const box = sizeToBox(size);
    const icon = sizeToIcon(size);

    return (
        <div
            className={`flex items-center justify-center rounded-xs ${colorClasses} ${box} ${className ?? ''}`}
        >
            <Icon
                icon={`bv:${iconName}`}
                width={icon.width}
                height={icon.height}
            />
        </div>
    );
}

function AdminUserIcon({ size, className }: BaseRoleIconProps) {
    const userTheme = useActiveTheme();
    const box = sizeToBox(size);
    const icon = sizeToIcon(size);

    return (
        <div
            className={`flex items-center justify-center rounded-xs bg-brand-secondary-alt ${box} ${className ?? ''}`}
        >
            <AdminUser
                width={icon.width}
                height={icon.height}
                fill={userTheme === 'light' ? '#8D39EE' : '#EFE9FE'}
            />
        </div>
    );
}

function ViewerUserIcon({ size, className }: BaseRoleIconProps) {
    const box = sizeToBox(size);
    const icon = sizeToIcon(size);

    return (
        <div
            className={`flex items-center justify-center rounded-xs bg-primary-brand-100 ${box} ${className ?? ''}`}
        >
            <ViewerUser width={icon.width} height={icon.height} />
        </div>
    );
}

function ConceptEditorUserIcon(props: BaseRoleIconProps) {
    return (
        <TemplateRoleIcon
            iconName="workflow"
            colorClasses="bg-primary-success-100 text-primary-success-700"
            {...props}
        />
    );
}

function DebuggerUserIcon(props: BaseRoleIconProps) {
    return (
        <TemplateRoleIcon
            iconName="alert-circle"
            colorClasses="bg-secondary-cherry-100 text-secondary-cherry-700"
            {...props}
        />
    );
}

function DashboardEditorUserIcon(props: BaseRoleIconProps) {
    return (
        <TemplateRoleIcon
            iconName="dashboard-plus"
            colorClasses="bg-primary-warning-100 text-primary-warning-700"
            {...props}
        />
    );
}

function McpUserIcon(props: BaseRoleIconProps) {
    return (
        <TemplateRoleIcon
            iconName="laptop"
            colorClasses="bg-dashboard-teal-200 text-dashboard-teal-800"
            {...props}
        />
    );
}

export function RoleIcon({ roleId, size = 'md', className }: RoleIconProps) {
    const iconProps = { size, className };

    switch (roleId) {
        case 1:
            return <AdminUserIcon {...iconProps} />;
        case 2:
            return <ViewerUserIcon {...iconProps} />;
        case 3:
            return <ConceptEditorUserIcon {...iconProps} />;
        case 4:
            return <DebuggerUserIcon {...iconProps} />;
        case 5:
            return <DashboardEditorUserIcon {...iconProps} />;
        case 7:
            return <McpUserIcon {...iconProps} />;
        default:
            return <ViewerUserIcon {...iconProps} />;
    }
}
