import type { MutationStatus } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { API } from '~/api';

export function useGraphBuilderPrompt() {
    const { data, mutateAsync, isPending, status } = useMutation({
        mutationFn: API.generateGraphQuery,
    });

    const calculatedStatus: MutationStatus =
        status !== 'success' ? status : data?.query ? 'success' : 'error';

    return {
        data: data,
        status: calculatedStatus,
        sendPrompt: mutateAsync,
        isLoading: isPending,
    };
}
