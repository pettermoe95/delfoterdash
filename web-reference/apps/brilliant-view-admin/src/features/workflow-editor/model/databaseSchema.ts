import { z } from 'zod';

// Connections may contain incomplete drafts, just like worker configurations.
export const databaseConnectionSchema = z.object({
    id: z.string().min(1),
    name: z.string(),
    config: z.record(z.unknown()),
});
export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;
