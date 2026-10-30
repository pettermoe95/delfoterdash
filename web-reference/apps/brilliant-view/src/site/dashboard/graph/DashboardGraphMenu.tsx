import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    Icon,
    IconButton,
} from '@brilliant/bds-core';
import { Gap } from '@brilliant/components';
import { AdminOnly } from '~/features/auth';
import { DashboardAuthBoundary } from '~/features/dashboards';
import { DeleteGraphDialog } from '~/features/dashboards/components/EditPanel/GraphStudio/DeleteGraphDialog';
import { useDashboardData } from '~/features/dashboards/hooks/useDashboardData';
import { useDashboardEditPermission } from '~/features/dashboards/hooks/useDashboardEditPermission';
import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { useDashboardGraphContext } from './dashboardGraphContext';

export function DashboardGraphMenu() {
    const localize = useLocalize();
    const { layout } = useDashboardGraphContext();
    const { setDashboardParams } = useDashboardParams();
    const dashboardQuery = useDashboardData();
    const { canEditDashboard } = useDashboardEditPermission(
        dashboardQuery.data
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    function handleToggleGraphStudio() {
        setDashboardParams({
            editMode: 'true',
            editPane: 'graphStudio',
            editGraphId: layout.id.toString(),
        });
    }

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!canEditDashboard) return null;

    return (
        <>
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                modal={false}
            >
                <DropdownMenuTrigger asChild>
                    <IconButton
                        icon="bv:dots-horizontal"
                        variant="ghost"
                        size="sm"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <AdminOnly>
                        <DebugInfoMenuItem />
                        <DropdownMenuSeparator />
                    </AdminOnly>
                    <DropdownMenuItem
                        onSelect={handleToggleGraphStudio}
                        className="hover:cursor-pointer"
                    >
                        <Icon icon="bv:pen" className="h-4 w-4" />
                        <span>{localize('dashboards.editGraph')}</span>
                    </DropdownMenuItem>
                    <DashboardAuthBoundary>
                        <DropdownMenuItem
                            onSelect={() => {
                                setIsDeleteDialogOpen(true);
                            }}
                            className="hover:cursor-pointer"
                        >
                            <Icon
                                icon="mdi:delete"
                                className="iconify iconify--mdi h-4 w-4 text-fg-error-primary"
                            />
                            <span className="text-error-primary">
                                {localize('miscTerms.delete')}
                            </span>
                        </DropdownMenuItem>
                    </DashboardAuthBoundary>
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteGraphDialog
                layout={layout}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDropdownChange={() => setIsDropdownOpen(false)}
                trigger={null}
            />
        </>
    );
}

function DebugInfoMenuItem() {
    const localize = useLocalize();
    const { layout } = useDashboardGraphContext();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Icon icon="mdi:eye" />
                {localize('dashboards.debug.debugInfo')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <div className="space-y-lg p-xl">
                    <h3>{localize('dashboards.debug.graphInfo')}</h3>
                    <div className="space-y-md bv-text-font-md-regular">
                        <b>{localize('dashboards.debug.name')}</b>:{' '}
                        <i>{layout.graph.name}</i>
                        {localize('dashboards.debug.layoutId')}: {layout.id}
                        <br />
                        <b>{localize('dashboards.debug.graphId')}</b>:{' '}
                        {layout.graph.id}
                        <br />
                        <b>{localize('dashboards.debug.templateId')}</b>:{' '}
                        {layout.graph.template_id}
                        <br />
                        <b>{localize('dashboards.debug.position')}</b>: (
                        {layout.x}, {layout.y})<br />
                        <b>{localize('dashboards.debug.size')}</b>: (
                        {layout.width}, {layout.height})<br />
                        <br />
                        <br />
                        <b>{localize('dashboards.debug.display')}</b>
                        <p
                            style={{
                                maxWidth: '30em',
                                wordBreak: 'break-word',
                            }}
                        >
                            {JSON.stringify(layout.graph.display) ?? 'null'}
                        </p>
                    </div>
                    <Gap size="m" />
                </div>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
