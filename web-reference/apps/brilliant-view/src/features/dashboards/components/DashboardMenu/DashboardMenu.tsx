import {
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    IconButton,
} from '@brilliant/bds-core';
import type { DashboardColor } from '@bv/ui';
import { dashboardGradientStyles } from '@bv/ui';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { getDashboardPath } from '../../dashboardSharing';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { useDuplicateDashboard } from '../../mutations';
import { EditDashboardIconForm } from '../Forms';
import { DeleteDashboardMenuItem } from './DeleteDashboardMenuItem';
import { DuplicateDashboardMenuItem } from './DuplicateDashboardMenuItem';
import { EditAndShareDashboardDialog } from './EditAndShareDashboardDialog';
import { EditAndShareDashboardMenuItem } from './EditAndShareDashboardMenuItem';

export function DashboardMenu() {
    const dashboardQuery = useDashboardData();
    const dashboard = dashboardQuery?.data;
    const { canEditDashboard } = useDashboardEditPermission(dashboard);
    const { hasPermission } = useAccount();
    const canDuplicateDashboard = hasPermission(
        PERMISSION.DASHBOARDS_DUPLICATE
    );
    const [isMenuOpen, setIsMenuOpen] = useToggle(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const duplicateMutation = useDuplicateDashboard();
    const navigate = useNavigate();

    function handleReset() {
        setIsMenuOpen(false);
        setIsModalOpen(false);
    }

    if (!dashboard || (!canEditDashboard && !canDuplicateDashboard))
        return null;

    const duplicateDashboard = () => {
        duplicateMutation.mutate(dashboard.id, {
            onSuccess: ({ id }) => {
                setIsMenuOpen(false);
                navigate(getDashboardPath(id));
            },
        });
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            {canEditDashboard && (
                <EditAndShareDashboardDialog
                    open={isModalOpen}
                    dashboard={dashboard}
                    onClose={handleReset}
                />
            )}
            <DropdownMenu
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                modal={false}
            >
                <DropdownMenuTrigger asChild>
                    <IconButton
                        icon="bv:chevron-down"
                        variant="ghost"
                        size="sm"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {canEditDashboard && (
                        <>
                            <EditAndShareDashboardMenuItem
                                setIsModalOpen={setIsModalOpen}
                            />
                            <DashboardColorSubMenu />
                        </>
                    )}
                    {canDuplicateDashboard && (
                        <DuplicateDashboardMenuItem
                            isPending={duplicateMutation.isPending}
                            onDuplicate={duplicateDashboard}
                        />
                    )}
                    {canEditDashboard && (
                        <>
                            <DropdownMenuSeparator />
                            <DeleteDashboardMenuItem
                                dashboard={dashboard}
                                onClose={() => setIsMenuOpen(false)}
                            />
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function DashboardColorSubMenu() {
    const localize = useLocalize();
    const dashboardQuery = useDashboardData();
    const dashboard = dashboardQuery?.data;

    if (!dashboard) return null;

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="hidden lg:flex">
                <div
                    className={cn(
                        'h-4 w-4 rounded-full',
                        dashboardGradientStyles({
                            color: dashboard.color as DashboardColor,
                        })
                    )}
                />
                <span>{localize('dashboards.create.setColor')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <EditDashboardIconForm dashboard={dashboard} size="sm" />
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
