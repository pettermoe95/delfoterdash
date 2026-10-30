import type { SelectOption } from '@brilliant/bds-core';
import type {
    DashboardGraphQueryCalculations,
    DashboardGraphQueryDateFilter,
} from '@bv/api';
import { isRecord } from '~/utils/typeGuards';

type LocalizeFn = (key: string) => string;

type InPeriodDateFilter = Extract<
    DashboardGraphQueryDateFilter,
    { condition: 'in_period' }
>;

type CalculationFilter = NonNullable<
    DashboardGraphQueryCalculations['filter']
>[number];

const TIME_PERIODS = ['year', 'quarter', 'month', 'week', 'day'] as const;
export type Period = (typeof TIME_PERIODS)[number];

type OffsetKey =
    | 'offset_years'
    | 'offset_months'
    | 'offset_weeks'
    | 'offset_days'
    | 'offset_quarters';

const OFFSET_KEYS: OffsetKey[] = [
    'offset_years',
    'offset_months',
    'offset_weeks',
    'offset_days',
    'offset_quarters',
];

export const OFFSET_KEY_BY_PERIOD: Record<Period, OffsetKey> = {
    year: 'offset_years',
    quarter: 'offset_quarters',
    month: 'offset_months',
    week: 'offset_weeks',
    day: 'offset_days',
};

export function createPeriodOptions(localize: LocalizeFn): SelectOption[] {
    return TIME_PERIODS.map((period) => ({
        value: period,
        label: localize(`time.${period}`),
    }));
}

export function readNumericOffset(filter: unknown): number | undefined {
    if (!isRecord(filter)) return undefined;
    for (const k of OFFSET_KEYS) {
        const value = filter[k];
        if (typeof value === 'number') return value;
    }
    return undefined;
}

// checks for a complete valid in_period filter
export function isValidInPeriod(
    filter: CalculationFilter | undefined
): filter is InPeriodDateFilter {
    return (
        !!filter &&
        filter.type === 'date' &&
        filter.condition === 'in_period' &&
        typeof filter.period === 'string'
    );
}

export const isTimePeriod = (v: string): v is Period =>
    TIME_PERIODS.includes(v as Period);
