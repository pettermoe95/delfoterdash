import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    org_no: z.string().trim().min(1, 'Org no. is required'),
    entra_tenant_id: z.string().trim().uuid('Enter a valid Entra tenant ID'),
});

export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;

export type TenantCustomer = {
    tenant_id: string;
    organization_name: string;
    organization_number: string;
    user_count: number;
    dashboard_count: number;
    graph_count: number;
};
