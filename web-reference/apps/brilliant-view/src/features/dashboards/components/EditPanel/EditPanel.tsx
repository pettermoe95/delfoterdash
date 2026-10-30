import { Sheet, SheetContent, SheetTitle } from '@bv/ui';
import { ConceptGraphStudio } from '~/features/dashboards/components/EditPanel/NewGraphStudio/GraphStudio';
import { useEffect } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { useDashboardParams } from '../../hooks/useDashboardParams';
import type { EditPaneConfig, EditPaneName } from './Panes';
import { ComponentsPane } from './Panes/ComponentsPane';

const editPanes = {
    default: ComponentsPane,
    graphStudio: ConceptGraphStudio,
} satisfies EditPaneConfig;

export function EditPanel() {
    const { searchParams, editMode, setDashboardParams, resetPane } =
        useDashboardParams();
    const isAuthorized = useIsAuthorizedOrRedirect();

    function setActivePane(editPane: EditPaneName) {
        setDashboardParams({ editPane });
    }

    if (!isAuthorized) return null;

    const PaneComponent = editPanes[searchParams.editPane ?? 'default'];
    const panesWithOverlay: (EditPaneName | undefined)[] = ['graphStudio'];
    const enableOverlay = panesWithOverlay.includes(searchParams.editPane);

    return (
        <Sheet open={editMode} modal={enableOverlay}>
            <SheetContent
                className="w-[var(--edit-panel-width)] focus-within:!shadow-none focus-within:!outline-none"
                onPointerDownOutside={(e) => e.preventDefault()}
                showCloseButton={false}
                overlay={enableOverlay}
                aria-describedby={undefined}
            >
                <SheetTitle />
                <PaneComponent
                    setActivePane={setActivePane}
                    resetPane={resetPane}
                />
            </SheetContent>
        </Sheet>
    );
}

function useIsAuthorizedOrRedirect() {
    const dashboardQuery = useDashboardData();
    const { canEditDashboard } = useDashboardEditPermission(
        dashboardQuery.data
    );
    const { editMode, resetParams } = useDashboardParams();

    useEffect(() => {
        if (editMode && !canEditDashboard) {
            resetParams();
        }
    }, [editMode, canEditDashboard, resetParams]);

    return canEditDashboard;
}
