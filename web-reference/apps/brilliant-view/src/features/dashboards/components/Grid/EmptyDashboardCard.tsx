import { Button } from '@brilliant/bds-core';
import type { DashboardLayoutItem } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardParams } from '../../hooks/useDashboardParams';
import { PlaceholderCard } from './PlaceholderCard';

type EmptyDashboardCardProps = {
    layout: DashboardLayoutItem[];
};

export function EmptyDashboardCard({ layout }: EmptyDashboardCardProps) {
    const localize = useLocalize();
    const { editMode, setDashboardParams } = useDashboardParams();

    function handleToggleGraphs() {
        setDashboardParams({ editMode: 'true' });
    }

    if (layout.length > 0) return;

    const title = editMode ? (
        <>
            <span className="font-medium">
                {localize('dashboards.create.guide1')}
            </span>{' '}
            {localize('dashboards.create.guide2')}
        </>
    ) : (
        <>
            {localize('dashboards.create.guide3')}{' '}
            <span className="font-medium">
                {localize('dashboards.create.guide4')}
            </span>{' '}
            {localize('dashboards.create.guide5')}
        </>
    );

    const action = editMode ? undefined : (
        <Button leftIcon="bv:pie-chart" onClick={handleToggleGraphs}>
            {localize('dashboards.create.browseComponents')}
        </Button>
    );

    return <PlaceholderCard action={action} title={title} />;
}
