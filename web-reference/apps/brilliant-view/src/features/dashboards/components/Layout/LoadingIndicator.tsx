import { cn, Icon } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect } from 'react';
import type { DashboardQueryStatus } from '../../store';
import {
    useDashboardQueryStatus,
    useSetDashboardQueryStatus,
} from '../../store';

type StatusItem = {
    icon: string;
    text: string;
    spin?: boolean;
    classes?: {
        icon?: string;
        text?: string;
        wrapper?: string;
    };
};

type StatusConfig = Record<DashboardQueryStatus, StatusItem | null>;

export function LoadingIndicator() {
    return (
        <>
            <LoadingIndicatorChip />
            <LoadingIndicatorToggle />
        </>
    );
}

function LoadingIndicatorChip() {
    const localize = useLocalize();
    const queryStatus = useDashboardQueryStatus();
    const statusConfig: StatusConfig = {
        idle: null,
        loading: {
            icon: 'bv:loading',
            text: localize('dashboards.loading.saving'),
            spin: true,
        },
        success: {
            icon: 'bv:cloud-check',
            text: localize('dashboards.loading.saved'),
            classes: {
                text: 'text-success-primary',
                icon: 'text-fg-success-primary',
            },
        },
        error: {
            icon: 'bv:cloud-close',
            text: localize('dashboards.loading.error'),
            classes: {
                text: 'text-error-primary',
                icon: 'text-fg-error-primary',
            },
        },
    };
    const configItem = statusConfig[queryStatus];
    if (!configItem) return null;

    return (
        <div
            className={cn(
                'flex items-center gap-sm rounded-full',
                'border border-primary bg-primary px-2 py-1',
                configItem.classes?.wrapper
            )}
        >
            <Icon
                icon={configItem.icon}
                className={cn(
                    'h-6 w-6 text-fg-tertiary',
                    configItem.classes?.icon,
                    configItem.spin && 'animate-spin'
                )}
            />
            <span
                className={cn(
                    'mt-0.5 text-tertiary bv-text-font-sm-regular',
                    configItem.classes?.text
                )}
            >
                {configItem.text}
            </span>
        </div>
    );
}

function LoadingIndicatorToggle() {
    const queryStatus = useDashboardQueryStatus();
    const setQueryStatus = useSetDashboardQueryStatus();

    useEffect(() => {
        const timeout = setTimeout(() => setQueryStatus('idle'), 2000);

        return () => clearTimeout(timeout);
    }, [queryStatus, setQueryStatus]);

    return null;
}
