import { Icon } from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import { cn, DashboardGridCard } from '@bv/ui';
import { useLocaleValue, useLocalize } from '~/i18n/I18nContext';
import { DashboardActionsDropdown } from './DashboardActionsDropdown';
import { useNavigateToDashboard } from './useNavigateToDashboard';

type DashboardGallery = {
    data: Dashboard[];
    isLoading?: boolean;
};

export function DashboardGallery({ data, isLoading }: DashboardGallery) {
    const navigateToDashboard = useNavigateToDashboard();

    function openDashboard(dashboard: Dashboard) {
        navigateToDashboard(dashboard);
    }

    const localize = useLocalize();
    const locale = useLocaleValue();

    return (
        <div
            data-component-name="dashboard-gallery"
            className={cn(
                'grid',
                'sm:grid-cols-2',
                'lg:grid-cols-3',
                'xl:grid-cols-4',
                'wide:grid-cols-5',
                'w-full gap-lg'
            )}
        >
            {isLoading && <Icon icon="eos-icons:three-dots-loading" />}
            {data.length ? (
                data?.map((d) => (
                    <DashboardGridCard
                        key={d.id}
                        dashboard={d}
                        actions={<DashboardActionsDropdown dashboard={d} />}
                        onClick={() => openDashboard(d)}
                        localizeFn={localize}
                        locale={locale}
                    />
                ))
            ) : (
                <div className="rounded-sm border border-primary bg-primary p-4 text-primary">
                    {localize('dashboards.noDataMessage')}
                </div>
            )}
        </div>
    );
}
