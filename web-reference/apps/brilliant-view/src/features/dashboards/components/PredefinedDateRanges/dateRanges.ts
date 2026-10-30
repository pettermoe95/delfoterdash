import {
    CalendarDate,
    getLocalTimeZone,
    parseDate,
    today,
} from '@internationalized/date';

export type DateRange = { from: string; to: string };

const TZ = getLocalTimeZone();

export const getToday = () => today(TZ);

export const getYTDRange = (base = getToday()): DateRange => ({
    from: new CalendarDate(base.year, 1, 1).toString(),
    to: base.toString(),
});

export const getLastYTDRange = (base = getToday()): DateRange => {
    const lastYearSameDay = base.subtract({ years: 1 });
    return {
        from: new CalendarDate(lastYearSameDay.year, 1, 1).toString(),
        to: lastYearSameDay.toString(),
    };
};

/**
 * Shifts a range backwards by `months` (months must be > 0).
 */
export const shiftRangeBackByMonths = (
    range: DateRange,
    months: number
): DateRange => {
    if (!Number.isFinite(months) || months <= 0) {
        throw new Error(`months must be a positive number. Got: ${months}`);
    }
    const from = parseDate(range.from).subtract({ months });
    const to = parseDate(range.to).subtract({ months });
    return { from: from.toString(), to: to.toString() };
};

/**
 * Rolling window ending today (inclusive), e.g. last 12 months.
 */
export const getLastMonthsRange = (
    months: number,
    base = getToday()
): DateRange => {
    if (!Number.isFinite(months) || months <= 0) {
        throw new Error(`months must be a positive number. Got: ${months}`);
    }
    return {
        from: base.subtract({ months }).toString(),
        to: base.toString(),
    };
};

/**
 * Rolling window starting today (inclusive), e.g. next 12 months.
 */
export const getNextMonthsRange = (
    months: number,
    base = getToday()
): DateRange => {
    if (!Number.isFinite(months) || months <= 0) {
        throw new Error(`months must be a positive number. Got: ${months}`);
    }
    return {
        from: base.toString(),
        to: base.add({ months }).toString(),
    };
};

export const getPresetRange = (preset?: string | null): DateRange | null => {
    if (!preset) return null;

    if (preset === 'ytd') return getYTDRange();

    const match = /^(last|next)_months[:_](\d+)$/.exec(preset);
    if (!match) return null;

    const months = Number(match[2]);
    if (!Number.isFinite(months) || months <= 0) return null;

    return match[1] === 'next'
        ? getNextMonthsRange(months)
        : getLastMonthsRange(months);
};

export const isMatchingRange = (
    range: DateRange | null,
    preset: DateRange
): boolean => !!range && range.from === preset.from && range.to === preset.to;
