import type { QueryFunction, QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

/**
 * A custom hook that returns the data from a query with the specified queryKey.
 *
 * @param {QueryKey} queryKey - The key used to identify the query.
 * @param {QueryFunction<T>} [queryFn] - Optional query function.
 */
export function useObservableQuery<T>(
    queryKey: QueryKey,
    queryFn: QueryFunction<T>
) {
    return useQuery<T>({
        queryKey,
        queryFn,
        enabled: false,
    });
}

export function useObservableQueryData<T>(
    queryKey: QueryKey,
    queryFn: QueryFunction<T>
) {
    const { data } = useQuery<T>({
        queryKey,
        queryFn,
        enabled: false,
    });
    return data;
}
