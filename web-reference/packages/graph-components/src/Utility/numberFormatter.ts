type NumberFormatLocale = string | undefined;

type NumberFormatOptions = {
    locale?: NumberFormatLocale;
    showDecimals?: boolean;
    fractionDigits?: number;
};

type NumberFormatter = (value: number) => string;

const DEFAULT_DECIMAL_DIGITS = 2;
const COMPACT_THRESHOLD = 10_000;

const COMPACT_UNITS = [
    { threshold: 1_000_000_000_000, divisor: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, divisor: 1_000_000, suffix: 'M' },
    { threshold: 1_000, divisor: 1_000, suffix: 'k' },
] as const;

function resolveFractionDigits({
    showDecimals = false,
    fractionDigits = DEFAULT_DECIMAL_DIGITS,
}: NumberFormatOptions): number {
    return showDecimals ? fractionDigits : 0;
}

function getDecimalSeparator(locale?: NumberFormatLocale): string {
    if (locale === 'nb' || locale === 'nb-NO') {
        return ',';
    }

    return '.';
}

function addSpaceThousandsSeparator(integerValue: string): string {
    const sign = integerValue.startsWith('-') ? '-' : '';
    const digits = sign ? integerValue.slice(1) : integerValue;

    return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
}

function roundToFixed(value: number, fractionDigits: number): string {
    const power = 10 ** fractionDigits;
    const roundedValue = Math.round((value + Number.EPSILON) * power) / power;

    return roundedValue.toFixed(fractionDigits);
}

type NumberParts = {
    integerPart: string;
    fractionalPart?: string;
};

function getNumberParts(
    value: number,
    options: NumberFormatOptions
): NumberParts {
    const fractionDigits = resolveFractionDigits(options);
    const roundedValue = roundToFixed(value, fractionDigits);
    const [integerPart = '0', fractionalPart] = roundedValue.split('.');

    return {
        integerPart,
        fractionalPart,
    };
}

export function formatNumber(
    value: number,
    options: NumberFormatOptions = {}
): string {
    if (!Number.isFinite(value)) {
        return String(value);
    }

    const { integerPart, fractionalPart } = getNumberParts(value, options);
    const groupedInteger = addSpaceThousandsSeparator(integerPart);

    if (!fractionalPart) {
        return groupedInteger;
    }

    return `${groupedInteger}${getDecimalSeparator(options.locale)}${fractionalPart}`;
}

export function formatCompactNumber(
    value: number,
    options: NumberFormatOptions = {}
): string {
    const absoluteValue = Math.abs(value);

    if (absoluteValue < COMPACT_THRESHOLD) {
        return formatNumber(value, options);
    }

    const compactUnit = COMPACT_UNITS.find(
        ({ threshold }) => absoluteValue >= threshold
    )!;

    return `${formatNumber(value / compactUnit.divisor, options)}${compactUnit.suffix}`;
}

export const createValueFormatter =
    (options: NumberFormatOptions = {}): NumberFormatter =>
    (value) =>
        formatNumber(value, options);

export const defaultValueFormatter: NumberFormatter = (value) =>
    formatNumber(value, {
        locale: 'nb',
        showDecimals: false,
    });
