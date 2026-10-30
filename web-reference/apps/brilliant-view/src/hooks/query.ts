import type {
    DashboardGraphQuery,
    GenericData,
    GenericDataFilterObject,
} from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { useEffect, useMemo } from 'react';
import { querySubscriptionManager } from './querySubscriptionManager';

export function useLoadDataQuery(query?: DashboardGraphQuery | null) {
    const enabled = !!query && Object.keys(query).length > 0;
    const queryIdentity = JSON.stringify(query ?? null);
    const subscriptionQuery = useMemo<DashboardGraphQuery | null>(
        () => JSON.parse(queryIdentity) as DashboardGraphQuery | null,
        [queryIdentity]
    );
    const queryKey = useMemo(
        () => ['load-data', queryIdentity] as const,
        [queryIdentity]
    );

    useEffect(() => {
        if (!enabled || !subscriptionQuery) {
            return;
        }
        querySubscriptionManager.subscribe(queryKey, subscriptionQuery);

        return () => {
            querySubscriptionManager.unsubscribe(queryKey);
        };
    }, [enabled, queryKey, subscriptionQuery]);

    return useQuery<GenericData | null, Error>({
        queryKey,
        queryFn: ({ signal }) => {
            if (
                !subscriptionQuery ||
                Object.keys(subscriptionQuery).length === 0
            ) {
                return null; // This is fine - returning null is allowed
            }

            return querySubscriptionManager
                .waitForInitialData<GenericData>(
                    queryKey,
                    subscriptionQuery,
                    signal
                )
                .then((result) => result ?? null);
        },
        staleTime: Infinity,
        retry: false,
        enabled,
    });
}

export function useGenericDataFilterQuery(graph_id: number | null) {
    return useQuery<GenericDataFilterObject | null, Error>({
        queryKey: ['generic-query-filter', graph_id] as const,
        queryFn: async () => {
            if (!graph_id) {
                return null; // Returning null is acceptable: TanStack Query v5 treats a null return value as valid data, not an error, so the query's data will be set to null.
            }

            try {
                const result = await API.getGenericFilterData(graph_id);
                // Ensure we never return undefined
                return result ?? null;
            } catch (error) {
                console.error('Error loading filter data:', error, {
                    graph_id,
                });
                throw error;
            }
        },
        enabled: !!graph_id,
    });
}
