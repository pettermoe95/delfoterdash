import { Column, Row, ThemeContext } from '@brilliant/components';
import type { DashboardGraphQueryCalculations, GenericData } from '@bv/api';
import type {
    AxisGraphDisplayConfig,
    CalendarGraphDisplayConfig,
    CommonGaugeProgressCylinderGraphDisplay,
    CommonGaugeProgressCylinderGraphDisplayConfig,
    ContinuousDimension,
    DiscreteDimension,
    FunnelGraphSeriesConfig,
    GraphDataSeries1D,
    GraphDataSeries2D,
    GraphDataVector1D,
    GraphDataVector2D,
    PieGraphDisplayConfig,
    ProgressGraphDisplayConfig,
    TableGraphDisplayConfig,
} from '@bv/graph-components';
import {
    AxisGraph,
    CalendarGraph,
    CylinderGraph,
    FunnelGraph,
    GaugeGraph,
    KpiGraph,
    PieGraph,
    ProgressGraph,
    TableGraph,
} from '@bv/graph-components';
import type { LocalizeFn } from '@bv/i18n-utils';
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    buildTimePeriodMaps,
    buildTrendPoints,
    computeSeriesValue,
    getKpiDisplayFlags,
    graphDataFromSeries,
    resolveCommonGraphCompareValue,
    resolveCommonGraphTarget,
    resolveKpiCompareIndex,
    resolveKpiTarget,
    resolveTrendStartIndex,
} from './graphElementUtils';
import {
    genericDataToSeries1D,
    genericDataToSeries2D,
    genericDataToVector1D,
    genericDataToVector2D,
} from './transformation';

type CommonGraphDisplayConfig =
    CommonGaugeProgressCylinderGraphDisplayConfig<CommonGaugeProgressCylinderGraphDisplay>;

type RenderGraphProps = {
    type: string;
    display: Record<string, unknown>;
    data: GenericData;
    className?: string;
    calculations?: DashboardGraphQueryCalculations[];
    localize?: LocalizeFn;
    locale?: string;
};
type RenderGraphFunction = (props: RenderGraphProps) => JSX.Element;

const GRAPH_TYPE_RENDER_MAP: Record<string, RenderGraphFunction> = {
    axis: AxisDashboardGraph,
    calendar: CalendarDashboardGraph,
    funnel: FunnelDashboardGraph,
    gauge: GaugeOrProgressOrCylinderDashboardGraph,
    cylinder: GaugeOrProgressOrCylinderDashboardGraph,
    kpi: KpiDashboardGraph,
    progress: GaugeOrProgressOrCylinderDashboardGraph,
    pie: PieDashboardGraph,
    status: KpiDashboardGraph,
    table: TableDashboardGraph,
};

function NoDataPlaceholder({ localize }: { localize?: LocalizeFn }) {
    const { theme } = useContext(ThemeContext);
    const noDataText =
        localize?.('graphs.noDataMessage') ??
        localize?.('miscTerms.noData') ??
        'No data';

    return (
        <Row width="100%" height="100%" align="flex-end" justify="center">
            <Column style={{ color: theme.colors.text.secondary }} gap="xs">
                <span className="text-center text-sm text-placeholder">
                    {noDataText}
                </span>
            </Column>
        </Row>
    );
}

/**
 * Uses graph, display and data to render the graph using the correct component
 */
export function GraphElement({
    type,
    display,
    data,
    className,
    calculations,
    localize,
    locale,
}: {
    type: string;
    display?: Record<string, unknown>;
    data?: GenericData;
    className?: string;
    calculations?: DashboardGraphQueryCalculations[];
    localize?: LocalizeFn;
    locale?: string;
}): React.JSX.Element {
    const GraphRenderer: RenderGraphFunction | undefined =
        GRAPH_TYPE_RENDER_MAP[type];

    if (data == null || GraphRenderer == null) {
        return <NoDataPlaceholder localize={localize} />;
    }
    return (
        <GraphRenderer
            type={type}
            display={display ?? {}}
            data={data}
            className={className ?? ''}
            calculations={calculations}
            localize={localize}
            locale={locale}
        />
    );
}
/**
 * Axis graph display
 */
