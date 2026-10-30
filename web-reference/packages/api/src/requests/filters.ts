import z from 'zod';

/* Filter Types and Consts */

export const ALL_FILTER_TYPES = ['IN', 'HAVING', 'BETWEEN', 'DATE'] as const;
export type FilterType = (typeof ALL_FILTER_TYPES)[number];

export const DATA_FILTER_DATE_PERIODS = [
    'DAY',
    'WEEK',
    'MONTH',
    'YEAR',
] as const;
export type GenericDataFilterDatePeriod =
    (typeof DATA_FILTER_DATE_PERIODS)[number];

/**
 * Zod Schemas for Filters
 * */

export const genericDataFilterInSchema = z.object({
    type: z.literal('IN'),
    value: z.string(),
    values: z.array(z.unknown()),
    not: z.boolean().optional(),
});

export const condition = z.object({
    in: z.array(z.string()),
});
export const genericDataFilterGraph = z.object({
    type: z.string(),
    value: z.string(),
    not: z.boolean().optional(),
    condition: condition,
});
export const genericDataFilterHavingSchema = z.object({
    type: z.literal('HAVING'),
    value: z.string(),
    values: z.array(z.unknown()),
});

export const genericDataFilterBetweenSchema = z.object({
    type: z.literal('BETWEEN'),
    value: z.string(),
    from: z.unknown(),
    to: z.unknown(),
});

export const genericDataFilterDate = z.object({
    type: z.literal('DATE'),
    value: z.string(),
    period: z.enum(DATA_FILTER_DATE_PERIODS),
    to_date: z.boolean().optional(),
    offset_year: z.number().optional(),
    offset_month: z.number().optional(),
    offset_day: z.number().optional(),
    exclude_weekend: z.boolean().optional(),
});

export const genericDataFilterSchema = z.union([
    genericDataFilterInSchema,
    genericDataFilterHavingSchema,
    genericDataFilterBetweenSchema,
    genericDataFilterDate,
]);
export const FilterGraphArrayFilter = z.array(genericDataFilterGraph);

export const genericDataFilter = z.object({
    id: z.number(),
    filter_name: z.string(),
    tenant_id: z.string(),
    filters: FilterGraphArrayFilter,
});

/**
 * Filters
 */
export type GenericDataFilterObject = z.infer<typeof genericDataFilter>;
export type GenericDataFilter = z.infer<typeof genericDataFilterSchema>;
export type GenericDataFilterIn = z.infer<typeof genericDataFilterInSchema>;
export type GenericDataFilterHaving = z.infer<
    typeof genericDataFilterHavingSchema
>;
export type GenericDataFilterBetween = z.infer<
    typeof genericDataFilterBetweenSchema
>;
export type GenericDataFilterDate = z.infer<typeof genericDataFilterDate>;
