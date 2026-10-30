import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useAutoLayout } from '~/stores/system';
import { DashboardIndex } from './DashboardIndex';

export function DashboardPage() {
    const { searchParams } = useDashboardParams();
    useAutoLayout(searchParams.editMode ? 'dashboard-edit' : 'dashboard');

    return <DashboardIndex />;
}

export function DashboardFullscreenPage() {
    useAutoLayout('fullscreen');

    return <DashboardIndex />;
}
