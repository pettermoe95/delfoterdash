import type { DashboardGraphQueryCalculations, GenericData } from '@bv/api';
import type {
    CalculationTarget,
    CommonGaugeProgressCylinderGraphDisplay,
    CommonGaugeProgressCylinderGraphDisplayConfig,
    ContinuousDimension,
    DiscreteDimension,
    GraphDataScalar1D,
    GraphDataSeries2D,
} from '@bv/graph-components';
import { extractTimePeriods } from '../utils/extractTimePeriod';

type CommonGraphDisplayConfig =
    CommonGaugeProgressCylinderGraphDisplayConfig<CommonGaugeProgressCylinderGraphDisplay>;

type KpiDisplayFlags = {
    showComparison: boolean;
    showGraph: boolean;
    showGoal: boolean;
};

/**
 * Derives the KPI visibility flags from the compare display config.
 * Defaults all flags to true when not set.
 */
export const getKpiDisplayFlags = (
    compareDisplay: unknown
): KpiDisplayFlags => {
    const compareTarget =
        typeof compareDisplay === 'object' && compareDisplay !== null
            ? (compareDisplay as CalculationTarget)
            : undefined;

    return {
        showComparison: compareTarget?.isShowingComparison ?? true,
        showGraph: compareTarget?.isShowingGraph ?? true,
        showGoal: compareTarget?.isShowingGoal ?? true,
    };
};

/**
 * Builds lookup maps for time period labels, period names, and offsets by
 * calculation index.
 */
export const buildTimePeriodMaps = (
    calculations?: DashboardGraphQueryCalculations[]
) => {
    const periods = extractTimePeriods(calculations);
    const labelByIndex = new Map<number, string>();
    const periodByIndex = new Map<number, string>();
    const offsetByIndex = new Map<number, number>();

    periods.forEach((p) => {
        labelByIndex.set(p.calculationIndex, p.timeLabel);
        periodByIndex.set(p.calculationIndex, p.period);
        offsetByIndex.set(p.calculationIndex, p.offset);
    });

    return {
        period: periods[0],
        labelByIndex,
        periodByIndex,
        offsetByIndex,
    };
};

/**
 * Computes a single scalar for a series based on its unit and aggregate type.
 * Averages rate-like units (percent, rate, ratio, margin) and sums otherwise.
 */
export const computeSeriesValue = (
    values: { x: number; y: number }[] | undefined,
    unit: string | undefined,
    aggregate: string | undefined
) => {
    if (!values || values.length === 0) return undefined;
    if (values.length === 1) return values[0]?.y;

    const aggregateKey = (aggregate ?? '').toLowerCase();
    const shouldAverage =
        unit === '%' ||
        unit === 'pp' ||
        aggregateKey.includes('rate') ||
        aggregateKey.includes('ratio') ||
        aggregateKey.includes('margin') ||
        aggregateKey.includes('percent');

    const sum = values.reduce((total, point) => total + point.y, 0);
    return shouldAverage ? sum / values.length : sum;
};

/**
 * Resolves the target value for gauge/progress/cylinder graphs from display
 * config or fallback calculations.
 */
export const resolveCommonGraphTarget = ({
    commonDisplay,
    seriesData,
    data,
    calculations,
}: {
    commonDisplay: CommonGraphDisplayConfig;
    seriesData:
        | GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
        | undefined;
    data: GenericData;
    calculations?: DashboardGraphQueryCalculations[];
}) => {
    if (commonDisplay.target !== undefined) {
        if (typeof commonDisplay.target === 'number') {
            return commonDisplay.target;
        }

        const displayTarget = commonDisplay.target;
        if (typeof displayTarget.target === 'number') {
            return displayTarget.target;
        }

        if (displayTarget?.calculation !== undefined) {
            try {
                const calcIndex = displayTarget.calculation;
                const targetSeries = seriesData?.series?.[calcIndex];
                const targetAggregate =
                    calculations?.[calcIndex]?.aggregate ??
                    data?.calculations?.[calcIndex]?.aggregate;
                return computeSeriesValue(
                    targetSeries?.values,
                    targetSeries?.unit,
                    targetAggregate
                );
            } catch {
                return undefined;
            }
        }
    }

    // use calculation[1] if display.target is undefined
    if (data?.calculations?.length > 1) {
        const secondSeries = seriesData?.series?.[1];
        const secondAggregate =
            calculations?.[1]?.aggregate ?? data.calculations[1]?.aggregate;
        if (secondSeries?.values?.length) {
            return computeSeriesValue(
                secondSeries.values,
                secondSeries.unit,
                secondAggregate
            );
        }
    }

    return undefined;
};

/**
 * Resolves the compare value for gauge/progress/cylinder graphs from display
 * config or fallback calculations.
 */
