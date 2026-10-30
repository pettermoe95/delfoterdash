import type { SelectOption } from '@brilliant/bds-core';
import { IconButton, TextField } from '@brilliant/bds-core';
import { DashboardFilter } from '@bv/ui';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { useAccount } from '~/features/auth';
import { PERMISSION } from '~/features/auth/components/constants';
import {
    CreateDashboardButton,
    DashboardGallery,
    DashboardsTable,
} from '~/features/dashboards';
import { useLocalize } from '~/i18n/I18nContext';
import { DefaultPageLayout } from '~/layout/DefaultPageLayout';
import { DashboardLoadError } from '~/site/dashboard/DashboardLoadError/DashboardLoadError';
import { useAutoLayout } from '~/stores/system';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    DEFAULT_OWNED_BY,
    filterDashboards,
    getDashboardOptions,
    getStoredOwnedByFilter,
    OWNED_BY_STORAGE_KEY,
} from '../dashboardFilterUtils';
import { getDashboardOverviewLoadErrorMessage } from '../DashboardLoadError/errorMessageUtils';

export function DashboardOverview() {
    const localize = useLocalize();
    const [search, setSearch] = useState<string>('');

    useAutoLayout('page-layout');

    const { isLoading, isError, error, data } = useQuery({
        queryKey: [QUERY_KEY.DASHBOARD] as const,
        queryFn: API.listDashboards,
    });

    const availableOwners = getDashboardOptions(
        data,
        localize('dashboards.ownedByEveryone')
    );

    const [params, setSearchParams] = useSearchParams({
        mode: 'grid',
        ownedBy: getStoredOwnedByFilter(),
    });

    const handleSetModeParam = (listingMode: 'grid' | 'list') => {
        const newParams = new URLSearchParams(params);
        newParams.set('mode', listingMode);
        setSearchParams(newParams);
    };

    const handleSetOwnedBy = (option: SelectOption) => {
        const newParams = new URLSearchParams(params);
        newParams.set('ownedBy', option.value);
        setSearchParams(newParams);
    };

    const mode = params.get('mode') ?? 'grid';
    const ownerId = params.get('ownedBy') ?? DEFAULT_OWNED_BY;

    useEffect(() => {
        window.sessionStorage.setItem(OWNED_BY_STORAGE_KEY, ownerId);
    }, [ownerId]);

    const filteredData = filterDashboards({
        dashboards: data,
        selectedOwnerId: ownerId,
        searchQuery: search,
    });
    const showFullPageError = isError && data === undefined;

    return (
        <DefaultPageLayout actions={<DashboardOverviewActions />}>
            {showFullPageError ? (
                <DashboardLoadError
                    title={localize('dashboards.loadError.overviewTitle')}
                    description={getDashboardOverviewLoadErrorMessage(
                        error,
                        localize
                    )}
                />
            ) : (
                <div className="space-y-4xl">
                    <div className="flex items-center justify-between">
                        <div className="w-full lg:max-w-[350px]">
                            <TextField
                                label=""
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                name="search"
                                size="md"
                                leftIcon="bv:search"
                                placeholder={localize('miscTerms.search')}
                            />
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="hidden lg:block">
                                <DashboardFilter
                                    value={ownerId}
                                    onChange={handleSetOwnedBy}
                                    label={localize('dashboards.ownedBy')}
                                    options={availableOwners}
                                    defaultValue={DEFAULT_OWNED_BY}
                                />
                            </div>
                            <div className="hidden items-center gap-1 lg:flex">
                                <IconButton
                                    icon="bv:grid"
                                    size="sm"
                                    variant={
                                        mode === 'grid' ? 'filled' : 'ghost'
                                    }
                                    onClick={() => handleSetModeParam('grid')}
                                />
                                <IconButton
                                    icon="bv:list"
                                    size="sm"
                                    variant={
                                        mode === 'list' ? 'filled' : 'ghost'
                                    }
                                    onClick={() => handleSetModeParam('list')}
                                />
                            </div>
                        </div>
                    </div>

                    {mode === 'grid' ? (
                        <DashboardGallery
                            data={filteredData}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div>
                            <div className="hidden lg:block">
                                <DashboardsTable
                                    data={filteredData}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div className="lg:hidden">
                                <DashboardGallery
                                    data={filteredData}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DefaultPageLayout>
    );
}

function DashboardOverviewActions() {
    const { hasPermission } = useAccount();

    if (!hasPermission(PERMISSION.DASHBOARDS_CREATE)) {
        return null;
    }

    return <CreateDashboardButton />;
}
