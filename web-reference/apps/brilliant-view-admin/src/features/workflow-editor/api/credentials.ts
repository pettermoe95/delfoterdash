import { useQuery } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import { z } from 'zod';

const credentialsSchema = z.array(
    z.object({ id: z.string(), name: z.string(), flow_name: z.string() })
);
const credentialQuery = (tenantId: string) => ({
    queryKey: ['credentials', tenantId] as const,
    queryFn: async () =>
        credentialsSchema.parse(
            await apiService.getData(`/v1/admin/credentials/list/${tenantId}`)
        ),
    enabled: !!tenantId,
    staleTime: 600000,
});
const apiKeyCredentials = (credentials: z.infer<typeof credentialsSchema>) =>
    credentials.filter((credential) => credential.flow_name === 'API Key');

export function useCredentials(tenantId: string) {
    return useQuery(credentialQuery(tenantId));
}
export function useDatabaseCredentials(tenantId: string) {
    return useQuery({
        ...credentialQuery(tenantId),
        select: apiKeyCredentials,
    });
}
