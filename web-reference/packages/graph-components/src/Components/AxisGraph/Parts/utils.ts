import { primitives } from '@bv/design-tokens';
import type { LocalizeFn } from '@bv/i18n-utils';
import type { TickLabelProps } from '@visx/axis';
import { getStringWidth } from '@visx/text';
import type { AxisGraphLayout } from '../../../Common/layout';
import type { DiscreteDimension } from '../../../Common/types';
import {
    formatDateDdMmYy,
    formatYearMonthShort,
    getMonthNameByIndex,
    parseYearMonthLabel,
} from '../dateFormat';
import { xLabelFormatter } from '../utils';

const DEFAULT_LABEL_WIDTH = 48;
const DEFAULT_TRUNCATE_LENGTH = 8;
const TRUNCATED_CHAR_COUNT = 2;
const PER_TICK_PADDING = 6;
const MIN_TICK_SPACING = 12;
const MIN_CHAR_PIXEL_WIDTH = 7;
const MIN_MEASURED_WIDTH = 14;
const TICK_LABEL_FONT_STYLES = {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Roboto Mono',
} as const;

const TIME_UNITS = new Set([
    'date',
    'day',
    'day of week',
    'day_of_week',
    'month',
    'week',
    'year',
    'hours',
    'year, month',
    'year, quarter',
    'year, week',
    'day of year',
]);

function isTimeUnit(unit: string | undefined): boolean {
    if (!unit) return false;
    return TIME_UNITS.has(unit.trim().toLowerCase());
}

function allLabelsFullyFit(labels: string[], availableWidth: number): boolean {
    if (labels.length === 0) return true;
    // The band scale allocates equal-width slots (available / n).
    // A label overlaps if it's wider than its slot, so we check the widest label.
    const maxLabelWidth = labels.reduce((max, label) => {
        const measured = getStringWidth(label, TICK_LABEL_FONT_STYLES);
        const fallback = Math.max(
            label.length * MIN_CHAR_PIXEL_WIDTH,
            MIN_MEASURED_WIDTH
        );
        return Math.max(max, Math.max(measured ?? 0, fallback));
    }, 0);
    const slotWidth = availableWidth / labels.length;
    return maxLabelWidth + PER_TICK_PADDING <= slotWidth;
}

export function useLabelConfig(
    domainX: DiscreteDimension,
    layout: AxisGraphLayout,
    flipAxis: boolean,
    localize?: LocalizeFn
) {
    const isMobile =
        typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

    // If the domain name contains multiple groupings (via comma), force full labels on the x-axis
    const forceFullLabels =
        typeof domainX.name === 'string' && domainX.name.includes(',');

    // Build labels used for width estimation and formatting.
    // If explicit labels are missing, derive them from values so width estimates are realistic.
    const rawLabels =
        domainX.labels && domainX.labels.length > 0
            ? domainX.labels
            : domainX.values.map((v) => String(v));
    const xTickLabels = flipAxis
        ? rawLabels
              .map((label) => formatDomainLabel(label, domainX.unit))
              .reverse()
        : rawLabels.map((label) => formatDomainLabel(label, domainX.unit));

    const available = computeAvailableWidth(layout, isMobile, flipAxis);
    const isTimeSeries = isTimeUnit(domainX.unit);

    // Determine the label rendering strategy:
    //   'full'             — all labels fit at full width; show them all, no truncation.
    //   'time-reduce-ticks'— time-based (or multi-grouping): full labels, fewer ticks.
    //   'non-time-truncate'— non-time, tight space: show 2-char abbreviations.
    type LabelStrategy = 'full' | 'time-reduce-ticks' | 'non-time-truncate';

    function resolveLabelStrategy(): LabelStrategy {
        if (forceFullLabels) return 'time-reduce-ticks';
        if (allLabelsFullyFit(xTickLabels, available)) return 'full';
        return isTimeSeries ? 'time-reduce-ticks' : 'non-time-truncate';
    }
    const strategy = resolveLabelStrategy();

    const approxLabelWidth = (() => {
        if (strategy === 'non-time-truncate') {
            return Math.max(
                TRUNCATED_CHAR_COUNT * MIN_CHAR_PIXEL_WIDTH,
                MIN_MEASURED_WIDTH
            );
        }
        return estimateLabelWidthPercentile(xTickLabels, false, 0.8);
    })();

    const maxLabelSize = findMaxLabelSize(
        xTickLabels,
        flipAxis,
        strategy === 'non-time-truncate'
    );

    const numTicksHorizontal = flipAxis
        ? Math.floor((layout.width - layout.left - 1) / DEFAULT_LABEL_WIDTH)
        : clamp(
              Math.floor(
                  available /
                      Math.max(
                          MIN_TICK_SPACING,
                          approxLabelWidth + PER_TICK_PADDING
                      )
              ),
              2,
              domainX.values.length
          );

    const numTicksVertical = Math.floor(
        flipAxis ? layout.height / maxLabelSize.height : layout.height / 24
    );

    // When using a band scale on the discrete axis, numTicks is ignored by @visx/axis.
    // Provide explicit tickValues sampled from the domain to avoid clutter.
    const desiredXTicks = flipAxis ? numTicksVertical : numTicksHorizontal;
    const xTickValues =
        (strategy === 'time-reduce-ticks' ||
            strategy === 'non-time-truncate') &&
        !flipAxis
            ? sampleNiceTickValues(domainX.values, desiredXTicks)
            : sampleTickValues(domainX.values, desiredXTicks);

    return {
        xTickLabelProps: useXTickLabelProps(flipAxis),
        xNumTicks: flipAxis ? numTicksVertical : numTicksHorizontal,
        xTickValues,
        xTickFormatter: (x: number) => {
            const idx = domainX.values.indexOf(x);
            const raw = xTickLabels[idx] ?? '';

            // Handle "2018, December" (or "December, 2018") → "Dec 18"
            const yearMonth = parseYearMonthLabel(raw);
            if (yearMonth) {
                const monthName = getMonthNameByIndex(yearMonth.monthIndex);
                const monthKey = monthName
                    ? `time.monthNames.${monthName}`
                    : undefined;
                const localizedMonthRaw =
                    monthKey && localize
                        ? localize(monthKey)
                        : (monthName ?? '');
                const resolvedMonth =
                    monthKey && localizedMonthRaw === monthKey
                        ? (monthName ?? '')
                        : localizedMonthRaw;
                const shortMonth =
                    resolvedMonth.length <= 3
                        ? resolvedMonth
                        : resolvedMonth.slice(0, 3);
                const normalizedMonth = shortMonth
                    ? shortMonth.charAt(0).toUpperCase() +
                      shortMonth.slice(1).toLowerCase()
                    : shortMonth;
                return formatYearMonthShort(yearMonth, normalizedMonth);
            }

            // Fallback to existing formatter
            const formatted = xLabelFormatter(
                raw,
                domainX.unit ?? '',
                localize
            );
            return strategy === 'non-time-truncate'
                ? abbreviate(formatted)
                : formatted;
        },
        yTickLabelProps: useYTickLabelProps(flipAxis),
        yNumTicks: flipAxis ? numTicksHorizontal : numTicksVertical,
        labelProps: useLabelProps(flipAxis),
        xAxisLabel: getXAxisLabel(domainX.name ?? ''),
    };
}

