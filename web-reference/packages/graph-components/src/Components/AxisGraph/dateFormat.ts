// Shared date formatting helpers for AxisGraph

// Month name helpers (lowercase for internal consistency)
const MONTHS_LONG = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
] as const;

const MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
] as const;

const MONTH_INDEX: Record<string, number> = Object.fromEntries(
    MONTHS_LONG.map((month, index) => [month, index])
);

export type YearMonth = { year: number; monthIndex: number };

export function getMonthNameByIndex(monthIndex: number): string | undefined {
    return MONTHS_LONG[monthIndex];
}

export function parseYearMonthLabel(raw: string): YearMonth | null {
    const dateString = String(raw).trim();

    // Case 1: "2018, December"
    const yearMonthFormat = /^(\d{4})\s*,\s*([A-Za-z]+)$/.exec(dateString);
    if (yearMonthFormat?.[1] && yearMonthFormat[2]) {
        const year = Number(yearMonthFormat[1]);
        const monthStr = String(yearMonthFormat[2]).toLowerCase();
        const index = MONTH_INDEX[monthStr];
        if (Number.isFinite(year) && typeof index === 'number') {
            return { year, monthIndex: index };
        }
    }
    // Case 2: "December, 2018"
    const monthYearFormat = /^([A-Za-z]+)\s*,\s*(\d{4})$/.exec(dateString);
    if (monthYearFormat?.[1] && monthYearFormat[2]) {
        const year = Number(monthYearFormat[2]);
        const monthStr = String(monthYearFormat[1]).toLowerCase();
        const index = MONTH_INDEX[monthStr];
        if (Number.isFinite(year) && typeof index === 'number') {
            return { year, monthIndex: index };
        }
    }
    return null;
}

export function formatYearMonthShort(
    ym: YearMonth,
    monthLabel?: string
): string {
    const month = (monthLabel ?? MONTHS_SHORT[ym.monthIndex] ?? '').trim();

    return `${month} ${String(ym.year).slice(-2)}`;
}

export function formatYearMonthLong(ym: YearMonth): string {
    const raw = MONTHS_LONG[ym.monthIndex] ?? '';
    const mon = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
    return `${mon} ${ym.year}`;
}

// dd.mm.yy — for compact axis labels
export function formatDateDdMmYy(dateValue: string | number): string {
    const rawDate = String(dateValue).trim();
    // ISO: YYYY-MM-DD
    const matchIsoFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
    if (matchIsoFormat?.[1] && matchIsoFormat[2] && matchIsoFormat[3]) {
        const yy = String(matchIsoFormat[1]).slice(-2);
        const mm = String(matchIsoFormat[2]);
        const dd = String(matchIsoFormat[3]);
        return `${dd}.${mm}.${yy}`;
    }
    // Compact: YYYYMMDD
    const matchCompactFormat = /^(\d{4})(\d{2})(\d{2})$/.exec(rawDate);
    if (
        matchCompactFormat?.[1] &&
        matchCompactFormat[2] &&
        matchCompactFormat[3]
    ) {
        const yy = String(matchCompactFormat[1]).slice(-2);
        const mm = String(matchCompactFormat[2]);
        const dd = String(matchCompactFormat[3]);
        return `${dd}.${mm}.${yy}`;
    }
    // European-style: dd/mm/yyyy or dd.mm.yyyy (with d/m/yy variants)
    const matchEuropeanFormat = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(
        rawDate
    );
    if (
        matchEuropeanFormat?.[1] &&
        matchEuropeanFormat[2] &&
        matchEuropeanFormat[3]
    ) {
        const dd = String(matchEuropeanFormat[1]).padStart(2, '0');
        const mm = String(matchEuropeanFormat[2]).padStart(2, '0');
        const yy = String(matchEuropeanFormat[3]).slice(-2);
        return `${dd}.${mm}.${yy}`;
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd}.${mm}.${yy}`;
    }
    return String(dateValue);
}

function toDateFromParts(year: number, monthIndex: number, day: number): Date {
    return new Date(Date.UTC(year, monthIndex, day));
}

function formatLongDate(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

function formatLongDateLocal(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

// d. Month yyyy — for tooltip labels
export function formatDateLong(
    dateValue: string | number,
    locale?: string
): string {
    const rawDate = String(dateValue).trim();
    // ISO: YYYY-MM-DD
    const matchIsoFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
    if (matchIsoFormat?.[1] && matchIsoFormat[2] && matchIsoFormat[3]) {
        const year = Number(matchIsoFormat[1]);
        const monthIndex = Math.max(
            0,
            Math.min(11, Number(matchIsoFormat[2]) - 1)
        );
        const day = Number(matchIsoFormat[3]);
        return formatLongDate(toDateFromParts(year, monthIndex, day), locale);
    }
    // Compact: YYYYMMDD
    const matchCompactFormat = /^(\d{4})(\d{2})(\d{2})$/.exec(rawDate);
    if (
        matchCompactFormat?.[1] &&
        matchCompactFormat[2] &&
        matchCompactFormat[3]
    ) {
        const year = Number(matchCompactFormat[1]);
        const monthIndex = Math.max(
            0,
            Math.min(11, Number(matchCompactFormat[2]) - 1)
        );
        const day = Number(matchCompactFormat[3]);
        return formatLongDate(toDateFromParts(year, monthIndex, day), locale);
    }
    const matchEuropeanFormat = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(
        rawDate
    );
    if (
        matchEuropeanFormat?.[1] &&
        matchEuropeanFormat[2] &&
        matchEuropeanFormat[3]
    ) {
        const day = Number(matchEuropeanFormat[1]);
        const month = Number(matchEuropeanFormat[2]);
        if (month < 1 || month > 12) {
            throw new RangeError(
                `Invalid month '${month}' in date string '${rawDate}'`
            );
        }

        const monthIndex = month - 1;
        const yearPart = String(matchEuropeanFormat[3]);
        const year =
            yearPart.length === 2 ? Number(`20${yearPart}`) : Number(yearPart);
        return formatLongDate(toDateFromParts(year, monthIndex, day), locale);
    }
    const date = new Date(rawDate);
    if (!isNaN(date.getTime())) {
        return formatLongDateLocal(date, locale);
    }
    return String(dateValue);
}
