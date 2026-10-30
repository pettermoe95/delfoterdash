import type { Series2D } from '../../Common/types';
import { colorConfig, getLegendColorByIndex } from '../../Theme';
import type { FunnelGraphProps } from './FunnelGraph';
import type { FunnelGraphSeriesConfig } from './types';

export function sumSeriesValues(series: Series2D) {
    return series.values?.reduce((sum, point) => sum + point.y, 0) ?? 0;
}

export function resolveDashboardColor(color?: string) {
    if (!color) return undefined;
    return Object.prototype.hasOwnProperty.call(colorConfig, color)
        ? colorConfig[color as keyof typeof colorConfig][600]
        : undefined;
}

export function isSeriesDisplayConfig(
    display: FunnelGraphProps['display']
): display is FunnelGraphSeriesConfig {
    const keys: (keyof FunnelGraphSeriesConfig | 'customDisplayOptions')[] = [
        'colors',
        'color',
        'showLabelTimePeriod',
        'legendText',
        'customDisplayOptions',
    ];
    return Boolean(
        display &&
            typeof display === 'object' &&
            keys.some((key) => key in display)
    );
}

export function getDisplayConfig(
    display: FunnelGraphProps['display'],
    series: Series2D,
    index: number
): FunnelGraphSeriesConfig | undefined {
    if (!display) return undefined;
    if (isSeriesDisplayConfig(display)) {
        const custom = (
            display as FunnelGraphSeriesConfig & {
                customDisplayOptions?: Record<string, FunnelGraphSeriesConfig>;
            }
        ).customDisplayOptions;
        if (custom) {
            const byName = series.name ? custom[series.name] : undefined;
            const byIndex = custom[String(index)];
            return byName ?? byIndex ?? display;
        }
        return display;
    }
    const displayByKey = display;
    const byName = series.name ? displayByKey[series.name] : undefined;
    const byIndex = displayByKey[String(index)];
    return byName ?? byIndex;
}

export function getStepColor(
    series: Series2D,
    index: number,
    display?: FunnelGraphProps['display']
) {
    const rootDisplay = isSeriesDisplayConfig(display) ? display : undefined;
    const rootColors = rootDisplay?.colors;
    const seriesDisplay = getDisplayConfig(display, series, index);
    const displayColor =
        rootColors?.[index] ??
        seriesDisplay?.colors?.[index] ??
        seriesDisplay?.color ??
        rootDisplay?.color ??
        series.color;
    const resolvedDashboardColor = resolveDashboardColor(
        typeof displayColor === 'string' ? displayColor : undefined
    );
    if (resolvedDashboardColor) {
        return resolvedDashboardColor;
    }

    if (typeof displayColor === 'string' && displayColor.length > 0) {
        return displayColor;
    }

    return getLegendColorByIndex({
        relativeIndex: series.relativeIndex ?? index,
        color: series.color,
    });
}

export function stripTimePeriodSuffix(label: string) {
    return label
        .replace(
            /\s+(this|last|\d+\s+ago)\s+(year|quarter|month|week|day)s?$/i,
            ''
        )
        .trim();
}

export function splitTimePeriodLabel(label: string): {
    concept: string;
    timePeriod?: string;
} {
    const match =
        /(.*)\s+(this|last|\d+\s+ago)\s+(year|quarter|month|week|day)s?$/i.exec(
            label
        );
    if (!match) {
        return { concept: label.trim() };
    }

    const concept = match[1]?.trim() ?? '';
    const timePeriod = `${match[2]} ${match[3]}`.trim();
    return { concept, timePeriod };
}
