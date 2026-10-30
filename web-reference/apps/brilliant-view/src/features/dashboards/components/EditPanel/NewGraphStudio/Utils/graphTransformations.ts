import type {
    AxisGraphFormat,
    ConceptSeries,
    CylinderGraphFormat,
    DashboardGraphQuery,
    DashboardGraphQueryCalculations,
    DashboardGraphType,
    DashboardLayoutItem,
    FunnelGraphFormat,
    GaugeGraphFormat,
    GraphFormatUnion,
    PieGraphFormat,
    StatusGraphFormat,
    TableGraphFormat,
} from '@bv/api';
import { queryCalculationSchema, queryDateFilterSchema } from '@bv/api';
import { DateInPeriodFilter, PeriodType } from '~/filters/filters';
import { axisFormatToQuery } from './axisUtils';
import type { LocalizeFn } from './compareTextUtils';
import { cylinderFormatToQuery } from './cylinderUtils';
import { funnelFormatToQuery } from './funnelUtils';
import { gaugeFormatToQuery } from './gaugeUtils';
import { GraphTypeId } from './graphTypeIds';
import {
    isValidInPeriod,
    readNumericOffset,
} from './offsetAndPeriodFilterHelpers';
import { pieFormatToQuery } from './pieUtils';
import { statusFormatToQuery } from './statusUtils';
import { tableFormatToQuery } from './tableUtils';

export function buildCalculation(
    series: ConceptSeries,
    useTimeFilter: boolean,
    original?: DashboardGraphQueryCalculations
): DashboardGraphQueryCalculations {
    const base: DashboardGraphQueryCalculations = {
        aggregate: series.concept_name,
    };

    if (useTimeFilter) {
        const offset = series.deictic_modifier;
        base.filter = [
            queryDateFilterSchema.parse(
                new DateInPeriodFilter(
                    PeriodType.fromTypeName(series.time_period),
                    offset ?? 0
                ).toQueryFilter()
            ),
        ];
    }

    if (original) {
        const originalPeriod = original.filter?.find(isValidInPeriod);
        const periodUnchanged =
            useTimeFilter &&
            originalPeriod?.period === series.time_period &&
            (readNumericOffset(originalPeriod) ?? 0) ===
                series.deictic_modifier;
        const filters = periodUnchanged
            ? original.filter
            : [
                  ...(original.filter ?? []).filter(
                      (filter) => !isValidInPeriod(filter)
                  ),
                  ...(base.filter ?? []),
              ];
        return queryCalculationSchema.parse({
            ...original,
            aggregate: series.concept_name,
            filter: filters,
        });
    }

    return queryCalculationSchema.parse(base);
}

export function showAlltimeData(
    calculations: DashboardGraphQueryCalculations[] | null | undefined
): DashboardGraphQueryCalculations[] {
    if (!Array.isArray(calculations)) return [];
    return calculations.map((calc) => {
        const { filter: _ignoredFilter, ...rest } = calc;
        return queryCalculationSchema.parse(rest);
    });
}

/**
 * Extracts a concept-series representation from a calculation's aggregate and optional date filter.
 */
export function conceptFromCalculation(
    calc: DashboardGraphQueryCalculations,
    targetConcept?: boolean
): ConceptSeries {
    const aggregate = calc?.aggregate;

    const dateFilter = Array.isArray(calc?.filter)
        ? calc.filter.find(isValidInPeriod)
        : undefined;

    return {
        concept_name: aggregate ?? '',
        deictic_modifier:
            readNumericOffset(dateFilter) ?? (targetConcept ? -1 : 0),
        time_period: dateFilter?.period ?? 'year',
    };
}

export function isAlltimeData(
    calculations: DashboardGraphQueryCalculations[] | null | undefined
): boolean {
    if (!Array.isArray(calculations)) return true;
    return !calculations.some(
        (c) => Array.isArray(c?.filter) && c.filter.length > 0
    );
}

type LayoutTransformer = {
    type: { id: GraphTypeId; name: string };
    toQuery: (
        graphData: GraphFormatUnion,
        localize: LocalizeFn
    ) => DashboardGraphQuery;
    prepareDisplay?: (
        graphData: GraphFormatUnion
    ) => DashboardLayoutItem['graph']['display'];
};

function getTransformerQuery(
    transformer: LayoutTransformer,
    graphData: GraphFormatUnion,
    localize: LocalizeFn
): DashboardGraphQuery {
    return transformer.toQuery(graphData, localize);
}

function getTransformerDisplay(
    transformer: LayoutTransformer,
    graphData: GraphFormatUnion
): unknown {
    return transformer.prepareDisplay?.(graphData);
}

