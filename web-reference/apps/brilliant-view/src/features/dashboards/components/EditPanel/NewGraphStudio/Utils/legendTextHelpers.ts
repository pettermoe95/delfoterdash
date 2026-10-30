import type { DashboardConceptMetric, DashboardLayoutItem } from '@bv/api';
import { normalizeDashboardDisplay } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import type { LocalizeFn } from './compareTextUtils';
import type { GraphCalculation } from './textHelpers';
import {
    findDateFilter,
    formatDateFilterLabel,
    getMetricDisplayName,
} from './textHelpers';

type BuildLegendTextOptions = {
    localize?: LocalizeFn;
    hideDateFilterLabel?: boolean;
    baseLegendText?: string;
};

type AxisDisplayOptions = Record<string, Record<string, unknown>>;
type RawGraphDisplay = DashboardLayoutItem['graph']['display'];

function normalizeDisplayConfig(value: unknown): Record<string, unknown> {
    const normalized = normalizeDashboardDisplay(value);
    return isRecord(normalized) ? normalized : {};
}

export function buildLegendBaseText(
    calculation: GraphCalculation,
    metrics?: DashboardConceptMetric[],
    baseLegendText?: string
): string {
    const metricName =
        getMetricDisplayName(calculation.aggregate, metrics) ??
        calculation.aggregate;
    const savedLabel = baseLegendText?.trim();

    if (!savedLabel) {
        return metricName;
    }

    const dateFilter = findDateFilter(calculation);
    const dateLabel = dateFilter
        ? formatDateFilterLabel(dateFilter)
        : undefined;

    if (dateLabel && savedLabel.endsWith(` ${dateLabel}`)) {
        return (
            savedLabel.slice(0, -` ${dateLabel}`.length).trim() || metricName
        );
    }

    return savedLabel;
}

export function buildLegendText(
    calculation: GraphCalculation,
    metrics?: DashboardConceptMetric[],
    options?: BuildLegendTextOptions
): string {
    const {
        hideDateFilterLabel = false,
        localize,
        baseLegendText,
    } = options ?? {};
    const metricLabel = buildLegendBaseText(
        calculation,
        metrics,
        baseLegendText
    );
    const dateFilter = findDateFilter(calculation);

    if (!dateFilter || hideDateFilterLabel) {
        return metricLabel;
    }

    const dateLabel = formatDateFilterLabel(dateFilter, localize);
    return dateLabel ? `${metricLabel} ${dateLabel}` : metricLabel;
}

type BuildAxisLegendDisplayOptionsParams = {
    calculations: GraphCalculation[] | null;
    customDisplayOptions: AxisDisplayOptions;
    localize: LocalizeFn;
    hideDateFilterLabel: boolean;
    metrics?: DashboardConceptMetric[];
};

export function buildAxisLegendDisplayOptions({
    calculations,
    customDisplayOptions,
    localize,
    hideDateFilterLabel = false,
    metrics,
}: BuildAxisLegendDisplayOptionsParams): AxisDisplayOptions {
    return (calculations ?? []).reduce<AxisDisplayOptions>(
        (displayOptions, calculation, index) => {
            const key = String(index);

            displayOptions[key] = {
                ...displayOptions[key],
                legendText: buildLegendText(calculation, metrics, {
                    localize,
                    hideDateFilterLabel,
                }),
            };

            return displayOptions;
        },
        { ...customDisplayOptions }
    );
}

type BuildDashboardGraphDisplayConfigParams = {
    rawDisplay: RawGraphDisplay;
    customDisplayOptions: Record<string, unknown>;
    graphType: string;
    calculations?: GraphCalculation[] | null;
    localize: LocalizeFn;
    hideDateFilterLabel: boolean;
    metrics?: DashboardConceptMetric[];
};

export function buildDashboardGraphDisplayConfig({
    rawDisplay,
    customDisplayOptions,
    graphType,
    calculations,
    localize,
    hideDateFilterLabel,
    metrics,
}: BuildDashboardGraphDisplayConfigParams): Record<string, unknown> {
    const baseDisplayConfig: Record<string, unknown> =
        rawDisplay && typeof rawDisplay === 'object'
            ? {
                  ...normalizeDisplayConfig(rawDisplay),
                  ...customDisplayOptions,
              }
            : (() => {
                  if (typeof rawDisplay !== 'string') {
                      return { ...customDisplayOptions };
                  }

                  try {
                      const parsed: unknown = JSON.parse(rawDisplay);
                      return {
                          ...normalizeDisplayConfig(parsed),
                          ...customDisplayOptions,
                      };
                  } catch {
                      return { ...customDisplayOptions };
                  }
              })();

    if (graphType !== 'axis') {
        return baseDisplayConfig;
    }

    const existingOptions =
        baseDisplayConfig?.customDisplayOptions &&
        typeof baseDisplayConfig.customDisplayOptions === 'object'
            ? (baseDisplayConfig.customDisplayOptions as AxisDisplayOptions)
            : {};

    return {
        ...baseDisplayConfig,
        customDisplayOptions: buildAxisLegendDisplayOptions({
            calculations: calculations ?? null,
            customDisplayOptions: existingOptions,
            localize,
            hideDateFilterLabel,
            metrics,
        }),
    };
}
