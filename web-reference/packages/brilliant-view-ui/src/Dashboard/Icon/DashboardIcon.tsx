import type { BVIconName } from '@brilliant/bds-core';
import { bvIconNames, Icon } from '@brilliant/bds-core';
import { cn } from '../../utils';
import type { DashboardGradientProps } from './backgroundStyles';
import { dashboardGradientStyles } from './backgroundStyles';
import type { DashboardIconName } from './properties';

export const sizeClasses = {
    xs: {
        wrapper: 'w-5 h-5',
        icon: 'w-4 h-4',
    },
    xs_padding_4px: {
        wrapper: 'w-5 h-5 p-1',
        icon: 'w-4 h-4',
    },
    sm: {
        wrapper: 'w-[42px] h-[42px]',
        icon: 'w-8 h-8',
    },
    md: {
        wrapper: 'w-12 h-12',
        icon: 'w-9 h-9',
    },
    md_wrapper_44px_44px_padding_8px: {
        wrapper: 'w-11 h-11 p-2',
        icon: 'w-9 h-9',
    },
} as const;

type SizeValue = keyof typeof sizeClasses;

type DashboardIconProps = DashboardGradientProps & {
    icon?: DashboardIconName;
    size?: SizeValue;
    clickable?: boolean;
    onClick?: () => void;
};

function getIconName(rawIcon: string) {
    if (bvIconNames.includes(rawIcon as BVIconName)) return `bv:${rawIcon}`;
    return `bv:dashboard`;
}

export function DashboardIcon({
    color,
    gradient,
    icon = 'dashboard',
    size = 'md',
    clickable,
    onClick,
}: DashboardIconProps) {
    const enableHover = clickable || Boolean(onClick);

    const gradientClasses = dashboardGradientStyles({
        color: color ?? 'blue',
        gradient,
        clickable: enableHover,
    });
    const sizeMap = sizeClasses[size];

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-sm shadow-xs',
                sizeMap.wrapper,
                gradientClasses
            )}
            onClick={onClick}
        >
            <Icon icon={getIconName(icon)} className={cn(sizeMap.icon)} />
        </div>
    );
}
