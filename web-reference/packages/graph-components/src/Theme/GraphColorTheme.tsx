import type { BarSeriesConfig, SeriesWithDisplayConfig } from '../Components';
import type { DashboardColor } from './Config/config';
import { getGradientConfig, gradientColors } from './Config/config';

/**
 * SVG uses reference IDs to apply gradients.
 * These gradients must be placed in the DOM.
 */
export function GraphColorThemeInjection() {
    return (
        <g>
            {gradientColors.map((color, index) => (
                <SvgLegendGradient color={color} key={index} />
            ))}
            {/* Brightness Filter */}
            <filter id="legend_filter_hover">
                <feComponentTransfer>
                    <feFuncR type="linear" slope="1.2" />
                    <feFuncG type="linear" slope="1.2" />
                    <feFuncB type="linear" slope="1.2" />
                </feComponentTransfer>
            </filter>
        </g>
    );
}

function SvgLegendGradient(props: { color: DashboardColor }) {
    const gradientConfig = getGradientConfig(props.color);

    return (
        <linearGradient
            id={`legend_gradient_${props.color}`}
            gradientTransform="rotate(90)"
        >
            <stop style={{ stopColor: gradientConfig.from }} offset="0%" />
            <stop style={{ stopColor: gradientConfig.to }} offset="1" />
        </linearGradient>
    );
}

export function getLegendSvgColor(
    series: SeriesWithDisplayConfig<BarSeriesConfig>,
    gradientColors: DashboardColor[]
): string {
    const { displayType, relativeIndex, display } = series;
    const { legendIndex, color } = display;
    const seriesIndex = legendIndex ?? relativeIndex;

    if (display) {
        const typeColors = displayType === 'bar' ? gradientColors : '';
        const wrappedIndex = seriesIndex % typeColors.length;

        const defaultColor =
            color !== undefined && color.length > 0
                ? color
                : typeColors[wrappedIndex];

        return `url(#legend_gradient_${defaultColor})`;
    }

    return `url(#legend_gradient_${gradientColors[seriesIndex % gradientColors.length]})`;
}

// TODO: Check if this function should be removed
// noinspection JSUnusedGlobalSymbols
export function getLegendHoverFilter(hover = false) {
    return hover ? `url(#legend_filter_hover)` : undefined;
}
