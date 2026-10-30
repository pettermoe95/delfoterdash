import { z } from 'zod';
import type { DashboardDisplayPayload } from './dashboards';

export const duplicateDashboardResponseSchema = z.object({
    id: z.number().int().positive(),
});

export const createGraphPayloadSchema = z.object({
    display: z.record(z.string(), z.unknown()).optional(),
    name: z.string(),
    type_id: z.number(),
    query: z.record(z.string(), z.unknown()).optional(),
});

export type CreateGraphPayload = z.infer<typeof createGraphPayloadSchema>;

export const createDashboardGraphSchema = z.object({
    name: z.string(),
    type_id: z.number().int().finite(),
    display: z.record(z.string(), z.unknown()).nullable().optional(),
    query: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const graphPositionPayloadSchema = z.object({
    x: z.number().int().finite(),
    y: z.number().int().finite(),
    width: z.number().int().finite(),
    height: z.number().int().finite(),
});

export type GraphPositionPayload = z.infer<typeof graphPositionPayloadSchema>;

export const createDashboardGraphPayloadSchema = z.object({
    graph: createDashboardGraphSchema,
    position: graphPositionPayloadSchema,
});

export type CreateDashboardGraphPayload = z.infer<
    typeof createDashboardGraphPayloadSchema
>;

export type CreateDashboardGraphResponse = {
    id: number;
    name: string;
    type_id: number;
    display?: Record<string, unknown> | null;
    query?: Record<string, unknown> | null;
    position: GraphPositionPayload;
};

export const graphTemplateDetailsSchema = z.object({
    display: z.record(z.string(), z.unknown()).nullable().optional(),
    name: z.string(),
    query: z.record(z.string(), z.unknown()).nullable().optional(),
    type_id: z.number(),
});

export type GraphTemplateDetails = z.infer<typeof graphTemplateDetailsSchema>;

export const dashboardGraphFilterObject = z.object({
    label: z.string(),
    value: z.number(),
});

export type FilterGraphValues = {
    type: string;
    value: string;
    condition: {
        in: [string];
    };
};
export const editGraphSchema = z.object({
    name: z.string(),
    type_id: z.string(),
    query: z.record(z.string(), z.unknown()).nullable().optional(),
    employee_filter: z.array(z.string()).optional(),
    project_filter: z.array(z.string()).optional(),
    customer_filter: z.array(z.string()).optional(),

    filter: z.record(z.string(), z.unknown()).optional(),
});
export type EditGraphValues = z.infer<typeof editGraphSchema>;

export type UpdateGraphPayload = {
    name: string;
    type_id: number;
    query?: Record<string, unknown>;
    employee_filter?: [];
    customer_filter?: [];
    project_filter?: [];
    filter?: FilterGraphValues[];
    display?: DashboardDisplayPayload;
};

export const graphPromptSchema = z.object({
    prompt: z.string().min(1),
});
export type GraphPromptValues = z.infer<typeof graphPromptSchema>;

export const graphPromptResponseSchema = z.object({
    message: z.string(),
    status: z.union([z.literal('success'), z.literal('refusal')]),
    graph_title: z.string().nullable(),
    query: z.record(z.string(), z.any()).nullable(),
    description: z.string().optional(),
});

export type GraphPromptResponse = z.infer<typeof graphPromptResponseSchema>;
export type DashboardGraphFilterObject = z.infer<
    typeof dashboardGraphFilterObject
>;

export const newDataConnector = z.object({
    credential: z.string().min(10, 'API key minimum 10'),
    data_source_id: z.number(),
});

export type NewDataConnector = z.infer<typeof newDataConnector>;