const layoutTransformers = {
    [GraphTypeId.axis]: {
        type: { id: GraphTypeId.axis, name: 'axis' },
        toQuery: (graphData: GraphFormatUnion) =>
            axisFormatToQuery(graphData as AxisGraphFormat),
        prepareDisplay: (graphData: GraphFormatUnion) =>
            (graphData as AxisGraphFormat).display,
    },
    [GraphTypeId.gauge]: {
        type: { id: GraphTypeId.gauge, name: 'gauge' },
        toQuery: (graphData: GraphFormatUnion, localize: LocalizeFn) =>
            gaugeFormatToQuery(graphData as GaugeGraphFormat, localize),
        prepareDisplay: (graphData: GraphFormatUnion) => {
            const baseDisplay = (graphData as GaugeGraphFormat).display;
            return baseDisplay ? { ...baseDisplay } : undefined;
        },
    },
    [GraphTypeId.cylinder]: {
        type: { id: GraphTypeId.cylinder, name: 'cylinder' },
        toQuery: (graphData: GraphFormatUnion) =>
            cylinderFormatToQuery(graphData as CylinderGraphFormat),
        prepareDisplay: (graphData: GraphFormatUnion) => {
            const baseDisplay = (graphData as CylinderGraphFormat).display;
            return baseDisplay ? { ...baseDisplay } : undefined;
        },
    },
    [GraphTypeId.pie]: {
        type: { id: GraphTypeId.pie, name: 'pie' },
        toQuery: (graphData: GraphFormatUnion) =>
            pieFormatToQuery(graphData as PieGraphFormat),
        prepareDisplay: (graphData: GraphFormatUnion) => {
            const { display } = graphData as PieGraphFormat;
            return display ? { ...display } : undefined;
        },
    },
    [GraphTypeId.status]: {
        type: { id: GraphTypeId.status, name: 'status' },
        toQuery: (graphData: GraphFormatUnion, localize: LocalizeFn) =>
            statusFormatToQuery(graphData as StatusGraphFormat, localize),
        prepareDisplay: (graphData: GraphFormatUnion) => {
            const baseDisplay = (graphData as StatusGraphFormat).display;
            return baseDisplay ? { ...baseDisplay } : undefined;
        },
    },
    [GraphTypeId.table]: {
        type: { id: GraphTypeId.table, name: 'table' },
        toQuery: (graphData: GraphFormatUnion) =>
            tableFormatToQuery(graphData as TableGraphFormat),
        prepareDisplay: (graphData: GraphFormatUnion) => {
            const { display } = graphData as TableGraphFormat;
            return display ? { ...display } : undefined;
        },
    },
    [GraphTypeId.funnel]: {
        type: { id: GraphTypeId.funnel, name: 'funnel' },
        toQuery: (graphData: GraphFormatUnion) =>
            funnelFormatToQuery(graphData as FunnelGraphFormat),
        prepareDisplay: (graphData: GraphFormatUnion) =>
            (graphData as FunnelGraphFormat).display,
    },
} as Record<GraphTypeId, LayoutTransformer>;

function buildLayoutFromFormat(
    graphData: GraphFormatUnion,
    layout: DashboardLayoutItem,
    transformer: LayoutTransformer,
    localize: LocalizeFn
): DashboardLayoutItem {
    const graphType = transformer.type;
    const nextGraph = {
        id: layout.graph.id,
        name: layout.graph.name,
        type: { id: graphType.id, name: graphType.name },
        query: getTransformerQuery(transformer, graphData, localize),
    };
    const display: unknown = getTransformerDisplay(transformer, graphData);

    return {
        id: layout.id,
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        graph: {
            ...nextGraph,
            ...(display !== undefined ? { display } : {}),
        },
    };
}

export function graphFormatToLayout(
    graphData: GraphFormatUnion,
    layout: DashboardLayoutItem | undefined,
    graphTypeId: DashboardGraphType['id'] | undefined,
    localize: LocalizeFn
) {
    if (!layout || graphTypeId === undefined) {
        return {} as DashboardLayoutItem;
    }
    const transformer = layoutTransformers[graphTypeId as GraphTypeId];

    if (!transformer) {
        return {} as DashboardLayoutItem;
    }

    return buildLayoutFromFormat(graphData, layout, transformer, localize);
}

export function graphFormatToQuery(
    graphData: GraphFormatUnion,
    graphTypeId: DashboardGraphType['id'] | undefined,
    localize: LocalizeFn
) {
    if (graphTypeId === undefined) {
        return {} as DashboardGraphQuery;
    }

    const transformer = layoutTransformers[graphTypeId as GraphTypeId];

    if (!transformer) {
        return {} as DashboardGraphQuery;
    }

    return transformer.toQuery(graphData, localize);
}