function AxisDashboardGraph({
    display,
    data,
    localize,
    locale,
}: RenderGraphProps) {
    const [graphData, setGraphData] =
        useState<GraphDataSeries2D<DiscreteDimension, ContinuousDimension>>();

    useEffect(() => {
        if (data != undefined) {
            setGraphData(genericDataToSeries2D(data));
        }
    }, [data]);

    const axisDisplay = display as AxisGraphDisplayConfig;

    return graphData ? (
        <AxisGraph
            data={graphData}
            display={axisDisplay?.customDisplayOptions}
            barDisplay={axisDisplay?.barDisplay}
            showLegends={true}
            flipAxis={axisDisplay?.flipAxis}
            localize={localize}
            locale={locale}
            showDecimals={axisDisplay?.showDecimals ?? false}
        />
    ) : (
        <NoDataPlaceholder localize={localize} />
    );
}

/**
 * Table graph display
 */

function TableDashboardGraph({ display, data, locale }: RenderGraphProps) {
    const [graphData, setGraphData] =
        useState<GraphDataSeries1D<DiscreteDimension>>();
    useEffect(() => {
        if (data != undefined) {
            setGraphData(genericDataToSeries1D(data));
        }
    }, [data]);
    const tableDisplay = display as TableGraphDisplayConfig;
    return graphData ? (
        <div
            className="block max-w-full overflow-x-scroll overflow-y-scroll"
            style={{ height: '100%' }}
        >
            <TableGraph
                data={graphData}
                key={1}
                stickyHeader={true}
                showSumRow={tableDisplay?.showSumRow ?? true}
                locale={locale}
                showDecimals={tableDisplay?.showDecimals ?? false}
            />
        </div>
    ) : (
        <NoDataPlaceholder />
    );
}

/**
 * Calendar graph display
 */
export function CalendarDashboardGraph({ display, data }: RenderGraphProps) {
    const [graphData, setGraphData] =
        useState<GraphDataVector2D<DiscreteDimension, ContinuousDimension>>();

    useEffect(() => {
        if (data != undefined) {
            const graphData = genericDataToVector2D(data);
            setGraphData(graphData);
        }
    }, [data]);

    const calDisplay = display as CalendarGraphDisplayConfig;
    return graphData ? (
        <CalendarGraph
            data={graphData}
            limitLow={calDisplay?.limitLow}
            limitHigh={calDisplay?.limitHigh}
            hideWeekend={calDisplay?.hideWeekend ?? false}
        />
    ) : (
        <NoDataPlaceholder />
    );
}

/**
 * Gauge/progress dashboard display
 * Handled together due to a very large overlap in behavior
 */
