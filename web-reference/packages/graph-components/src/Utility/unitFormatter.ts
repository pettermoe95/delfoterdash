import { formatNumber } from './numberFormatter';

const PERCENTAGE_UNITS = new Set(['%', 'percent', 'percentage']);

export function isPercentageUnit(unit: string | undefined): boolean {
    return unit ? PERCENTAGE_UNITS.has(unit.toLowerCase()) : false;
}

export function formatValueByUnit(
    value: number | string,
    unit?: string,
    showUnit = true,
    locale?: string,
    showDecimals = false
): string {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
        return String(value);
    }

    switch (unit) {
        case '%':
        case 'percent':
        case 'percentage':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? '%' : ''}`;

        case 'USD':
        case 'usd':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? '$' : ''}`;

        case 'KR':
        case 'Kr':
        case 'kr':
            return `${formatNumber(value, { locale, showDecimals })} ${showUnit ? 'kr' : ''}`;

        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? 's' : ''}`;

        case 'ms':
        case 'millisecond':
        case 'milliseconds':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? 'ms' : ''}`;

        case 'min':
        case 'minute':
        case 'minutes':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? 'min' : ''}`;

        case 'h':
        case 'hr':
        case 'hour':
        case 'hours':
            return `${formatNumber(value, { locale, showDecimals })}${showUnit ? 'h' : ''}`;

        default:
            return formatNumber(value, { locale, showDecimals });
    }
}
