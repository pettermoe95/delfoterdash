import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@brilliant/bds-core';
import {
    DashboardIcon,
    parseDashboardColor,
    parseDashboardIconName,
} from '@bv/ui';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { EditDashboardIconForm } from './EditDashboardIconForm';
import type { BaseEditableDashboardProps } from './types';

export function EditableDashboardIcon({
    dashboard,
}: BaseEditableDashboardProps) {
    const { canEditDashboard } = useDashboardEditPermission(dashboard);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger disabled={!canEditDashboard}>
                <DashboardIcon
                    color={parseDashboardColor(dashboard.color)}
                    icon={parseDashboardIconName(dashboard.icon)}
                    clickable={canEditDashboard}
                    size="sm"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <EditDashboardIconForm dashboard={dashboard} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
