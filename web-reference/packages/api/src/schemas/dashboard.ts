import { z } from 'zod';
import { baseAccountSchema, createdByAccountSchema } from './account';

/**
 * Dashboard constants
 */
export const DASHBOARD_WIDTH = 16;

/**
 * Zod Schemas for Dashboards
 */
export const dashboardGraphTypeSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const dashboardGraphTemplateSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: dashboardGraphTypeSchema,
});

export const dashboardConceptMetricSchema = z.object({
    concept_name: z.string(),
    concept_name_pretty: z.string(),
    hidden: z.boolean().optional(),
});

export const extensiveDashboardConceptMetricSchema =
    dashboardConceptMetricSchema.extend({
        concept_name: z.string(),
        concept_name_pretty: z.string(),
        concept_type: z.string(),
        data_type: z.string(),
        expression: z.string(),
        filters: z.any(),
        label_expression: z.any(),
        unit_name: z.string(),
        hidden: z.boolean().optional(),
    });

export const queryCompareFilterSchema = z.object({
    type: z.literal('compare').default('compare'),
    condition: z.union([
        z.object({ equals: z.union([z.string(), z.number()]) }),
        z.object({
            from: z.union([z.string(), z.number()]),
            to: z.union([z.string(), z.number()]),
        }),
        z.object({ greater_than: z.union([z.string(), z.number()]) }),
        z.object({ less_than: z.union([z.string(), z.number()]) }),
        z.object({ in: z.array(z.union([z.string(), z.number()])) }),
    ]),
    value: z.string().optional(),
    not: z.boolean().optional(),
});

export const queryDateFilterSchema = z.union([
    z.object({
        type: z.literal('date').default('date'),
        condition: z.enum([
            'to_date',
            'to_yesterday',
            'exclude_weekends',
            'only_weekends',
        ]),
        value: z.string().optional(),
        not: z.boolean().optional(),
    }),
    z.object({
        type: z.literal('date').default('date'),
        condition: z.literal('in_period'),
        value: z.string().optional(),
        not: z.boolean().optional(),
        period: z.enum(['year', 'quarter', 'month', 'week', 'day']),
        offset_years: z.number().nullable().optional(),
        offset_months: z.number().nullable().optional(),
        offset_quarters: z.number().nullable().optional(),
        offset_weeks: z.number().nullable().optional(),
        offset_days: z.number().nullable().optional(),
    }),
    z.object({
        type: z.literal('date').default('date'),
        condition: z.literal('in_month'),
        value: z.string().optional(),
        not: z.boolean().optional(),
        month: z.string().optional(),
    }),
]);

export const queryIsNullFilterSchema = z.object({
    type: z.literal('is_null').default('is_null'),
    concept: z.string(),
    not: z.boolean().optional(),
});

export const queryFilterSchema = z.union([
    queryCompareFilterSchema,
    queryDateFilterSchema,
    queryIsNullFilterSchema,
]);

export const conceptSeriesSchema = z.object({
    concept_name: z.string(),
    deictic_modifier: z.number().int().default(0),
    time_period: z.enum(['year', 'quarter', 'month', 'week', 'day']),
});

export const queryCalculationSchema = z.object({
    label: z.string().optional(),
    aggregate: z.string(),
    group: z.array(z.string()).nullable().optional(),
    filter: z.array(queryFilterSchema).nullable().optional(),
    extra_filters: z.array(queryFilterSchema).nullable().optional(),
});

export const queryDomainSchema = z.object({
    group: z.array(z.string()).optional(),
    filter: z.array(queryFilterSchema).nullable().optional(),
    extra_filters: z.array(queryFilterSchema).optional(),
});

export const dashboardGraphQuerySchema = z.object({
    calculations: z.array(queryCalculationSchema),
    domain: queryDomainSchema.optional(),
});

export const dashboardGraphSchema = z.object({
    id: z.number(),
    template_id: z.number().optional(),
    name: z.string(),
    type: dashboardGraphTypeSchema,
    display: z.preprocess(
        (value) => normalizeDashboardDisplay(value),
        z.any().nullable()
    ),
    query: dashboardGraphQuerySchema.optional(),
});

