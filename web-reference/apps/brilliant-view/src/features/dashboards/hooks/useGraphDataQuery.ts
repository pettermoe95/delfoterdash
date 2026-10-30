import type { DashboardGraphQuery, GenericData } from '@bv/api';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';
import { querySubscriptionManager } from '~/hooks/querySubscriptionManager';
import { useEffect, useMemo } from 'react';
import { removeEmptyDomain } from '../components/Filters/filterUtils';

type GraphQueryMode = 'dashboard' | 'preview';
/**
 * Custom hook for fetching graph data from a query
 * @param query - The query object to send to the API
 * @param mode - Optional query mode
 * @returns Query result with data, loading, and error states
 */
export function useGraphDataQuery(
    query: Record<string, unknown> | undefined,
    mode: GraphQueryMode = 'dashboard'
): UseQueryResult<GenericData | null, Error> {
    const normalizedQuery =
        mode === 'preview'
            ? removeEmptyDomain(query as DashboardGraphQuery | undefined)
            : query;

    const isEnabled = Boolean(normalizedQuery);
    const queryIdentity = JSON.stringify(normalizedQuery ?? null);

    const queryKey = useMemo(
        () => [QUERY_KEY.GRAPH_QUERY, mode, queryIdentity] as const,
        [mode, queryIdentity]
    );

    useEffect(() => {
        if (mode !== 'dashboard' || !normalizedQuery) {
            return;
        }

        querySubscriptionManager.subscribe(queryKey, normalizedQuery);

        return () => {
            querySubscriptionManager.unsubscribe(queryKey);
        };
    }, [mode, normalizedQuery, queryKey]);

    return useQuery({
        queryKey,
        enabled: isEnabled,
        retry: false,
        staleTime: mode === 'preview' ? 0 : Infinity,

        queryFn: ({ signal }) => {
            if (!normalizedQuery) {
                throw new Error('Query is required');
            }

            if (mode === 'preview') {
                return API.getGraphDataByQuery(
                    normalizedQuery as DashboardGraphQuery
                );
            }

            return querySubscriptionManager.waitForInitialData<GenericData>(
                queryKey,
                normalizedQuery,
                signal
            );
        },
    });
}