function useXTickLabelProps(flipAxis: boolean): TickLabelProps<number> {
    const { tertiary } = useLabelColors();
    return {
        ...TICK_LABEL_FONT_STYLES,
        fill: tertiary,
        textAnchor: flipAxis ? 'end' : 'middle',
        verticalAnchor: flipAxis ? 'middle' : 'end',
        width: flipAxis ? DEFAULT_LABEL_WIDTH : undefined,
    } as const;
}

function useYTickLabelProps(flipAxis: boolean): TickLabelProps<number> {
    const { secondary } = useLabelColors();
    return {
        ...TICK_LABEL_FONT_STYLES,
        fill: secondary,
        textAnchor: flipAxis ? 'middle' : 'end',
    } as const;
}

function useLabelProps(flipAxis: boolean) {
    const { secondary } = useLabelColors();
    return {
        dy: flipAxis ? 20 : 15,
        fontSize: primitives.text.size.xs,
        fontFamily: 'Roboto Mono',
        fontWeight: 500,
        fill: secondary,
    } as const;
}

// allow the width calc to consider truncation or full labels with safe fallbacks
function findMaxLabelSize(
    labels: string[],
    flipAxis: boolean,
    shouldTruncate: boolean
) {
    const maxLabel = labels.reduce((value, largest) => {
        return value.length > largest.length ? value : largest;
    }, '');

    const sample = shouldTruncate ? truncate(maxLabel) : maxLabel;
    const measured = getStringWidth(sample, TICK_LABEL_FONT_STYLES);
    const fallback = Math.max(
        sample.length * MIN_CHAR_PIXEL_WIDTH,
        MIN_MEASURED_WIDTH
    );
    const textWidth = Math.max(measured ?? 0, fallback);
    const maxWidth = flipAxis ? DEFAULT_LABEL_WIDTH : undefined;

    return {
        width: textWidth,
        height: maxWidth ? Math.ceil(textWidth / maxWidth) * 16 : 16,
    };
}

function useLabelColors() {
    const container = window.getComputedStyle(document.documentElement);
    return {
        secondary: container.getPropertyValue('--text-secondary'),
        tertiary: container.getPropertyValue('--text-tertiary'),
    };
}

function truncate(text: string, maxLength?: number) {
    if (text.length <= (maxLength ?? DEFAULT_TRUNCATE_LENGTH)) return text;
    return text.charAt(0).toUpperCase() + text.charAt(1).toLowerCase();
}