type DashboardDisplayValue =
    | string
    | number
    | boolean
    | null
    | DashboardDisplayValue[]
    | { [key: string]: DashboardDisplayValue };

export const dashboardDisplayValueSchema: z.ZodType<DashboardDisplayValue> =
    z.lazy(() =>
        z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(dashboardDisplayValueSchema),
            z.record(z.string(), dashboardDisplayValueSchema),
        ])
    );

export const dashboardDisplaySchema = z.record(
    z.string(),
    dashboardDisplayValueSchema
);

export function normalizeDashboardDisplay<T>(display: T): T {
    if (Array.isArray(display)) {
        const values: unknown[] = display;
        return values.map((value) => normalizeDashboardDisplay(value)) as T;
    }

    if (display && typeof display === 'object') {
        const normalizedEntries = Object.entries(display).reduce<
            Record<string, unknown>
        >((acc, [key, value]) => {
            if (key === 'friendlyComparetext') {
                if (!('compareText' in (display as Record<string, unknown>))) {
                    acc.compareText = normalizeDashboardDisplay(value);
                }
                return acc;
            }

            acc[key] = normalizeDashboardDisplay(value);
            return acc;
        }, {});

        return normalizedEntries as T;
    }

    return display;
}

const baseLayoutFields = {
    id: z.number(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
};

export const updateDashboardLayoutBatchItemSchema = z.object({
    id: z.number(),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
});

export const dashboardLayoutItemMinimalSchema = z.object({
    ...baseLayoutFields,
});

export const updateDashboardLayoutBatchSchema = z.object({
    layouts: z.array(updateDashboardLayoutBatchItemSchema),
});

export const updateDashboardLayoutBatchResponseSchema = z.object({
    layouts: z.array(dashboardLayoutItemMinimalSchema),
});

export const addDashboardLayoutSchema = z.object({
    ...baseLayoutFields,
    graph_id: z.number().optional(),
    template_id: z.number().optional(),
});

export const dashboardLayoutItemSchema = z.object({
    ...baseLayoutFields,
    graph: dashboardGraphSchema,
});

export const createDashboardSchema = z.object({
    name: z.string().min(5, 'Name must be at least 5 characters long'),
    color: z.string().nullable(),
    icon: z.string().nullable(),
    private: z.boolean(),
    display: dashboardDisplaySchema.optional(),
});

const dashboardPermissionsSchema = z.object({
    read: z.boolean(),
    edit: z.boolean(),
    delete: z.boolean(),
});

export const dashboardItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string().nullable(),
    icon: z.string().nullable(),
    private: z.boolean(),
    display: dashboardDisplaySchema.nullable().optional(),
    updated_at: z.string().datetime(),
    created_at: z.string().datetime(),
    created_by: createdByAccountSchema,
    layout_count: z.number(),
    layout_updated_at: z.string().datetime().nullable(),
    permissions: dashboardPermissionsSchema,
    global_filters: z.array(z.string()),
});

export const dashboardDetailsSchema = dashboardItemSchema.extend({
    layouts: z.array(dashboardLayoutItemSchema),
    created_by: baseAccountSchema,
    permissions: dashboardPermissionsSchema,
    global_filters: z.array(z.string()),
});

export const dashboardShareUserSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
});

export const dashboardShareGroupSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const dashboardSharesSchema = z.object({
    groups: z.array(dashboardShareGroupSchema),
    users: z.array(dashboardShareUserSchema),
});

export const FilterGraph = z.object({
    type: z.string().min(5, 'Name must be at least 5 characters long'),
    value: z.string(),
    condition: z.record(z.string(), z.unknown()).optional(),
});
export const FilterGraphArray = z.array(FilterGraph);
export const FilterGraphPost = z.object({
    filter_name: z.string(),
    id: z.number(),
    tenant_id: z.string(),
    filters: FilterGraphArray,
});

/**
 *  Inferred Dashboard Types
 */
export type DashboardGraphType = z.infer<typeof dashboardGraphTypeSchema>;
export type DashboardGraphTemplate = z.infer<
    typeof dashboardGraphTemplateSchema
