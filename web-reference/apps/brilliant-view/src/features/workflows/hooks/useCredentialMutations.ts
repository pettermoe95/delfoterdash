import { useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialsEndpoints } from '../api/credentials';
import type {
    CreateCredentialRequest,
    UpdateCredentialParams,
} from '../api/types';

const CREDENTIALS_QUERY_KEY = ['credentials'] as const;

export function useCreateCredential() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCredentialRequest) =>
            credentialsEndpoints.createCredential({ payload }),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: CREDENTIALS_QUERY_KEY,
            });
        },
    });
}

export function useUpdateCredential() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ credentialId, payload }: UpdateCredentialParams) =>
            credentialsEndpoints.updateCredential({ credentialId, payload }),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: CREDENTIALS_QUERY_KEY,
            });
        },
    });
}

export function useDeleteCredential() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentialId: string) =>
            credentialsEndpoints.deleteCredential(credentialId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: CREDENTIALS_QUERY_KEY,
            });
        },
    });
}
