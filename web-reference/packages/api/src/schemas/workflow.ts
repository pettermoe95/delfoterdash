import { z } from 'zod';

export type KeyValuePair = { key: string; value: string };

const recordSchema = z.record(z.string());

const credentialBaseSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    flowId: z.string().uuid('Flow ID must be a UUID.').optional(),
    configuration: recordSchema,
    secrets: recordSchema,
});

export const createCredentialSchema = credentialBaseSchema.extend({
    flowId: z.string().uuid('Flow ID must be a UUID.'),
});

export const updateCredentialSchema = credentialBaseSchema.extend({
    secrets: z.record(z.string()),
});

export type CredentialFormValues = z.infer<typeof credentialBaseSchema>;
export type CreateCredentialFormValues = z.infer<typeof createCredentialSchema>;
export type UpdateCredentialFormValues = z.infer<typeof updateCredentialSchema>;
