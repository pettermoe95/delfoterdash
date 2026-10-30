import type { AxisGraphSeriesConfig } from '../Components/AxisGraph/types';

export type AxisGraphDisplayConfig = {
    series?: AxisGraphSeriesConfig[];
    defaultSeries?: AxisGraphSeriesConfig;
    barDisplay?: 'group' | 'stack';
    flipAxis?: boolean;
    showDecimals?: boolean;
    customDisplayOptions?: Record<string, AxisGraphSeriesConfig>;
};

export type CalendarGraphDisplayConfig = {
    limitLow?: number;
    limitHigh?: number;
    hideWeekend?: boolean;
};

export type CalculationTarget = {
    calculation: number;
    reduction: 'sum';
    measurement?: string;
    target?: number;
    compareMethod?: 'subtract' | 'percentage';
    compareText?: string;
    isShowingComparison?: boolean;
    isShowingGraph?: boolean;
    isShowingGoal?: boolean;
};

export type CommonGaugeProgressCylinderGraphDisplay = {
    displayType?: 'gauge' | 'progress' | 'cylinder';
    color?: string;
};

export type CommonGaugeProgressCylinderGraphDisplayConfig<
    T extends CommonGaugeProgressCylinderGraphDisplay,
> = {
    min: number;
    max: number;
    limitLow?: number;
    limitHigh?: number;
    target?: number | CalculationTarget;
    compare?: number | CalculationTarget;
    format?: 'pretty' | 'raw';
    showDecimals?: boolean;
    display?: T;
    color?: string;
};

export type ProgressGraphDisplayConfig =
    CommonGaugeProgressCylinderGraphDisplayConfig<CommonGaugeProgressCylinderGraphDisplay> & {
        gradientColors?: [string, string];
    };

type PieGraphDisplay = {
    colors?: string[];
    color?: string;
    displayType?: 'donut' | 'pie';
    relativeIndex?: number;
};

export type PieGraphDisplayConfig = {
    displayType: 'donut' | 'pie';
    showLegends: boolean;
    showLabels: boolean;
    showDecimals?: boolean;
    display?: PieGraphDisplay;
};

export type TableGraphDisplayConfig = {
    showSumRow?: boolean;
    showDecimals?: boolean;
};
