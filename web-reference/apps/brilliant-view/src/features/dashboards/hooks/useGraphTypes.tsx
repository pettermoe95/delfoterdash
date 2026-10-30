import type { DashboardGraphType } from '@bv/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import { QUERY_KEY } from '~/api/queryKeys';

export const useGraphTypes = () => {
    const config = {
        queryKey: [QUERY_KEY.GRAPH_TYPES] as const,
        queryFn: () => API.listGraphTypes(),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 60, // 1 hour
    };

    return useQuery<DashboardGraphType[]>(config);
};