>;
export type DashboardGraph = z.infer<typeof dashboardGraphSchema>;
export type DashboardGraphQuery = z.infer<typeof dashboardGraphQuerySchema>;

const axisDisplay = z.object({
    customDisplayOptions: z.record(
        z.string().regex(/^\d+$/),
        z.object({
            displayType: z.string(),
            curveType: z.string(),
            color: z.string(),
            legendText: z.string(),
        })
    ),
    barDisplay: z.string().optional(),
    flipAxis: z.boolean().optional(),
    showDecimals: z.boolean().optional().default(false),
});

const tableDisplaySchema = z
    .object({
        showSumRow: z.boolean().default(true),
        showDecimals: z.boolean().optional().default(false),
    })
    .optional();

const commonDisplay = z.object({
    showDecimals: z.boolean().optional().default(false),
    target: z.union([
        z.object({
            measurement: z.string(),
            target: z.number(),
        }),
        z.object({
            calculation: z.number(),
        }),
    ]),
});

const compareDisplaySchema = z.preprocess(
    (value) => normalizeDashboardDisplay(value),
    z.object({
        isShowingComparison: z.boolean(),
        isShowingGraph: z.boolean().optional(),
        isShowingGoal: z.boolean().optional(),
        calculation: z.number(),
        compareText: z.string(),
        measurement: z.string(),
        type: z.string().optional(),
    })
);

const gaugeKpiDisplay = commonDisplay.extend({
    compare: compareDisplaySchema,
});

const funnelDisplaySchema = z.object({
    color: z.string().optional(),
    colors: z.array(z.string()).optional(),
    showLabelTimePeriod: z.boolean().optional().default(false),
    showDecimals: z.boolean().optional().default(false),
    customDisplayOptions: z.record(
        z.string().regex(/^\d+$/),
        z.object({
            color: z.string(),
        })
    ),
});

const seriesGraphFormatSchema = z.object({
    calculations: z.array(queryCalculationSchema),
    domain: queryDomainSchema.optional(),
    alltimeData: z.boolean(),
});

export const axisGraphFormatSchema = seriesGraphFormatSchema.extend({
    display: axisDisplay,
});

export const gaugeGraphFormatSchema = z.object({
    calculationTimeFilter: queryCalculationSchema.optional(),
    concept: conceptSeriesSchema,
    target: conceptSeriesSchema,
    comparison: conceptSeriesSchema,
    conceptTimeFilter: z.boolean().optional(),
    targetTimeFilter: z.boolean().optional(),
    comparisonTimeFilter: z.boolean().optional(),
    filter: z.array(queryFilterSchema).optional(),
    display: gaugeKpiDisplay,
    alltimeData: z.boolean(),
});

export const cylinderGraphFormatSchema = z.object({
    calculationTimeFilter: queryCalculationSchema.optional(),
    concept: conceptSeriesSchema,
    target: conceptSeriesSchema,
    conceptTimeFilter: z.boolean().optional(),
    targetTimeFilter: z.boolean().optional(),
    filter: z.array(queryFilterSchema).optional(),
    display: commonDisplay,
    alltimeData: z.boolean(),
});

export const funnelGraphFormatSchema = seriesGraphFormatSchema.extend({
    display: funnelDisplaySchema,
});
export const pieGraphFormatSchema = z.object({
    calculationTimeFilter: queryCalculationSchema.optional(),
    concept: conceptSeriesSchema,
    calculations: z.array(queryCalculationSchema).optional(),
    filter: z.array(queryFilterSchema).optional(),
    domain: queryDomainSchema.optional(),
    display: z
        .object({
            displayType: z.enum(['donut', 'pie']).optional(),
            showLegends: z.boolean().optional(),
            showLabels: z.boolean().optional(),
            showDecimals: z.boolean().optional().default(false),
        })
        .optional(),
    alltimeData: z.boolean(),
});

