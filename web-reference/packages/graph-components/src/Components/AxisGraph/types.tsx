import type { AnySeries, Series2D } from '../..';
import type { DashboardColor } from '../../Theme';

// Supported display types
export type AxisGraphDisplayType = 'bar' | 'line';

// Common for all configs
type DisplayTypeConfig<T extends AxisGraphDisplayType> = {
    displayType: T;
    legendIndex?: number;
    // Keep the palette type visible while allowing custom color strings.
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    color?: string | DashboardColor;
    colors?: string[] | DashboardColor[];
    legendText?: string;
};

// ===================================== //
//             Line Series               //
// ===================================== //
export type BarDisplayMode = 'group' | 'stack';
export type BarSeriesConfig = DisplayTypeConfig<'bar'> & {
    groupMode?: BarDisplayMode;
};

// ===================================== //
//             Line Series               //
// ===================================== //
export type LineCurveType = 'linear' | 'step' | 'catmullRom';
export type LineSeriesConfig = DisplayTypeConfig<'line'> & {
    curveType?: LineCurveType;
};

// ===================================== //
//             Config Type               //
// ===================================== //

/**
 * This type handles the configuration for how series are displayed
 * in the axis graph. Each display type can have a separate config
 * which is inferred based on the display type. This type is sent to
 * the axis graph to determine how the provided data should be rendered.
 *
 * For instance, this is valid:
 *
 * ```
 * {
 *  displayType: 'line',
 *  curveType: 'linear',
 * }
 * ```
 *
 * Whereas this is not:
 * ```
 * {
 *  displayType: 'bar',
 *  curveType: 'linear', // Not valid
 * }
 * ```
 */
export type AxisGraphSeriesConfig = BarSeriesConfig | LineSeriesConfig;

/**
 * The type is parsed created by the axis graph and passed down to each
 * renderer to display the data appropriately.
 */
export type SeriesWithDisplayConfig<T extends AxisGraphSeriesConfig> =
    AnySeries & {
        name: string;
        series: Series2D;
        display: T;
        // Whether the series is currently hidden
        hidden: boolean;
        legendText: string;
        // Index of data series
        // Used to decide color if no color is defined
        index: number;
        relativeIndex: number;
    };

export type AxisGraphSeriesConfigs = Record<string, AxisGraphSeriesConfig>;
