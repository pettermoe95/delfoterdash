import { apiService } from '~/api/service';
import type {
    CreateCredentialParams,
    CreateCredentialRequest,
    CreateCredentialResponse,
    CredentialDetail,
    CredentialFlowDefinition,
    CredentialListItem,
    CredentialReAuthorization,
    CredentialReAuthorizationResponse,
    UpdateCredentialParams,
    UpdateCredentialRequest,
} from './types';

export const credentialsEndpoints = {
    createCredential: ({ payload }: CreateCredentialParams) =>
        apiService.postData<CreateCredentialResponse, CreateCredentialRequest>(
            '/v1/credentials',
            payload
        ),
    updateCredential: ({ credentialId, payload }: UpdateCredentialParams) =>
        apiService.patchData<unknown, UpdateCredentialRequest>(
            `/v1/credentials/${credentialId}`,
            payload
        ),
    listCredentialFlows: () =>
        apiService.getData<CredentialFlowDefinition[]>('/v1/credentials/flows'),
    listCredentials: () =>
        apiService.getData<CredentialListItem[]>('/v1/credentials/list'),
    getCredentialReAuth: async (credentialId: string) => {
        const response =
            await apiService.getData<CredentialReAuthorizationResponse>(
                `/v1/credentials/${credentialId}/needs_re_auth`
            );

        return {
            needsReAuth: response.needsReAuth ?? false,
        } satisfies CredentialReAuthorization;
    },
    getCredential: (credentialId: string) =>
        apiService.getData<CredentialDetail>(`/v1/credentials/${credentialId}`),
    deleteCredential: (credentialId: string) =>
        apiService.deleteData(`/v1/credentials/${credentialId}`, {}),
};
