import { Avatar, Tooltip } from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import type { TokenPrimitives } from '@bv/design-tokens';
import type { LocalizeFn } from '@bv/i18n-utils';
import type { ReactNode } from 'react';
import { cn, getRelativeDashboardUpdatedDate } from '../utils';
import Styles from './DashboardGridCard.module.scss';
import { DashboardIcon, parseDashboardIconName } from './Icon';

type DashboardGridCardProps = {
    dashboard: Dashboard;
    className?: string;
    disabled?: boolean;
    actions?: ReactNode;
    onClick?: (dashboard: Dashboard) => void;
    localizeFn: LocalizeFn;
    locale?: string;
};

type ColorType = keyof TokenPrimitives['colors']['dashboard'];

const defaultT: LocalizeFn = (key) => key;

export function DashboardGridCard({
    dashboard,
    className,
    disabled,
    actions,
    onClick,
    localizeFn = defaultT,
    locale = 'en',
}: DashboardGridCardProps) {
    const localize = localizeFn;
    return (
        <a
            className={cn(
                'flex items-center gap-4 rounded-sm bg-primary p-xl hover:bg-primary-hover',
                'hover:border-primary-hover border border-solid border-primary',
                onClick && 'cursor-pointer',
                disabled && 'cursor-not-allowed bg-disabled',
                className,
                Styles.dashboardGridCard
            )}
            data-disabled={disabled}
            role="button"
            onClick={disabled ? undefined : () => onClick?.(dashboard)}
        >
            <DashboardIcon
                icon={parseDashboardIconName(dashboard.icon)}
                color={(dashboard.color as ColorType) ?? 'blue'}
            />
            <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="line-clamp-1 text-primary bv-text-font-md-regular">
                        {dashboard.name}
                    </div>
                    {actions}
                </div>
                <div className="flex items-center justify-between gap-2 text-quaternary bv-text-font-xs-regular">
                    <div>
                        {localize('dashboards.lastUpdated')}{' '}
                        {getRelativeDashboardUpdatedDate(dashboard, locale)}
                    </div>
                    <Tooltip
                        title={[
                            dashboard.created_by.first_name,
                            dashboard.created_by.last_name,
                        ].join(' ')}
                        side="bottom"
                    >
                        <Avatar
                            src={dashboard.created_by?.picture_url ?? undefined}
                            name={[
                                dashboard.created_by.first_name,
                                dashboard.created_by.last_name,
                            ].join(' ')}
                            size="xs"
                        />
                    </Tooltip>
                </div>
            </div>
        </a>
    );
}
