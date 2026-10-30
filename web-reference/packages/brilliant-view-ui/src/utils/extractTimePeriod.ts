import type { DashboardGraphQueryCalculations } from '@bv/api';

// Local formatter implementations to avoid importing files outside this package rootDir.
const formatMonthYear = (date: Date, locale = 'no-NO'): string =>
    new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(
        date
    );

export interface RawTimeFilter {
    condition?: string;
    period?: string;
    type?: string;
    offset_years?: number;
    offset_months?: number;
    offset_quarters?: number | null;
    offset_weeks?: number;
    offset_days?: number;
    [key: string]: unknown; // allow other props
}

export interface CalculationLike {
    aggregate?: string;
    filter?: RawTimeFilter[];
    [key: string]: unknown;
}

export interface ExtractedTimePeriod {
    period: 'year' | 'quarter' | 'month' | 'week' | 'day';
    label: string;
    calculationIndex: number;
    timeLabel: string;
    offset: number;
}

export interface GraphQueryLike {
    calculations?: CalculationLike[];
    [key: string]: unknown;
}

const PERIOD_KEYS: (keyof RawTimeFilter)[] = [
    'offset_years',
    'offset_months',
    'offset_quarters',
    'offset_weeks',
    'offset_days',
];

// Build human label for offset & period
export function buildOffsetLabel(period: string, offset: number): string {
    const unit = period.toLowerCase();
    const abs = Math.abs(offset);
    const plural = abs === 1 ? unit : `${unit}s`;
    if (offset === 0) return `current ${unit}`;
    if (offset === -1) return `last ${unit}`;
    if (offset < -1) return `${abs} ${plural} ago`;
    if (offset === 1) return `next ${unit}`; // future (rare)
    return `in ${abs} ${plural}`; // future > 1
}

// Determine offset value (prefers the matching period-specific key; defaults to 0)
function resolveOffset(filter: RawTimeFilter): number {
    if (!filter.period) return 0;
    switch (filter.period) {
        case 'year':
            return filter.offset_years ?? 0;
        case 'quarter':
            return filter.offset_quarters ?? 0;
        case 'month':
            return filter.offset_months ?? 0;
        case 'week':
            return filter.offset_weeks ?? 0;
        case 'day':
            return filter.offset_days ?? 0;
        default:
            // fallback: first numeric offset key present
            for (const k of PERIOD_KEYS) {
                const v = filter[k];
                if (typeof v === 'number') return v;
            }
            return 0;
    }
}

// Derive calculations array type from DashboardDetails
type CalculationsArray = DashboardGraphQueryCalculations[];

export function extractTimePeriods(
    calculations: CalculationsArray | undefined | null
): ExtractedTimePeriod[] {
    if (!Array.isArray(calculations)) return [];
    const results: ExtractedTimePeriod[] = [];
    const allowed: ExtractedTimePeriod['period'][] = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
    ];
    const isAllowedPeriod = (
        period: string
    ): period is ExtractedTimePeriod['period'] =>
        allowed.includes(period as ExtractedTimePeriod['period']);
    const now = new Date();
    calculations.forEach((calc, calcIndex) => {
        const filters = calc.filter;
        if (!Array.isArray(filters)) return;
        filters.forEach((fAny) => {
            // We only care about date filters with condition 'in_period'
            if (!fAny || typeof fAny !== 'object') return;
            const f = fAny as RawTimeFilter;
            if (f.condition !== 'in_period') return;
            if (f.type !== 'date') return; // ensure date filter variant
            const rawPeriod = f.period;
            if (!rawPeriod) return;
            const normalized: ExtractedTimePeriod['period'] = isAllowedPeriod(
                rawPeriod
            )
                ? rawPeriod
                : 'year'; // fallback
            const offset = resolveOffset(f);
            // If period was unknown AND no numeric offset found, skip
            if (!isAllowedPeriod(rawPeriod)) {
                const hasNumeric = PERIOD_KEYS.some(
                    (k) => typeof f[k] === 'number'
                );
                if (!hasNumeric) return;
            }
            results.push({
                period: normalized,
                label: buildOffsetLabel(normalized, offset),
                calculationIndex: calcIndex,
                timeLabel: buildTimeLabel(normalized, offset, now),
                offset,
            });
        });
    });

    return results;
}

function getISOWeekYear(date: Date): { week: number; year: number } {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    // Thursday determines the week year
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const isoYear = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const week = Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return { week, year: isoYear };
}

export function buildTimeLabel(
    period: ExtractedTimePeriod['period'],
    offset: number,
    now: Date
): string {
    const locale = 'no-NO';
    if (period === 'year') {
        // Always output plain number, no grouping
        return String(now.getFullYear() + offset);
    }
    if (period === 'quarter') {
        const d = new Date(now);
        d.setMonth(d.getMonth() + offset * 3);
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `Q${quarter} ${d.getFullYear()}`;
    }
    if (period === 'month') {
        const d = new Date(now);
        d.setMonth(d.getMonth() + offset);
        // Use shared month-year formatter
        return formatMonthYear(d);
    }
    if (period === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() + offset * 7);
        const { week, year } = getISOWeekYear(d);
        // Always output plain number, no grouping
        return `Uke ${week} ${year}`;
    }
    if (period === 'day') {
        const d = new Date(now);
        d.setDate(d.getDate() + offset);
        // Use built-in formatter for now (could wrap in shared util if needed)
        const formatter = new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        return formatter.format(d).replace(/^./, (c) => c.toUpperCase());
    }
    return '';
}
