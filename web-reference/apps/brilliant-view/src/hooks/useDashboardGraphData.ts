import type { DashboardLayoutItem, GenericData } from '@bv/api';
import { useMemo } from 'react';
import { useLoadDataQuery } from './query';

type GraphLoadResult = {
    isLoading: boolean;
    error: unknown;
    data: GenericData | null | undefined;
};

export function useDashboardGraphData(
    layout: DashboardLayoutItem,
    enabled = true
): GraphLoadResult {
    const baseQuery = useMemo(() => {
        if (!enabled) {
            return null;
        }

        return layout.graph.query ?? null;
    }, [enabled, layout.graph.query]);

    const baseResult = useLoadDataQuery(baseQuery);

    return useMemo(() => {
        return {
            isLoading: baseResult.isLoading,
            error: baseResult.error,
            data: baseResult.data,
        };
    }, [baseResult.data, baseResult.error, baseResult.isLoading]);
}
