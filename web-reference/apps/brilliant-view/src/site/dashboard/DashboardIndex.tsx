import { Icon } from '@brilliant/bds-core';
import { Column } from '@brilliant/components';
import type { DashboardDetails } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useLocalize } from '~/i18n/I18nContext';
import { DashboardLoadError } from '~/site/dashboard/DashboardLoadError/DashboardLoadError';
import { DashboardView } from '~/site/dashboard/DashboardView';
import { useParams } from 'react-router-dom';
import { getDashboardLoadErrorMessage } from './DashboardLoadError/errorMessageUtils';

export function DashboardIndex() {
    const { id } = useParams();
    const { editMode } = useDashboardParams();
    const localize = useLocalize();
    const dashboardId = Number.parseInt(id ?? '');
    const { isLoading, isError, data, error } = useQuery<DashboardDetails>({
        queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        queryFn: () => API.getDashboard(dashboardId),
        enabled: !isNaN(dashboardId),
        refetchInterval: !editMode && 1000 * 10,
        refetchOnWindowFocus: !editMode,
    });

    if (isNaN(dashboardId)) {
        return (
            <DashboardLoadError
                title={localize('dashboards.loadError.title')}
                description={localize('dashboards.loadError.invalidId')}
            />
        );
    }

    if (isError) {
        return (
            <DashboardLoadError
                title={localize('dashboards.loadError.title')}
                description={getDashboardLoadErrorMessage(error, localize)}
            />
        );
    }

    if (data === undefined || isLoading) {
        return (
            <Column height="100%" justify="center">
                <Icon
                    icon="eos-icons:three-dots-loading"
                    style={{ fontSize: '10em' }}
                />
            </Column>
        );
    }

    return <DashboardView dashboard={data} key={dashboardId} />;
}
