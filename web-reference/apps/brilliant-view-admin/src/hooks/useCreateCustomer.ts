import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCustomerRequest } from '~/api/customers';
import { createCustomerSchema } from '~/api/customers';
import { apiService } from '~/api/service';

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateCustomerRequest) => {
            return apiService.postData<void, CreateCustomerRequest>(
                '/v1/admin/tenants',
                createCustomerSchema.parse(request)
            );
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['customers'] as const,
            });
        },
    });
};