// Always reduce a label to exactly 2 chars regardless of its current length.
// Used in non-time-truncate mode for consistency across all labels.
function abbreviate(text: string): string {
    if (text.length <= 1) return text.toUpperCase();
    return text.charAt(0).toUpperCase() + text.charAt(1).toLowerCase();
}

function formatDomainLabel(label: string | number, unit?: string): string {
    if (!unit) return String(label);

    switch (unit.toLocaleLowerCase()) {
        case 'date':
            return formatDateDdMmYy(label);
        default:
            return String(label);
    }
}

function getXAxisLabel(label: string): string {
    switch (label.toLowerCase()) {
        case 'day_of_week':
        case 'day_of_month':
            return 'Day';
        default:
            return label;
    }
}

function computeAvailableWidth(
    layout: AxisGraphLayout,
    isMobile: boolean,
    flipAxis: boolean
) {
    // Reserve a small, dynamic right margin instead of a hard 250px.
    // If your layout has `right`, prefer that; else use a modest fallback.
    const reserveRight = flipAxis ? 0 : isMobile ? 12 : 80;
    const available =
        (isMobile ? layout.width : layout.width) - layout.left - reserveRight;
    return Math.max(available, 0);
}

function estimateLabelWidthPercentile(
    labels: string[],
    shouldTruncate: boolean,
    percentile: number // e.g., 0.8
): number {
    if (!labels.length) return DEFAULT_LABEL_WIDTH;

    const widths = labels.map((txt) => {
        const sample = shouldTruncate ? truncate(txt) : txt;
        const measured = getStringWidth(sample, TICK_LABEL_FONT_STYLES);
        const fallback = Math.max(
            sample.length * MIN_CHAR_PIXEL_WIDTH,
            MIN_MEASURED_WIDTH
        );
        return Math.max(measured ?? 0, fallback);
    });

    widths.sort((a, b) => a - b);
    const idx = Math.min(
        widths.length - 1,
        Math.max(0, Math.floor(percentile * widths.length))
    );
    return widths[idx] ? widths[idx] : 0;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

// Sample a subset of discrete tick values based on desired count.
// Ensures first and last ticks are included when possible.
function sampleTickValues(
    domainValues: number[],
    desiredTickCount: number
): number[] {
    if (!Array.isArray(domainValues) || domainValues.length === 0) return [];
    if (!Number.isFinite(desiredTickCount)) return domainValues;
    const totalValueCount = domainValues.length;
    const clampedTickCount = Math.max(
        1,
        Math.min(Math.floor(desiredTickCount), totalValueCount)
    );

    // Trivial cases
    if (clampedTickCount === totalValueCount) return domainValues.slice();
    if (clampedTickCount === 1) {
        const firstDomainValue = domainValues[0];
        return typeof firstDomainValue === 'number' ? [firstDomainValue] : [];
    }

    // Distribute (N-1) span across (M-1) gaps as evenly as possible.
    const span = totalValueCount - 1;
    const gaps = clampedTickCount - 1;
    const base = Math.floor(span / gaps); // minimal gap
    const remainder = span - base * gaps; // how many gaps get +1

    const tickIndices: number[] = [0];
    let currentIndex = 0;
    let accumulator = 0;
    for (let i = 0; i < gaps; i++) {
        let gapSize = base;
        accumulator += remainder;
        if (accumulator >= gaps) {
            gapSize += 1;
            accumulator -= gaps;
        }
        currentIndex += gapSize;
        tickIndices.push(currentIndex);
    }

    // Map to values and ensure correct type
    return tickIndices
        .map((i) => domainValues[i])
        .filter((v): v is number => typeof v === 'number');
}

// Sample tick values using a round interval (every 2nd, every 3rd, etc.) so
// the pattern is always uniform — no 2-on-1-off artifacts from Bresenham spacing.
function sampleNiceTickValues(
    domainValues: number[],
    desiredTickCount: number
): number[] {
    const total = domainValues.length;
    if (total <= desiredTickCount) return domainValues.slice();
    const interval = Math.max(1, Math.ceil(total / desiredTickCount));
    return domainValues.filter((_, i) => i % interval === 0);
}

export function formatAxisTick(value: number, precision = 2): string {
    if (Math.abs(value) <= 1000) {
        return parseFloat(value.toFixed(precision)).toString();
    }
    if (Math.abs(value) < 1_000_000) {
        return `${parseFloat((value / 1000).toFixed(precision))}k`;
    }
    if (Math.abs(value) < 1_000_000_000) {
        return `${parseFloat((value / 1_000_000).toFixed(precision))}M`;
    }
    if (Math.abs(value) < 1_000_000_000_000) {
        return `${parseFloat((value / 1_000_000_000).toFixed(precision))}B`;
    }
    return `${parseFloat((value / 1_000_000_000_000).toFixed(precision))}T`;
}
