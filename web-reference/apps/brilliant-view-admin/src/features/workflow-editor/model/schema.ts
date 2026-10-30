import { z } from 'zod';
import { databaseConnectionSchema } from './databaseSchema';

export const positionSchema = z.object({
    x: z.number().finite(),
    y: z.number().finite(),
});
export const jobSchema = z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    name: z.string().min(1),
    config: z.record(z.unknown()),
    databaseConnectionId: z.string().min(1).optional(),
    dependencies: z.array(z.string()),
    position: positionSchema,
    // Preserve execution fields the editor does not own, including initial payloads.
    execution: z.record(z.unknown()).default({}),
});
export const incrementalSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('fullLoad') }),
    z.object({
        type: z.literal('rollingWindow'),
        unit: z.enum(['day', 'month', 'year']),
        amount_forward: z.number().int(),
        amount_backward: z.number().int(),
    }),
]);
export const schedulingSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('interval'),
        period: z.enum(['started', 'completed']),
        interval: z
            .number()
            .int()
            .min(60, 'Use an interval of at least 60 seconds.')
            .max(2147483647),
    }),
    z.object({
        type: z.literal('specificTime'),
        time: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm (24-hour time).'),
    }),
]);
const draftIncrementalSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('fullLoad') }).passthrough(),
    z
        .object({
            type: z.literal('rollingWindow'),
            unit: z.enum(['day', 'month', 'year']).optional(),
            amount_forward: z.number().finite().optional(),
            amount_backward: z.number().finite().optional(),
        })
        .passthrough(),
]);
const draftSchedulingSchema = z.discriminatedUnion('type', [
    z
        .object({
            type: z.literal('interval'),
            period: z.enum(['started', 'completed']).optional(),
            interval: z.number().finite().optional(),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('specificTime'),
            time: z.string().optional(),
        })
        .passthrough(),
]);
export const documentSchema = z
    .object({
        version: z.literal(2),
        jobs: z.array(jobSchema),
        databaseConnections: z.array(databaseConnectionSchema).optional(),
        // Keep incomplete settings in drafts; validate them separately before execution.
        incremental: draftIncrementalSchema,
        scheduling: draftSchedulingSchema,
    })
    .superRefine((document, context) => {
        const ids = new Set<string>();
        document.jobs.forEach((job, index) => {
            if (ids.has(job.id))
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['jobs', index, 'id'],
                    message: `Duplicate worker ID: ${job.id}`,
                });
            ids.add(job.id);
        });
        const connectionIds = new Set<string>();
        document.databaseConnections?.forEach((connection, index) => {
            if (connectionIds.has(connection.id))
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['databaseConnections', index, 'id'],
                    message: 'Duplicate database connection ID.',
                });
            connectionIds.add(connection.id);
        });
    });
export type WorkflowDocument = z.infer<typeof documentSchema>;
export type EditorJob = z.infer<typeof jobSchema>;
export const emptyDocument = (): WorkflowDocument => ({
    version: 2,
    jobs: [],
    incremental: { type: 'fullLoad' },
    scheduling: { type: 'interval', period: 'completed', interval: 3600 },
});
