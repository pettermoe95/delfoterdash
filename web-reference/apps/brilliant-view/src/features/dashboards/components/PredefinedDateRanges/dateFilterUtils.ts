import { DateBetweenFilter, DateInPeriodFilter } from '~/filters/filters';
import type { QueryFilter } from '~/filters/types';
import type { ViewFilter } from '~/filters/viewFilter';
import type { Period } from '../EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers';
import { getLastYTDRange } from './dateRanges';

export type CompareFilter = Exclude<QueryFilter, { type: 'is_null' }>;

export type DateFilterValue = DateBetweenFilter | DateInPeriodFilter;

export type PresetConfigItem =
    | {
          key: string;
          type: 'timePeriod';
          rangeType: 'this' | 'next' | 'last';
          timePeriod: Period;
          presetValue: string;
          isDefault: boolean;
      }
    | {
          key: string;
          type: 'months';
          rangeType: 'last' | 'next';
          months: number;
          presetValue: string;
          isDefault: boolean;
      }
    | {
          key: string;
          type: 'ytd';
          presetValue: string;
          isDefault: boolean;
      };

export const PRESET_CONFIG = [
    {
        key: 'this_month',
        type: 'timePeriod',
        rangeType: 'this',
        timePeriod: 'month',
        presetValue: 'this_month',
        isDefault: true,
    },
    {
        key: 'this_quarter',
        type: 'timePeriod',
        rangeType: 'this',
        timePeriod: 'quarter',
        presetValue: 'this_quarter',
        isDefault: true,
    },
    {
        key: 'last_month',
        type: 'timePeriod',
        rangeType: 'last',
        timePeriod: 'month',
        presetValue: 'last_month',
        isDefault: false,
    },
    {
        key: 'last_quarter',
        type: 'timePeriod',
        rangeType: 'last',
        timePeriod: 'quarter',
        presetValue: 'last_quarter',
        isDefault: false,
    },
    {
        key: 'last_6_months',
        type: 'months',
        rangeType: 'last',
        months: 6,
        presetValue: 'last_months_6',
        isDefault: true,
    },
    {
        key: 'last_12_months',
        type: 'months',
        rangeType: 'last',
        months: 12,
        presetValue: 'last_months_12',
        isDefault: true,
    },
    {
        key: 'next_month',
        type: 'timePeriod',
        rangeType: 'next',
        timePeriod: 'month',
        presetValue: 'next_month',
        isDefault: false,
    },
    {
        key: 'next_quarter',
        type: 'timePeriod',
        rangeType: 'next',
        timePeriod: 'quarter',
        presetValue: 'next_quarter',
        isDefault: false,
    },
    {
        key: 'next_6_months',
        type: 'months',
        rangeType: 'next',
        months: 6,
        presetValue: 'next_months_6',
        isDefault: false,
    },
    {
        key: 'next_12_months',
        type: 'months',
        rangeType: 'next',
        months: 12,
        presetValue: 'next_months_12',
        isDefault: false,
    },
    {
        key: 'ytd',
        type: 'ytd',
        presetValue: 'ytd',
        isDefault: true,
    },
] as const satisfies readonly PresetConfigItem[];

export type PresetKey = (typeof PRESET_CONFIG)[number]['key'];

export const PRESET_KEYS: PresetKey[] = PRESET_CONFIG.map(
    (preset) => preset.key
);

export const buildDefaultVisibility = (): Record<PresetKey, boolean> =>
    PRESET_KEYS.reduce(
        (acc, key) => {
            const preset = PRESET_CONFIG.find((item) => item.key === key);
            acc[key] = preset?.isDefault ?? false;
            return acc;
        },
        {} as Record<PresetKey, boolean>
    );

export const buildVisibilityFromPresetValues = (
    values: string[] | null
): Record<PresetKey, boolean> | null => {
    if (values === null) return null;
    const valueSet = new Set(values);
    return PRESET_CONFIG.reduce(
        (acc, preset) => {
            acc[preset.key] = valueSet.has(preset.presetValue);
            return acc;
        },
        {} as Record<PresetKey, boolean>
    );
};

export const getEnabledPresets = (
    visibility: Record<PresetKey, boolean>
): string[] =>
    PRESET_CONFIG.filter((preset) => visibility[preset.key]).map(
        (preset) => preset.presetValue
    );

export const isDateRangeFilter = (
    value?: unknown
): value is DateBetweenFilter => value instanceof DateBetweenFilter;

export const isInPeriodFilter = (
    value?: unknown
): value is DateInPeriodFilter => value instanceof DateInPeriodFilter;

export const isYTDRangeFilter = (value?: DateFilterValue): boolean =>
    Boolean(isDateRangeFilter(value) && value.preset === 'ytd');

export const getLastMonthsPresetCount = (
    value?: DateFilterValue
): number | null => {
    if (!isDateRangeFilter(value)) return null;
    const preset = value.preset;
    if (!preset || typeof preset !== 'string') return null;
    const match = /^last_months[:_](\d+)$/.exec(preset);
    if (!match) return null;
    const months = Number(match[1]);
    return Number.isNaN(months) ? null : months;
};

export const getYTDCompareFilter = (): CompareFilter => {
    const range = getLastYTDRange();
    return new DateBetweenFilter(
        range.from,
        range.to
    ).toQueryFilter() as CompareFilter;
};

export const isThisPeriodFilter = (
    dateFilter: DateFilterValue | undefined,
    period: Period
): boolean => {
    if (!isInPeriodFilter(dateFilter)) return false;
    return dateFilter.period.typeName === period && dateFilter.amount === 0;
};

export const isThisMonthFilter = (dateFilter?: DateFilterValue) =>
    isThisPeriodFilter(dateFilter, 'month');
export const isThisQuarterFilter = (dateFilter?: DateFilterValue) =>
    isThisPeriodFilter(dateFilter, 'quarter');

export const isActiveInPeriodPreset = (
    dateFilter: ViewFilter | undefined,
    period: Period,
    amount: number
): boolean =>
    Boolean(
        isInPeriodFilter(dateFilter) &&
            dateFilter.period.typeName === period &&
            dateFilter.amount === amount
    );

export const isActiveDateRangePreset = (
    dateFilter: ViewFilter | undefined,
    preset: string,
    startValue: string,
    endValue: string
): boolean =>
    Boolean(
        isDateRangeFilter(dateFilter) &&
            (dateFilter.preset === preset ||
                (String(dateFilter.from) === startValue &&
                    String(dateFilter.to) === endValue))
    );

export const getTimeRangeTypeLabel = (
    type: 'this' | 'next' | 'last',
    localize: (key: string) => string
) => localize(`time.${type}`);

export const getTimePeriodLabel = (
    period: Period,
    localize: (key: string) => string
) => {
    switch (period) {
        case 'year':
            return localize('time.year');
        case 'quarter':
            return localize('time.quarter');
        case 'month':
            return localize('time.month');
        case 'week':
            return localize('time.week');
        case 'day':
            return localize('time.day');
        default:
            return localize('time.month');
    }
};
