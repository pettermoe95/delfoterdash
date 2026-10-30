import z from 'zod';
import { queryFilterSchema } from './dashboard';

const conceptSourceSchema = z
    .object({
        tenant_default: z.number().optional(),
        global_default: z.number().optional(),
        tenant_override: z.number().optional(),
    })
    .strict()
    .optional();

export const conceptTypeSchema = z.enum(['field', 'metric']);
export type ConceptType = z.infer<typeof conceptTypeSchema>;

// Runtime schema is intentionally private and used to derive the exported type.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const conceptSchema = z.object({
    concept_name: z.string(),
    concept_name_pretty: z.string(),
    description: z.string().optional(),
    concept_type: conceptTypeSchema,
    expression: z.string(),
    filters: z.array(queryFilterSchema).optional(),
    label_expression: z.string().optional(),
    source: conceptSourceSchema,
    unit_name: z.string().optional(),
    hidden: z.boolean().optional(),
});

export const conceptPayloadSchema = z.object({
    expression: z.string(),
    label_expression: z.string().optional(),
    description: z.string().optional(),
    concept_name: z.string(),
    concept_name_pretty: z.string(),
    unit_name: z.string().nullable().optional(),
    hidden: z.boolean().optional(),
    concept_type: conceptTypeSchema,
    filters: z.array(queryFilterSchema).optional(),
});

export const validateConceptExpressionResponseSchema = z.object({
    valid: z.boolean(),
    message: z.string(),
});

export const validateConceptExpressionRequestSchema = z.object({
    type: z.string(),
    expression: z.string(),
});

const conceptUsageDashboardSchema = z.object({
    dashboard_id: z.number(),
    dashboard_name: z.string(),
    graph_count: z.number(),
});

const conceptUsageGlobalFilterSchema = z.object({
    dashboard_id: z.number().optional(),
    dashboard_name: z.string().optional(),
    filter_name: z.string(),
});

const conceptUsageConceptSchema = z.object({
    concept_name: z.string(),
});

export const conceptStatsSchema = z.object({
    dashboard_graphs: z.array(conceptUsageDashboardSchema),
    global_filters: z.array(conceptUsageGlobalFilterSchema),
    concepts: z.array(conceptUsageConceptSchema),
});

export const conceptStatsRequestSchema = z.object({
    concept_name: z.string(),
});

export type ConceptStats = z.infer<typeof conceptStatsSchema>;
export type ConceptStatsRequest = z.infer<typeof conceptStatsRequestSchema>;

export type Concept = z.infer<typeof conceptSchema>;
export type ConceptPayload = z.infer<typeof conceptPayloadSchema>;
export type ValidateConceptExpressionRequest = z.infer<
    typeof validateConceptExpressionRequestSchema
>;
export type ValidateConceptExpressionResponse = z.infer<
    typeof validateConceptExpressionResponseSchema
>;

export const conceptFieldValueSchema = z.object({
    label: z.string(),
    value: z.unknown(),
});
export type ConceptFieldValue = z.infer<typeof conceptFieldValueSchema>;
