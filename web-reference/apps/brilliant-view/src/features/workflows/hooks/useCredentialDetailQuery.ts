import { useQuery } from '@tanstack/react-query';
import { credentialsEndpoints } from '../api/credentials';

export function useCredentialDetailQuery(
    credentialId: string,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ['credential', credentialId] as const,
        queryFn: () => credentialsEndpoints.getCredential(credentialId),
        enabled: options?.enabled ?? true,
    });
}
