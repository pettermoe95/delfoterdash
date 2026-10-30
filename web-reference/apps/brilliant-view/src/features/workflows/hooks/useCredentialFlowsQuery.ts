import { useQuery } from '@tanstack/react-query';
import { credentialsEndpoints } from '../api/credentials';
import type { CredentialFlowDefinition } from '../api/types';

export function useCredentialFlowsQuery() {
    return useQuery<CredentialFlowDefinition[]>({
        queryKey: ['credential_flows'] as const,
        queryFn: credentialsEndpoints.listCredentialFlows,
        staleTime: 5 * 60 * 1000,
    });
}
