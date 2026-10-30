import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { credentialsEndpoints } from '../api/credentials';
import type { CredentialReAuthorization } from '../api/types';
import { isOAuthAuthorizationCodeFlowName } from '../utils/credentialReAuthorization';

export function useCredentialReAuthorizationQuery(
    credentialId: string,
    flowName: string
) {
    const shouldCallReAuthorizationEndpoint =
        isOAuthAuthorizationCodeFlowName(flowName);

    const query = useQuery<CredentialReAuthorization | null>({
        queryKey: ['credential_re_auth', credentialId] as const,
        queryFn: async () => {
            try {
                return await credentialsEndpoints.getCredentialReAuth(
                    credentialId
                );
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    return null;
                }

                console.error(
                    'Credential re-authorization check failed',
                    error
                );
                throw error;
            }
        },
        enabled: shouldCallReAuthorizationEndpoint,
        retry: false,
    });

    return {
        ...query,
        isReAuthorizationSupported: shouldCallReAuthorizationEndpoint,
    };
}