export const statusGraphFormatSchema = z.object({
    calculationTimeFilter: queryCalculationSchema.optional(),
    concept: conceptSeriesSchema,
    target: conceptSeriesSchema,
    comparison: conceptSeriesSchema,
    conceptTimeFilter: z.boolean().optional(),
    targetTimeFilter: z.boolean().optional(),
    comparisonTimeFilter: z.boolean().optional(),
    filter: z.array(queryFilterSchema).optional(),
    domain: queryDomainSchema.optional(),
    display: gaugeKpiDisplay,
    line_graph: conceptSeriesSchema.optional(),
    alltimeData: z.boolean(),
});

export const tableGraphFormatSchema = z.object({
    calculations: z.array(queryCalculationSchema),
    domain: queryDomainSchema.optional(),
    alltimeData: z.boolean(),
    display: tableDisplaySchema,
});

// Runtime schema is intentionally private and used to derive the exported type.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const graphFormatSchema = z.union([
    gaugeGraphFormatSchema,
    cylinderGraphFormatSchema,
    funnelGraphFormatSchema,
    pieGraphFormatSchema,
    statusGraphFormatSchema,
    axisGraphFormatSchema,
    tableGraphFormatSchema,
]);

export type ConceptSeries = z.infer<typeof conceptSeriesSchema>;

export type AxisGraphFormat = z.infer<typeof axisGraphFormatSchema>;
export type GaugeGraphFormat = z.infer<typeof gaugeGraphFormatSchema>;
export type CylinderGraphFormat = z.infer<typeof cylinderGraphFormatSchema>;
export type FunnelGraphFormat = z.infer<typeof funnelGraphFormatSchema>;
export type PieGraphFormat = z.infer<typeof pieGraphFormatSchema>;
export type StatusGraphFormat = z.infer<typeof statusGraphFormatSchema>;
export type TableGraphFormat = z.infer<typeof tableGraphFormatSchema>;
export type GraphFormatUnion = z.infer<typeof graphFormatSchema>;

export type DashboardGraphQueryCalculations = z.infer<
    typeof queryCalculationSchema
>;
export type DashboardGraphQueryDateFilter = z.infer<
    typeof queryDateFilterSchema
>;
export type DomainFilters = z.infer<typeof queryCompareFilterSchema>;
export type DashboardLayoutItem = z.infer<typeof dashboardLayoutItemSchema>;
export type DashboardConceptMetric = z.infer<
    typeof dashboardConceptMetricSchema
>;
export type DashboardGraphQueryDomain = z.infer<typeof queryDomainSchema>;

export type ExtensiveDashboardConceptMetric = z.infer<
    typeof extensiveDashboardConceptMetricSchema
>;

export type AddDashboardLayout = z.infer<typeof addDashboardLayoutSchema>;
export type Dashboard = z.infer<typeof dashboardItemSchema>;
export type DashboardMeta = z.infer<typeof createDashboardSchema>;
export type DashboardDetails = z.infer<typeof dashboardDetailsSchema>;
export type DashboardShareUser = z.infer<typeof dashboardShareUserSchema>;
export type DashboardShareGroup = z.infer<typeof dashboardShareGroupSchema>;

export function normalizeDashboardLayoutItem<T extends DashboardLayoutItem>(
    layout: T
): T {
    return {
        ...layout,
        graph: {
            ...layout.graph,
            display: normalizeDashboardDisplay<unknown>(layout.graph.display),
        },
    };
}

export function normalizeDashboardDetails<T extends DashboardDetails>(
    dashboard: T
): T {
    return {
        ...dashboard,
        layouts: dashboard.layouts.map((layout) =>
            normalizeDashboardLayoutItem(layout)
        ),
    };
}
export type DashboardShares = z.infer<typeof dashboardSharesSchema>;
export type DashboardPermissions = z.infer<typeof dashboardPermissionsSchema>;
export type DashboardPermissionKey = keyof DashboardPermissions;

export type UpdateDashboardLayoutBatchItem = z.infer<
    typeof updateDashboardLayoutBatchItemSchema
>;
export type UpdateDashboardLayoutBatch = z.infer<
    typeof updateDashboardLayoutBatchSchema
>;
export type UpdateDashboardLayoutBatchResponse = z.infer<
    typeof updateDashboardLayoutBatchResponseSchema
>;
export type FilterGraphOptionPost = z.infer<typeof FilterGraphPost>;
