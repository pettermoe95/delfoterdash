import {
    useSentimentGradient,
    useSentimentGradientId,
} from './SentimentColorTheme';
import type {
    GraphLimits,
    GraphLimitTheme,
    LimitColorsOverride,
    SentimentStatus,
} from './types';

type UseLimitThemeParams = {
    value?: number;
    limits?: GraphLimits;
    colorsOverride?: LimitColorsOverride;
};

/**
 * Get graph colors based on the current value and limits
 * */
export function useLimitTheme({
    value,
    limits,
}: UseLimitThemeParams): GraphLimitTheme {
    const status = getLimitStatus(value, limits);
    const gradientId = useSentimentGradientId(status);
    const sentimentTheme = useSentimentGradient(status);

    return {
        status,
        colors: {
            stroke: sentimentTheme.outline,
            fill: gradientId,
            text_lightmode: sentimentTheme.text_lightmode,
            text_darkmode: sentimentTheme.text_darkmode,
        },
    };
}

function getLimitStatus(value?: number, limits?: GraphLimits): SentimentStatus {
    if (value === undefined) {
        return 'no-data';
    }
    if (limits?.limitHigh !== undefined && value >= limits?.limitHigh) {
        return 'positive';
    }
    if (limits?.limitLow !== undefined && value < limits.limitLow) {
        return 'negative';
    }
    if (
        limits?.limitLow !== undefined &&
        limits?.limitHigh !== undefined &&
        value >= limits.limitLow &&
        value < limits.limitHigh
    ) {
        return 'neutral';
    }
    return 'default';
}
