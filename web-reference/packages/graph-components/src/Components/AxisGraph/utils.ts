import type { LocalizeFn } from '@bv/i18n-utils';
import { extent, transpose } from '@visx/vendor/d3-array';
import type { Scalar2D } from '../../Common/types';
import { formatDateDdMmYy, formatDateLong } from './dateFormat';
import type {
    AxisGraphSeriesConfig,
    BarDisplayMode,
    SeriesWithDisplayConfig,
} from './types';

type MinMax = [number, number];

/**
 * Calculate minmax for the y-domain based on the extreme values of each series.
 *
 * When rendering bar stacks, the minmax is based on the sum for each x-value stack.
 *
 * @param lineSeries
 * @param barSeries
 * @param barGroupMode
 * @returns
 */
export function getAxisGraphMinMax(
    lineSeries: SeriesWithDisplayConfig<AxisGraphSeriesConfig>[],
    barSeries: SeriesWithDisplayConfig<AxisGraphSeriesConfig>[],
    barGroupMode: BarDisplayMode
): MinMax {
    const [lineMin, lineMax] = getMinMax(lineSeries);
    const [barMin, barMax] =
        barGroupMode === 'stack'
            ? getMinMaxSum(barSeries)
            : getMinMax(barSeries);
    return [Math.min(lineMin, barMin), Math.max(lineMax, barMax)].map(
        padExtreme
    ) as MinMax;
}

function getMinMax(
    data: SeriesWithDisplayConfig<AxisGraphSeriesConfig>[]
): MinMax {
    return data.reduce(
        ([extentMin, extentMax], data) => {
            const [min, max] = extent(data.series.values, (datum) => datum.y);
            return [
                Math.min(extentMin, min ?? 0),
                Math.max(extentMax, max ?? 0),
            ];
        },
        [Infinity, -Infinity]
    );
}

function getMinMaxSum(
    data: SeriesWithDisplayConfig<AxisGraphSeriesConfig>[]
): MinMax {
    const scalarMatrix = transpose<Scalar2D>(
        data.map((series) => series.series.values)
    );
    return scalarMatrix.reduce(
        ([prevMin, prevMax], scalars) => {
            const [negativeSum, positiveSum] = scalars.reduce(
                ([prevNegative, prevPositive], { y }) => {
                    if (y < 0) return [prevNegative + y, prevPositive];
                    return [prevNegative, prevPositive + y];
                },
                [0, 0]
            );
            return [
                Math.min(prevMin, negativeSum),
                Math.max(prevMax, positiveSum),
            ];
        },
        [0, 0]
    );
}

/**
 * Pad the extreme by its order of magnitude to prettify rendering.
 *
 * @param extreme
 * @returns Padded extreme
 */
function padExtreme(extreme: number): number {
    const order = getOrderOfMagnitude(extreme);
    return Math.floor(Math.abs(extreme) + order / 10) * Math.sign(extreme);
}

function getOrderOfMagnitude(n: number) {
    const order = Math.floor(Math.log(Math.abs(n)) / Math.LN10 + 0.000000001); // because float math sucks like that
    return Math.pow(10, order);
}

function localizeLabel(
    key: string,
    label: string,
    localize?: LocalizeFn
): string {
    if (!localize) {
        return label;
    }

    if (key.endsWith('.')) key = key.slice(0, -1);

    const localeKey = key + '.' + label.toLowerCase();
    const localizedText = localize(localeKey);

    if (localeKey === localizedText) {
        //Value was not found in locale file, fall back
        return label;
    }

    return localizedText;
}

function localizeYearMonthLabel(
    label: string,
    localize?: LocalizeFn,
    locale?: string
) {
    const parts = label.split(',').map((p) => p.trim());
    if (parts.length !== 2) return label;

    const [a, b] = parts;

    const isYear = (s: string) => /^\d{4}$/.test(s);

    let year: string | undefined;
    let month: string | undefined;

    if (a == undefined || b == undefined) return label;

    if (isYear(a)) {
        year = a;
        month = b;
    } else if (isYear(b)) {
        year = b;
        month = a;
    } else {
        return label;
    }

    //Just in case we can't find a numeric value (year)
    if (!year || !month) return label;

    const key = `time.monthNames.${month.toLowerCase()}`;
    const localizedMonth = localize?.(key) ?? month;

    if (localizedMonth === key) {
        //No translation found in locale file
        return label;
    }

    if (locale === 'nb') {
        //Format for norwegian locale
        return `${localizedMonth} ${year}`;
    }

    return `${year}, ${localizedMonth}`;
}

// Trim spaces around commas so API labels like "January , Employee x" render as "January, Employee x".
function normalizeLabel(value: string): string {
    return value
        .split(',')
        .map((part) => part.trim())
        .join(', ');
}

/**
 * Formats the label for the graph tooltip.
 *
 * @param value
 * @param unit
 * @returns Formatted label
 */
export function tooltipLabelFormatter(
    value: string | undefined,
    unit: string,
    localize?: LocalizeFn,
    locale?: string
): string {
    if (!value) return localize?.('miscTerms.noData') ?? 'No data';
    if (!unit) return String(value);
    const normalizedUnit = unit.trim().toLowerCase();
    const stringValue = String(value).trim();
    switch (normalizedUnit) {
        case 'hours': {
            const unitLabel = localize?.('time.hours') ?? 'hours';
            return `${stringValue} ${unitLabel}`;
        }
        case 'date':
            return formatDateLong(stringValue, locale);
        case 'week':
            if (!localize) {
                return `Week ${value}`;
            }
            return `${localize('time.week')} ${value}`;
        case 'month':
            return localizeLabel('time.monthNames', stringValue, localize);
        case 'day of week':
            return localizeLabel('time.dayNames', stringValue, localize);
        case 'year, month':
            return localizeYearMonthLabel(stringValue, localize, locale);
        default:
            return normalizeLabel(stringValue);
    }
}

/**
 * Formats the label for the graph x-axis labels.
 *
 * @param value
 * @param unit
 * @returns Formatted label
 */
export function xLabelFormatter(
    value: string | undefined,
    unit: string,
    localize?: LocalizeFn
): string {
    if (!value) return localize?.('miscTerms.noData') ?? 'No data';
    if (!unit) return String(value);

    if (unit.toLocaleLowerCase() === 'date') {
        return formatDateDdMmYy(value);
    } else if (
        unit.toLocaleLowerCase() === 'day of week' ||
        unit.toLocaleLowerCase() === 'day_of_week'
    ) {
        return localizeLabel('time.dayNames', value.trim(), localize);
    } else if (unit.toLocaleLowerCase() === 'month') {
        return localizeLabel('time.monthNames', value.trim(), localize);
    }
    return normalizeLabel(String(value));
}