export const resolveCommonGraphCompareValue = ({
    commonDisplay,
    seriesData,
    data,
    calculations,
}: {
    commonDisplay: CommonGraphDisplayConfig;
    seriesData:
        | GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
        | undefined;
    data: GenericData;
    calculations?: DashboardGraphQueryCalculations[];
}) => {
    if (typeof commonDisplay.compare === 'number') {
        return commonDisplay.compare;
    }

    const getCompareIndex = (): number | undefined => {
        if (
            typeof commonDisplay.compare === 'object' &&
            commonDisplay.compare !== null &&
            'calculation' in commonDisplay.compare
        ) {
            return commonDisplay.compare.calculation;
        }

        // Fallback: use last calculation if not specified
        if (Array.isArray(seriesData?.series) && seriesData.series.length > 1) {
            return seriesData.series.length - 1;
        }

        return undefined;
    };

    const compareIndex = getCompareIndex();
    if (compareIndex === undefined) {
        return undefined;
    }

    try {
        const compareSeries = seriesData?.series[compareIndex];
        const compareAggregate =
            calculations?.[compareIndex]?.aggregate ??
            data?.calculations?.[compareIndex]?.aggregate;
        return computeSeriesValue(
            compareSeries?.values,
            compareSeries?.unit,
            compareAggregate
        );
    } catch {
        return undefined;
    }
};

/**
 * Resolves the KPI target value from display config or fallback calculations.
 */
export const resolveKpiTarget = ({
    commonDisplay,
    seriesData,
    getValue,
}: {
    commonDisplay: CommonGraphDisplayConfig;
    seriesData:
        | GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
        | undefined;
    getValue: (
        values: { x: number; y: number }[] | undefined,
        calcIndex: number
    ) => number | undefined;
}) => {
    // 1. Manual target: direct number
    if (typeof commonDisplay.target === 'number') {
        return commonDisplay.target;
    }

    // 2. Object-based CalculationTarget
    const displayTarget = commonDisplay.target;

    if (displayTarget) {
        // 2a. Target explicitly set as a number
        if (typeof displayTarget.target === 'number') {
            return displayTarget.target;
        }

        // 2b. Target set by calculation index
        const values = seriesData?.series?.[displayTarget.calculation]?.values;
        return getValue(values, displayTarget.calculation);
    }

    // 3. Fallback: if the target is not defined, use last calculation (assumed goal)
    const fallbackSeries = seriesData?.series;
    if (fallbackSeries && fallbackSeries.length > 1) {
        const last = fallbackSeries[fallbackSeries.length - 1];
        const lastIndex = fallbackSeries.length - 1;
        return getValue(last?.values, lastIndex);
    }

    return undefined;
};

/**
 * Determines which calculation index to use for KPI comparison.
 */
export const resolveKpiCompareIndex = (compareDisplay: unknown) => {
    if (
        typeof compareDisplay === 'object' &&
        compareDisplay !== null &&
        'calculation' in compareDisplay &&
        typeof compareDisplay.calculation === 'number'
    ) {
        return compareDisplay.calculation;
    }

    return 1;
};

/**
 * Determines which calculation index marks the start of the KPI progress line.
 */
export const resolveTrendStartIndex = ({
    commonDisplay,
    data,
}: {
    commonDisplay: CommonGraphDisplayConfig;
    data: GenericData | undefined;
}) => {
    const displayTarget = commonDisplay.target as CalculationTarget;
    if (
        displayTarget &&
        typeof displayTarget === 'object' &&
        'calculation' in displayTarget &&
        typeof displayTarget.calculation === 'number'
    ) {
        return displayTarget.calculation + 1;
    }

    const compareDisplay = commonDisplay.compare as CalculationTarget;
    if (
        compareDisplay &&
        typeof compareDisplay === 'object' &&
        'calculation' in compareDisplay &&
        typeof compareDisplay.calculation === 'number' &&
        compareDisplay.calculation === 1 &&
        (data?.calculations?.length ?? 0) > 3
    ) {
        return 3;
    }

    return 2;
};

/**
 * Builds the labeled trend points for the KPI progress line.
 */
export const buildTrendPoints = ({
    data,
    trendStartIndex,
    labelByIndex,
}: {
    data: GenericData | undefined;
    trendStartIndex: number;
    labelByIndex: Map<number, string>;
}) => {
    if (!data?.calculations || data.calculations.length === 0) return [];

    const trendCalculations = data.calculations.slice(trendStartIndex);
    const points = trendCalculations
        .map((calc, idx) => {
            const calcIndex = idx + trendStartIndex;
            const value = calc.series?.[0]?.values?.[0]?.y;
            if (typeof value !== 'number') return null;
            return {
                value,
                label: labelByIndex.get(calcIndex) ?? '',
            };
        })
        .filter(
            (point): point is { value: number; label: string } => point !== null
        );

    return points.reverse(); // oldest first
};

export const graphDataFromSeries = (
    seriesData:
        | GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
        | undefined,
    calculations: DashboardGraphQueryCalculations[] | undefined,
    data: GenericData | undefined,
    commonDisplay: CommonGraphDisplayConfig,
    target: number | undefined,
    compareValue: number | undefined
): GraphDataScalar1D<ContinuousDimension> | undefined => {
    if (seriesData != undefined) {
        const primarySeries = seriesData.series[0];
        const primaryAggregate =
            calculations?.[0]?.aggregate ?? data?.calculations?.[0]?.aggregate;
        const value =
            computeSeriesValue(
                primarySeries?.values,
                primarySeries?.unit,
                primaryAggregate
            ) ?? 0;

        return {
            value: value,
            compareValue: compareValue,
            graphConfig: commonDisplay,
            domain: {
                min: commonDisplay?.min ?? 0,
                max: commonDisplay?.max ?? (target ?? value) * 1.25,
                name: primarySeries?.name,
                unit: primarySeries?.unit,
            },
        };
    }
    return undefined;
};
