import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    IconButton,
} from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import { PERMISSION, useAccount } from '~/features/auth';
import { useState } from 'react';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { useDuplicateDashboard } from '../../mutations';
import { DeleteDashboardMenuItem } from '../DashboardMenu/DeleteDashboardMenuItem';
import { DuplicateDashboardMenuItem } from '../DashboardMenu/DuplicateDashboardMenuItem';
import { EditAndShareDashboardDialog } from '../DashboardMenu/EditAndShareDashboardDialog';
import { EditAndShareDashboardMenuItem } from '../DashboardMenu/EditAndShareDashboardMenuItem';

export function DashboardActionsDropdown({
    dashboard,
}: {
    dashboard: Dashboard;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const duplicateMutation = useDuplicateDashboard();
    const { canEditDashboard } = useDashboardEditPermission(dashboard);
    const { hasPermission } = useAccount();
    const canDuplicateDashboard = hasPermission(
        PERMISSION.DASHBOARDS_DUPLICATE
    );
    const duplicateDashboard = () => {
        duplicateMutation.mutate(dashboard.id, {
            onSuccess: () => setIsDropdownOpen(false),
        });
    };

    if (!canEditDashboard && !canDuplicateDashboard) return null;

    function handleReset() {
        setIsDropdownOpen(false);
        setIsModalOpen(false);
    }

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
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                modal={false}
            >
                <DropdownMenuTrigger asChild>
                    <IconButton
                        icon="bv:dots-horizontal"
                        variant="ghost"
                        size="xs"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canEditDashboard && (
                        <EditAndShareDashboardMenuItem
                            setIsModalOpen={setIsModalOpen}
                        />
                    )}
                    {canDuplicateDashboard && (
                        <DuplicateDashboardMenuItem
                            isPending={duplicateMutation.isPending}
                            onDuplicate={duplicateDashboard}
                        />
                    )}
                    {canEditDashboard && (
                        <DeleteDashboardMenuItem
                            dashboard={dashboard}
                            onClose={() => setIsDropdownOpen(false)}
                            navigateOnDelete={false}
                        />
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
