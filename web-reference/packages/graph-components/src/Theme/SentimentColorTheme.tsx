import { primitives } from '@bv/design-tokens';
import type { SentimentStatus, SentimentTheme } from './types';

const palette = primitives.colors.dashboard;
const themePalette = primitives.colors.primary;

type SentimentGradientConfig = Record<SentimentStatus, SentimentTheme>;

const gaugeGradients = {
    default: {
        from: palette.blue[500],
        to: palette.blue[600],
        outline: palette.blue[700],
        text_lightmode: palette.blue[700],
        text_darkmode: palette.yellow[800],
    },
    positive: {
        from: palette.green[500],
        to: palette.green[600],
        outline: palette.green[700],
        text_lightmode: themePalette.success[700],
        text_darkmode: themePalette.success[500],
    },
    negative: {
        from: palette.red[500],
        to: palette.red[600],
        outline: palette.red[700],
        text_lightmode: themePalette.error[700],
        text_darkmode: themePalette.error[500],
    },
    neutral: {
        from: palette.yellow[500],
        to: palette.yellow[600],
        outline: palette.yellow[700],
        text_lightmode: themePalette.warning[700],
        text_darkmode: themePalette.warning[500],
    },
    'no-data': {
        from: primitives.colors.primary.gray[500],
        to: primitives.colors.primary.gray[600],
        outline: primitives.colors.primary.gray[700],
        text_lightmode: primitives.colors.primary.gray[800],
        text_darkmode: primitives.colors.primary.gray[300],
    },
} satisfies SentimentGradientConfig;

const GRADIENT_ID_PREFIX = 'sentiment_gradient';

/**
 * SVG uses reference IDs to apply gradients.
 * These gradients must be placed in the DOM.
 */
export function SentimentColorThemeInjection() {
    function CreateSvgLegendGradient({ status }: { status: SentimentStatus }) {
        const gradientConfig = gaugeGradients[status];
        return (
            <linearGradient
                id={`${GRADIENT_ID_PREFIX}_${status}`}
                gradientTransform="rotate(90)"
                key={status}
            >
                <stop style={{ stopColor: gradientConfig.from }} offset="0%" />
                <stop style={{ stopColor: gradientConfig.to }} offset="1" />
            </linearGradient>
        );
    }
    return (
        <g key={'1'}>
            {[...new Array(...Object.keys(gaugeGradients))].map(
                (status, key) => (
                    <CreateSvgLegendGradient
                        key={key}
                        status={status as SentimentStatus}
                    />
                )
            )}
            {/* Brightness Filter */}
            <filter id={`${GRADIENT_ID_PREFIX}_filter_hover`}>
                <feComponentTransfer>
                    <feFuncR type="linear" slope="1.2" />
                    <feFuncG type="linear" slope="1.2" />
                    <feFuncB type="linear" slope="1.2" />
                </feComponentTransfer>
            </filter>
        </g>
    );
}

export function useSentimentGradientId(status: SentimentStatus) {
    return `url('#${GRADIENT_ID_PREFIX}_${status}')`;
}

export function useSentimentGradient(status: SentimentStatus): SentimentTheme {
    return gaugeGradients[status];
}
