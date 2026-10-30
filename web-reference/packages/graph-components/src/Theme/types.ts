import type { GraphColorVariation } from '@brilliant/components';

export type SentimentStatus =
    | 'default'
    | 'positive'
    | 'negative'
    | 'neutral'
    | 'no-data';

export type GraphLimits = {
    limitHigh?: number;
    limitLow?: number;
};

export type SentimentTheme = {
    from: string;
    to: string;
    outline: string;
    text_lightmode: string;
    text_darkmode: string;
};

export type GraphLimitTheme = {
    status: SentimentStatus;
    colors: GraphColorVariation;
};
export type GraphThemeOverride = Partial<GraphColorVariation>;
export type LimitColorsOverride = Partial<
    Record<SentimentStatus, SentimentTheme | undefined>
>;
