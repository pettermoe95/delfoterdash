import type { ColorPalette } from '@brilliant/components';
import { primitives } from '@bv/design-tokens';
import type { AnySeries, Series1D, Series2D } from '../../Common/types';
import type {
    AxisGraphSeriesConfig,
    SeriesWithDisplayConfig,
} from '../../Components';

const dashboard = primitives.colors.dashboard;
export type DashboardColor = keyof typeof dashboard;

export const gradientColors = [
    'blue',
    'teal',
    'yellow',
    'red',
    'purple',
    'pink',
    'green',
] as const satisfies DashboardColor[];

export const lineGradientColors = [
    'yellow',
    'red',
    'purple',
    'pink',
    'green',
    'blue',
    'teal',
] as const satisfies DashboardColor[];

type GraphTypeDisplayConfig = {
    colors: (typeof gradientColors)[number][] | string[];
    color?: string;
    icon: string;
    offIcon?: string;
};

const graphTypeDisplayConfig = {
    default: {
        colors: gradientColors,
        icon: 'mdi:square',
        offIcon: 'mdi:square-off-outline',
    },
    line: {
        colors: lineGradientColors,
        icon: 'mdi:chart-line-variant',
        offIcon: 'pepicons-pop:line-x-off',
    },
    bar: {
        colors: gradientColors,
        icon: 'mdi:square',
        offIcon: 'mdi:square-off-outline',
    },
} as const satisfies Record<string, GraphTypeDisplayConfig>;

function isGraphDisplayTypeKey(
    value: string
): value is keyof typeof graphTypeDisplayConfig {
    return value in graphTypeDisplayConfig;
}

export function getGraphTypeDisplayConfig({
    displayType,
}: AnySeries): GraphTypeDisplayConfig {
    if (!displayType || !isGraphDisplayTypeKey(displayType)) {
        return graphTypeDisplayConfig.default;
    }

    const { colors, icon, offIcon } = graphTypeDisplayConfig[displayType];

    const graphTypeDisplayConfigCustom = {
        colors: colors,
        icon,
        offIcon,
    };

    return graphTypeDisplayConfigCustom;
}

export function getGraphLegendConfig(
    series: SeriesWithDisplayConfig<AxisGraphSeriesConfig>
) {
    const color =
        series?.display?.color !== undefined
            ? series.display.color
            : getLegendColor({
                  relativeIndex: series?.relativeIndex ?? 0,
                  displayType: series.displayType,
                  color: series?.color,
              });
    const { icon, offIcon } = getGraphTypeDisplayConfig({
        color: series?.display?.color,
        displayType: series.displayType,
        relativeIndex: series?.relativeIndex ?? 0,
    });
    return {
        color,
        legendIcon: icon,
        offIcon,
    };
}

export function getPieGraphLegendConfig({
    series,
    color,
}: {
    series: Series2D | Series1D;
    color?: string;
}) {
    const legendColor =
        color !== undefined
            ? color
            : getLegendColor({
                  relativeIndex: series?.relativeIndex ?? 0,
                  displayType: series.displayType,
                  color: series?.color,
              });
    const { icon, offIcon } = getGraphTypeDisplayConfig(series);
    return {
        legendColor,
        legendIcon: icon,
        offIcon,
    };
}

export type GradientColor = (typeof gradientColors)[number];

type ColorConfig = Record<
    (typeof gradientColors)[number],
    (typeof dashboard)[keyof typeof dashboard]
>;

export const colorConfig = gradientColors.reduce((acc, color) => {
    acc[color] = dashboard[color];
    return acc;
}, {} as ColorConfig);

type GradientConfig = { from: string; to: string };

export function getLegendColor({
    color,
    displayType,
    relativeIndex,
}: AnySeries) {
    const isDashboardColor = (color: string): color is DashboardColor =>
        Object.prototype.hasOwnProperty.call(dashboard, color);

    const palette = getPaletteFromIndexAndType({
        color,
        displayType,
        relativeIndex,
    });
    return color !== undefined && isDashboardColor(color)
        ? colorConfig[color][600]
        : palette[600];
}

export function getLegendColorByIndex({
    relativeIndex = 0,
    color,
    displayType = 'default',
}: AnySeries) {
    const palette = getPaletteFromIndexAndType({
        color,
        displayType,
        relativeIndex,
    });
    return color ? color : palette[600];
}

export function getGradientConfig(color: GradientColor) {
    const palette = colorConfig[color];
    return {
        from: palette[600],
        to: palette[500],
    } satisfies GradientConfig;
}

function getPaletteFromIndexAndType({
    color,
    displayType = 'default',
    relativeIndex = 0,
}: AnySeries): ColorPalette {
    const validatedTypeConfig = getGraphTypeDisplayConfig({
        color,
        displayType,
        relativeIndex,
    });

    const typeColors = validatedTypeConfig?.colors ?? gradientColors;
    const wrappedIndex = relativeIndex % typeColors.length;
    const wrappedColor = typeColors[wrappedIndex] as GradientColor;
    return colorConfig[wrappedColor];
}
