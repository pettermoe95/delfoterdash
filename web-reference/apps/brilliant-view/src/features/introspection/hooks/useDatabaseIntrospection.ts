import type { TableSpecification } from '@bv/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiService } from '~/api/service.ts';

const QUERY_KEY = ['database-introspection'] as const;

export function useDatabaseIntrospection() {
    return useQuery<TableSpecification[]>({
        queryKey: QUERY_KEY,
        queryFn: () =>
            apiService.getData<TableSpecification[]>('v1/query/introspection'),
        placeholderData: keepPreviousData,
        gcTime: Infinity,
        staleTime: Infinity,
    });
}
