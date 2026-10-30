import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { useDashboardDetails } from '~/features/dashboards';
import {
    getPresetRange,
    isMatchingRange,
} from '~/features/dashboards/components/PredefinedDateRanges/dateRanges';
import { ViewFilterFactory } from '~/filters/factory.ts';
import { DateBetweenFilter } from '~/filters/filters';
import type { ViewFilter } from '~/filters/viewFilter.ts';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    applyParamFilters,
    buildBaseFilters,
    buildFiltersQueryParams,
    buildSearchParams,
    clearFilterParams,
    collectParamFilters,
    snapshotSearchParams,
} from './globalFilterParamUtils';

type GlobalFilterValues = Record<string, ViewFilter>;

const removeFromParams = (
    concept: string,
    params: URLSearchParams,
    setSearchParams: (nextParams: URLSearchParams) => void
): void => {
    setSearchParams(clearFilterParams(concept, params));
};

const useDashboardEnabledFilters = (dashboardId: number): string[] => {
    const { data } = useDashboardDetails(dashboardId);
    return Array.from(new Set([...(data?.global_filters ?? []), 'date']));
};

const updateGlobalFilterCache = (
    client: QueryClient,
    dashboardId: number,
    filter: ViewFilter
): void => {
    client.setQueryData<GlobalFilterValues>(
        ['global-filter-values', dashboardId],
        (existing) => ({
            ...(existing ?? {}),
            [filter.concept]: filter,
        })
    );
};

const persistGlobalFilterValue = async (
    client: QueryClient,
    dashboardId: number,
    filter: ViewFilter
) => {
    updateGlobalFilterCache(client, dashboardId, filter);
    await API.setDashboardGlobalFilterValues(dashboardId, [
        { name: filter.concept, value: filter.toQueryFilter() },
    ]);
};

const removeGlobalFilterFromCache = (
    client: ReturnType<typeof useQueryClient>,
    dashboardId: number,
    concept: string
): void => {
    client.setQueryData<GlobalFilterValues>(
        ['global-filter-values', dashboardId],
        (existing) => {
            const next = { ...(existing ?? {}) };
            delete next[concept];
            return next;
        }
    );
};

export const useMutateGlobalFilterValue = (dashboardId: number) => {
    const client = useQueryClient();
    const [params, setSearchParams] = useSearchParams();

    const setMutation = useMutation({
        mutationFn: async (filter: ViewFilter) => {
            updateParamsWithFilter(filter);
            await persistGlobalFilterValue(client, dashboardId, filter);
        },
    });

    const updateParamsWithFilter = (filter: ViewFilter) => {
        const nextParams = clearFilterParams(filter.concept, params);
        filter.toQueryParams().forEach((entryValue, key) => {
            nextParams.append(key, entryValue);
        });
        setSearchParams(nextParams, { replace: true });
    };

    const removeMutation = useMutation({
        mutationFn: async (concept: string) => {
            removeFromParams(concept, params, setSearchParams);
            removeGlobalFilterFromCache(client, dashboardId, concept);

            await API.deleteDashboardGlobalFilterValue(dashboardId, concept);
        },
    });

    return {
        set: setMutation.mutate,
        remove: removeMutation.mutate,
    };
};

export const useGlobalFilterValues = (dashboardId: number) => {
    return useQuery<GlobalFilterValues>({
        queryKey: ['global-filter-values', dashboardId],
        queryFn: async () => {
            const result =
                await API.getDashboardGlobalFilterValues(dashboardId);

            return result.values.reduce<GlobalFilterValues>((values, entry) => {
                values[entry.name] = ViewFilterFactory.fromQueryFilter(
                    entry.value
                );
                return values;
            }, {});
        },
    });
};

export const useGlobalFilters = (dashboardId: number) => {
    const client = useQueryClient();
    const [params, setSearchParams] = useSearchParams();
    const { data: globalFilterValues } = useGlobalFilterValues(dashboardId);
    const dashboardFilters = useDashboardEnabledFilters(dashboardId);

    const paramsKey = params.toString();

    const { filters, nextParams, refreshedDateFilter } = useMemo(() => {
        const paramsSnapshot = snapshotSearchParams(
            new URLSearchParams(paramsKey)
        );
        const baseFilters = buildBaseFilters(
            dashboardFilters,
            globalFilterValues
        );

        const enabledDashboardFilters = new Set(dashboardFilters);
        const { paramFilters, passthroughParams } = collectParamFilters(
            paramsSnapshot,
            enabledDashboardFilters
        );

        // url filters override saved values so shared dashboard links keep their filters
        const filters = applyParamFilters(baseFilters, paramFilters);
        const dateFilter = filters.date;
        const presetRange =
            dateFilter instanceof DateBetweenFilter
                ? getPresetRange(dateFilter.preset)
                : null;
        // refresh presets like YTD before building the url to avoid competing date updates
        let refreshedDateFilter: DateBetweenFilter | undefined;
        if (
            dateFilter instanceof DateBetweenFilter &&
            presetRange &&
            !isMatchingRange(
                { from: String(dateFilter.from), to: String(dateFilter.to) },
                presetRange
            )
        ) {
            refreshedDateFilter = new DateBetweenFilter(
                presetRange.from,
                presetRange.to,
                dateFilter.preset
            );
            filters.date = refreshedDateFilter;
        }
        const nextParams = buildFiltersQueryParams(filters, passthroughParams);

        return { filters, nextParams, refreshedDateFilter };
    }, [dashboardFilters, globalFilterValues, paramsKey]);

    useEffect(() => {
        const currentParams = new URLSearchParams(params);
        const normalizedNextParams = buildSearchParams(nextParams);

        // ignore parameter order and only navigate when filter values change
        currentParams.sort();
        normalizedNextParams.sort();

        if (currentParams.toString() !== normalizedNextParams.toString()) {
            setSearchParams(normalizedNextParams, { replace: true });
        }
        if (refreshedDateFilter) {
            const cachedDateFilter = client.getQueryData<GlobalFilterValues>([
                'global-filter-values',
                dashboardId,
            ])?.date;
            // saving updates the cache immediately
            if (
                cachedDateFilter?.toQueryParams().toString() !==
                refreshedDateFilter.toQueryParams().toString()
            ) {
                persistGlobalFilterValue(
                    client,
                    dashboardId,
                    refreshedDateFilter
                ).catch(console.error);
            }
        }
    }, [
        client,
        dashboardId,
        nextParams,
        params,
        setSearchParams,
        refreshedDateFilter,
    ]);

    return filters;
};

export default useGlobalFilters;
