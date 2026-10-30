import z from 'zod';
import { syntaxErrorSchema } from './tokenization';

/**
 * Zod Schemas for Generic Data
 */
export const dataArraySchema = z.array(z.string()).or(z.array(z.number()));

export const genericDataSeriesSchema = z.object({
    size: z.number(),
    label: z.string(),
    values: z.array(
        z.object({
            x: z.number(),
            y: z.number(),
        })
    ),
});

export const genericDataColumnSchema = z.object({
    column_name: z.string(),
    column_type: z.string(),
});

const genericDataDomainValue = z.object({
    x: z.number(),
    label: z.string(),
    data: z.array(
        z.object({
            label: z.string().optional(),
            value: z.unknown(),
            sort_value: z.union([z.string(), z.number()]),
        })
    ),
});

export const genericDataDomainSchema = z.object({
    size: z.number(),
    values: z.array(genericDataDomainValue),
    colors: z.array(z.string()).optional(),
    label: z.string(),
    group: z.array(z.string()),
});

export const genericDataCalculationSchema = z.object({
    label: z.string().optional(),
    aggregate: z.string(),
    size: z.number(),
    group: z.array(z.string()),
    series: z.array(genericDataSeriesSchema),
    unit_name: z.string(),
});

export const genericDataSchema = z.object({
    domain: genericDataDomainSchema,
    calculations: z.array(genericDataCalculationSchema),
});

export const genericDataResponseSchema = z.object({
    valid: z.boolean(),
    data: genericDataSchema.optional(),
    syntax_error: syntaxErrorSchema.optional(),
    error_message: z.string().optional(),
});

/**
 * Inferred Types for Generic Data
 */
export type DataArray = z.infer<typeof dataArraySchema>;

export type GenericDataSeries = z.infer<typeof genericDataSeriesSchema>;
export type GenericDataColumn = z.infer<typeof genericDataColumnSchema>;
export type GenericDataDomain = z.infer<typeof genericDataDomainSchema>;
export type GenericDataDomainValue = z.infer<typeof genericDataDomainValue>;
export type GenericDataCalculation = z.infer<
    typeof genericDataCalculationSchema
>;

export type GenericData = z.infer<typeof genericDataSchema>;
export type GenericDataResponse = z.infer<typeof genericDataResponseSchema>;
