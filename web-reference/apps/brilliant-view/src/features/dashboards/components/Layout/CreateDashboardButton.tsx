import { Button } from '@brilliant/bds-core';
import { primitives } from '@bv/design-tokens';
import { API } from '~/api';
import { useCreateDashboard } from '~/features/dashboards/mutations';
import { ViewFilterFactory } from '~/filters/factory';
import { useLocalize } from '~/i18n/I18nContext';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { useMedia } from 'react-use';
import { getDashboardPath } from '../../dashboardSharing';
import type { DashboardSearchParams } from '../../hooks/useDashboardParams';
import { getYTDRange } from '../PredefinedDateRanges/dateRanges';

export function CreateDashboardButton() {
    const mutate = useCreateDashboard();
    const navigate = useNavigate();
    const breakpoint = useMedia(
        `(min-width: ${primitives.breakpoints.desktop})`
    );
    const localize = useLocalize();
    async function handleCreateDashboard() {
        try {
            const result = await mutate.mutateAsync({});
            const ytdRange = getYTDRange();
            const defaultDateFilter = ViewFilterFactory.fromDateValue({
                ...ytdRange,
                preset: 'ytd',
            });

            await API.enableGlobalFilters({
                dashboard_id: result.id,
                concept: 'date',
            });

            if (defaultDateFilter) {
                await API.setDashboardGlobalFilterValues(result.id, [
                    {
                        name: 'date',
                        value: defaultDateFilter.toQueryFilter(),
                    },
                ]);
            }

            navigate({
                pathname: getDashboardPath(result.id),
                search: createSearchParams({
                    editMode: 'true',
                    new: 'true',
                    from: ytdRange.from,
                    to: ytdRange.to,
                    preset: 'ytd',
                } satisfies DashboardSearchParams).toString(),
            });
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="hidden lg:block">
            <Button
                leftIcon={mutate.isPending ? 'bv:loading' : 'bv:dashboard-plus'}
                onClick={handleCreateDashboard}
                size={breakpoint ? 'md' : 'sm'}
                className="flex"
            >
                {localize('dashboards.createDashboard')}
            </Button>
        </div>
    );
}
