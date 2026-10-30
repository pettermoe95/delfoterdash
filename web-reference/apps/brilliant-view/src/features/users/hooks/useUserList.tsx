import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '../api/queryKeys';
import type { UsersList } from '../api/schema';
import { userEndpoints } from '../api/users';

export const useUsersList = (enabled = true) => {
    const config = {
        queryKey: [QUERY_KEY.USERS] as const,
        queryFn: () => userEndpoints.listUsers(),
        placeholderData: keepPreviousData,
        enabled,
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 60, // 1 hour
    };

    return useQuery<UsersList>(config);
};
