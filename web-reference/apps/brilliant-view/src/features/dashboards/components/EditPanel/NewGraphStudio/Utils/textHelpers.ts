import type { DashboardConceptMetric, DashboardGraphQuery } from '@bv/api';
import { parseDate } from '@internationalized/date';
import type { InPeriodQueryFilter } from '~/filters/types';
import { isRecord } from '~/utils/typeGuards';
import {
    getToday,
    getYTDRange,
    isMatchingRange,
} from '../../../PredefinedDateRanges/dateRanges';
import type { LocalizeFn } from './compareTextUtils';
import {
    isTimePeriod,
    readNumericOffset,
} from './offsetAndPeriodFilterHelpers';

const MAX_ROLLING_MONTHS = 24;
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});
const RELATION_BY_OFFSET = {
    [-1]: 'last',
    0: 'this',
    1: 'next',
} as const;

type DateRangeQueryFilter = {
    type: 'compare';
    value: 'date';
    condition: {
        from: string;
        to: string;
    };
    preset?: string;
};

type DateFilter = InPeriodQueryFilter | DateRangeQueryFilter;

type GetGraphDisplayNameParams = {
    name?: string | null;
    query?: DashboardGraphQuery | null;
    metrics?: DashboardConceptMetric[];
    localize: LocalizeFn;
};

export type GraphCalculation = DashboardGraphQuery['calculations'][number];

function lowerFirst(value: string): string {
    return value ? value[0].toLowerCase() + value.slice(1) : value;
}

export function getMetricDisplayName(
    aggregate: string,
    metrics?: DashboardConceptMetric[]
): string | undefined {
    return metrics?.find((metric) => metric.concept_name === aggregate)
        ?.concept_name_pretty;
}

function isInPeriodDateFilter(filter: unknown): filter is InPeriodQueryFilter {
    return (
        isRecord(filter) &&
        filter.type === 'date' &&
        filter.condition === 'in_period' &&
        typeof filter.period === 'string' &&
        isTimePeriod(filter.period)
    );
}

function isDateRangeQueryFilter(
    filter: unknown
): filter is DateRangeQueryFilter {
    if (
        !isRecord(filter) ||
        filter.type !== 'compare' ||
        filter.value !== 'date'
    ) {
        return false;
    }

    const condition = filter.condition;

    return (
        isRecord(condition) &&
        typeof condition.from === 'string' &&
        typeof condition.to === 'string'
    );
}

export function findDateFilter(
    calculation: GraphCalculation
): DateFilter | undefined {
    return [
        ...(calculation.extra_filters ?? []),
        ...(calculation.filter ?? []),
    ].find(
        (filter) =>
            isInPeriodDateFilter(filter) || isDateRangeQueryFilter(filter)
    );
}

function localizeTime(localize: LocalizeFn | undefined, key: string): string {
    return lowerFirst(localize ? localize(`time.${key}`) : key);
}

function formatOffsetLabel(
    filter: InPeriodQueryFilter,
    localize?: LocalizeFn
): string | undefined {
    const offset = readNumericOffset(filter);

    if (typeof offset !== 'number') {
        return undefined;
    }

    const relation =
        RELATION_BY_OFFSET[offset as keyof typeof RELATION_BY_OFFSET];

    if (relation) {
        if (relation === 'last' && filter.period === 'year') {
            return localize
                ? lowerFirst(localize('time.lastYear'))
                : 'last year';
        }

        return `${localizeTime(localize, relation)} ${localizeTime(localize, filter.period)}`;
    }

    const count = Math.abs(offset);
    const periodLabel = localizeTime(
        localize,
        count === 1 ? filter.period : `${filter.period}s`
    );

    if (offset < 0) {
        if (localize) {
            return localize('time.nTimeUnitsAgo', {
                n: count,
                period: periodLabel,
            });
        }

        return `${count} ${periodLabel} ago`;
    }

    return `${localizeTime(localize, 'in')} ${count} ${periodLabel}`;
}

function getRollingMonthsRange(filter: DateRangeQueryFilter): {
    relation: 'last' | 'next';
    months: number;
} | null {
    const today = getToday();
    const todayString = today.toString();
    const { from, to } = filter.condition;

    for (let months = 1; months <= MAX_ROLLING_MONTHS; months += 1) {
        if (
            to === todayString &&
            from === today.subtract({ months }).toString()
        ) {
            return { relation: 'last', months };
        }

        if (from === todayString && to === today.add({ months }).toString()) {
            return { relation: 'next', months };
        }
    }

    return null;
}

export function formatDateRangeLabel(
    filter: DateRangeQueryFilter,
    localize?: LocalizeFn
): string {
    const range = filter.condition;

    if (isMatchingRange(range, getYTDRange())) {
        return localize ? localize('time.ytdShort') : 'YTD';
    }

    const rollingRange = getRollingMonthsRange(filter);

    if (rollingRange) {
        return `${localizeTime(localize, rollingRange.relation)} ${rollingRange.months} ${localizeTime(localize, 'months')}`;
    }

    const from = DATE_FORMATTER.format(parseDate(range.from).toDate('UTC'));
    const to = DATE_FORMATTER.format(parseDate(range.to).toDate('UTC'));

    return `${from} - ${to}`;
}

export function formatDateFilterLabel(
    filter: DateFilter,
    localize?: LocalizeFn
): string | undefined {
    if (isInPeriodDateFilter(filter)) {
        return formatOffsetLabel(filter, localize);
    }

    if (isDateRangeQueryFilter(filter)) {
        return formatDateRangeLabel(filter, localize);
    }

    return undefined;
}

function generateGraphName(
    formData: DashboardGraphQuery,
    metrics: DashboardConceptMetric[],
    localize: LocalizeFn
): string | undefined {
    const firstCalculation = formData.calculations?.[0];

    if (!firstCalculation) {
        return undefined;
    }

    const metricName = getMetricDisplayName(
        firstCalculation.aggregate,
        metrics
    );

    if (!metricName) {
        return undefined;
    }

    const dateFilter = findDateFilter(firstCalculation);
    const dateLabel = dateFilter
        ? formatDateFilterLabel(dateFilter, localize)
        : undefined;

    return dateLabel ? `${metricName} ${dateLabel}` : metricName;
}

export function getDisplayGraphName({
    name,
    query,
    metrics,
    localize,
}: GetGraphDisplayNameParams): string {
    const storedName = name?.trim() ?? '';
    if (storedName) {
        return storedName;
    }

    if (!query || !metrics?.length) {
        return '';
    }

    return generateGraphName(query, metrics, localize) ?? '';
}