function GaugeOrProgressOrCylinderDashboardGraph({
    display,
    type,
    data,
    localize,
    calculations,
    locale,
}: RenderGraphProps) {
    const commonDisplay = display as CommonGraphDisplayConfig;

    const seriesData = useMemo(() => {
        return data != undefined ? genericDataToSeries2D(data) : undefined;
    }, [data]);

    // Find the target from display.target value or calculation
    const target: number | undefined = useMemo(
        () =>
            resolveCommonGraphTarget({
                commonDisplay,
                seriesData,
                data,
                calculations,
            }),
        [calculations, commonDisplay, data, seriesData]
    );

    const compareValue: number | undefined = useMemo(
        () =>
            resolveCommonGraphCompareValue({
                commonDisplay,
                seriesData,
                data,
                calculations,
            }),
        [calculations, commonDisplay, data, seriesData]
    );

    // Calculate display value
    const graphData = useMemo(() => {
        return graphDataFromSeries(
            seriesData,
            calculations,
            data,
            commonDisplay,
            target,
            compareValue
        );
    }, [calculations, commonDisplay, compareValue, data, seriesData, target]);

    const withinTarget = target ? target * 0.75 : undefined;

    if (graphData === undefined) {
        return <NoDataPlaceholder localize={localize} />;
    }

    if (type == 'gauge') {
        return (
            <GaugeGraph
                key="gauge"
                data={graphData}
                target={target}
                limitLow={commonDisplay?.limitLow ?? withinTarget}
                limitHigh={commonDisplay?.limitHigh ?? target ?? undefined}
                display={commonDisplay}
                localize={localize}
                locale={locale}
                showDecimals={commonDisplay?.showDecimals ?? false}
            />
        );
    } else if (type == 'cylinder') {
        return (
            <CylinderGraph
                key="cylinder"
                data={graphData}
                target={target}
                limitLow={commonDisplay?.limitLow ?? withinTarget}
                limitHigh={commonDisplay?.limitHigh ?? target ?? undefined}
                display={commonDisplay}
                locale={locale}
                showDecimals={commonDisplay?.showDecimals ?? false}
            />
        );
    } else {
        const progressDisplay = display as ProgressGraphDisplayConfig;
        return (
            <ProgressGraph
                key="progress"
                data={graphData}
                target={target}
                limitLow={progressDisplay?.limitLow ?? target}
                limitHigh={progressDisplay?.limitHigh ?? target}
                gradientColors={progressDisplay.gradientColors}
            />
        );
    }
}

/**
 * Pie chart dashboard display
 */
function PieDashboardGraph({
    display,
    data,
    localize,
    locale,
}: RenderGraphProps) {
    const [graphData, setGraphData] =
        useState<GraphDataVector1D<DiscreteDimension>>();

    useEffect(() => {
        if (data != undefined) {
            const graphData = genericDataToVector1D(data);
            setGraphData(graphData);
        }
    }, [data]);

    const pieDisplay = display as PieGraphDisplayConfig;
    return graphData ? (
        <PieGraph
            data={graphData}
            type={pieDisplay?.displayType ?? 'pie'}
            showLabels={pieDisplay?.showLabels ?? true}
            showLegends={pieDisplay?.showLegends ?? true}
            localize={localize}
            locale={locale}
            showDecimals={pieDisplay?.showDecimals ?? false}
        />
    ) : (
        <NoDataPlaceholder localize={localize} />
    );
}

