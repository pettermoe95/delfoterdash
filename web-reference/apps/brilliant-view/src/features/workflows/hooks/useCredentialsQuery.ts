import { useQuery } from '@tanstack/react-query';
import { credentialsEndpoints } from '../api/credentials';
import type { CredentialListItem } from '../api/types';

export function useCredentialsQuery() {
    return useQuery<CredentialListItem[]>({
        queryKey: ['credentials'] as const,
        queryFn: credentialsEndpoints.listCredentials,
    });
}