export function KpiDashboardGraph({
    display,
    data,
    calculations,
    localize,
    locale,
}: RenderGraphProps) {
    const commonDisplay = display as CommonGraphDisplayConfig;
    const compareDisplay = commonDisplay?.compare;
    // Feature toggles controlled by display config (default on).
    const { showComparison, showGraph, showGoal } =
        getKpiDisplayFlags(compareDisplay);

    // Build label/period/offset lookups for any calculation-based text.
    const timePeriods = useMemo(() => {
        return buildTimePeriodMaps(calculations);
    }, [calculations]);

    // Convert data to a series model if calculations exist.
    const seriesData = useMemo(() => {
        return data?.calculations?.length
            ? genericDataToSeries2D(data)
            : undefined;
    }, [data]);

    // Aggregate a calculation’s series into a single scalar (sum or average).
    const getSeriesValue = useCallback(
        (values: { x: number; y: number }[] | undefined, calcIndex: number) => {
            const unit =
                data?.calculations?.[calcIndex]?.unit_name ??
                seriesData?.series?.[calcIndex]?.unit;
            const aggregate = calculations?.[calcIndex]?.aggregate ?? '';
            return computeSeriesValue(values, unit, aggregate);
        },
        [calculations, data?.calculations, seriesData?.series]
    );

    // Resolve the KPI goal (target) from display config or fallback series.
    const target: number | undefined = useMemo(() => {
        return resolveKpiTarget({
            commonDisplay,
            seriesData,
            getValue: getSeriesValue,
        });
    }, [commonDisplay, getSeriesValue, seriesData]);

    // Determine which calculation index to compare against.
    const compareIndex = useMemo(() => {
        return resolveKpiCompareIndex(compareDisplay);
    }, [compareDisplay]);

    // Resolve the comparison value (e.g. previous period).
    const compareValue: number | undefined = useMemo(() => {
        if (!showComparison) return undefined;
        const series = data?.calculations?.[compareIndex]?.series?.[0]?.values;
        if (!series || series.length === 0) return undefined;
        return getSeriesValue(series, compareIndex);
    }, [data, compareIndex, getSeriesValue, showComparison]);

    // Decide where the trend series should start (skip target/compare series).
    const trendStartIndex = useMemo(() => {
        return resolveTrendStartIndex({ commonDisplay, data });
    }, [commonDisplay, data]);

    // Build the progress line points with labels, then derive arrays for the graph.
    const trendPoints = useMemo(() => {
        return buildTrendPoints({
            data,
            trendStartIndex,
            labelByIndex: timePeriods.labelByIndex,
        });
    }, [data, timePeriods.labelByIndex, trendStartIndex]);

    const progressLineData = trendPoints.map((point) => point.value);
    const trendLabels = trendPoints.map((point) => point.label);

    // Current value is always calculation[0].
    const currentValue = useMemo(() => {
        const calc = data?.calculations?.[0];
        const y = getSeriesValue(calc?.series?.[0]?.values, 0);

        if (typeof y !== 'number') return 0;

        return y;
    }, [data, getSeriesValue]);

    // Goal is shown only when enabled and numeric.
    const hasGoal =
        showGoal && typeof target === 'number' && !Number.isNaN(target);
    const formattedTarget = hasGoal && target ? target : 0;

    if (!data?.calculations?.length)
        return <NoDataPlaceholder localize={localize} />;

    const compareText =
        typeof compareDisplay === 'object' &&
        compareDisplay !== null &&
        'compareText' in compareDisplay &&
        typeof compareDisplay.compareText === 'string'
            ? compareDisplay.compareText
            : undefined;
    // Period/offset fallback for compare label (e.g. "vs last month").
    const comparePeriod =
        timePeriods.periodByIndex.get(compareIndex) ??
        timePeriods.period?.period ??
        '';
    const compareOffset = timePeriods.offsetByIndex.get(compareIndex) ?? -1;
    const compareToSuffix = compareOffset === 0 ? 'vs this' : 'vs last';

    return (
        <KpiGraph
            target={formattedTarget ?? 0}
            unit={data.calculations[0]?.unit_name ?? ''}
            currentValue={currentValue}
            previousValue={compareValue ?? currentValue}
            progressLineData={progressLineData}
            labels={trendLabels}
            period={compareText ? '' : comparePeriod}
            compareToSuffix={compareText ?? compareToSuffix}
            showComparison={showComparison}
            showGraph={showGraph}
            showGoal={showGoal}
            hasGoal={hasGoal}
            localize={localize}
            locale={locale}
            showDecimals={commonDisplay?.showDecimals ?? false}
        />
    );
}

/**
 * Funnel graph display
 */
function FunnelDashboardGraph({ display, data, locale }: RenderGraphProps) {
    const [graphData, setGraphData] =
        useState<GraphDataSeries2D<DiscreteDimension, ContinuousDimension>>();

    useEffect(() => {
        if (data != undefined) {
            setGraphData(genericDataToSeries2D(data));
        }
    }, [data]);

    const funnelDisplay = display as FunnelGraphSeriesConfig;

    return graphData ? (
        <FunnelGraph
            data={graphData}
            display={funnelDisplay}
            locale={locale}
            showDecimals={display.showDecimals === true}
        />
    ) : (
        <NoDataPlaceholder />
    );
}
