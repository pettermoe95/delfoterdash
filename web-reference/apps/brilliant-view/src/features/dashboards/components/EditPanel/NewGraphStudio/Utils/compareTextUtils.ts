import type { Period } from './offsetAndPeriodFilterHelpers';

export type LocalizeFn = (
    key: string,
    vars?: Record<string, string | number>
) => string;

type ConceptCompareTextOptions = {
    baseConceptName: string;
    period: Period;
    offset?: number;
    useTimeFilter: boolean;
    usePriorLabel?: boolean;
    localize: LocalizeFn;
};

const throwUnexpectedTimePeriod = (value: never): never => {
    throw new Error(`Unexpected value: ${String(value)}`);
};

export const formatConceptName = (name: string): string => {
    return name
        .split('_')
        .filter((part) => part.length > 0)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(' ');
};

export const buildConceptCompareText = ({
    baseConceptName,
    period,
    offset,
    useTimeFilter,
    usePriorLabel = false,
    localize,
}: ConceptCompareTextOptions): string => {
    const baseName = formatConceptName(baseConceptName);

    if (!useTimeFilter) return `vs ${baseName}`;

    const lowerFirst = (value: string) =>
        value ? value[0].toLowerCase() + value.slice(1) : value;
    const periodLabel = lowerFirst(localize(`time.${period}`));
    const lastLabel = lowerFirst(localize('time.last'));
    const lastYearLabel = lowerFirst(localize('time.lastYear'));

    if (usePriorLabel && (offset ?? 0) <= -1) {
        switch (period) {
            case 'year':
                return localize('dashboards.compareText.conceptPriorYear');
            case 'quarter':
                return localize('dashboards.compareText.conceptPriorQuarter');
            case 'month':
                return localize('dashboards.compareText.conceptPriorMonth');
            case 'week':
                return localize('dashboards.compareText.conceptPriorWeek');
            case 'day':
                return localize('dashboards.compareText.conceptPriorDay');
        }

        return throwUnexpectedTimePeriod(period);
    }

    const timeLabel =
        period === 'year' ? lastYearLabel : `${lastLabel} ${periodLabel}`;

    return localize('dashboards.compareText.vsPeriod', {
        period: timeLabel,
    });
};

export const formatGlobalCompareText = (
    localize: LocalizeFn,
    options: {
        type:
            | 'ytd'
            | 'this_month'
            | 'this_quarter'
            | 'last_months'
            | 'period_prior'
            | 'this_period'
            | 'vs_period';
        monthsCount?: number;
        period?: Period;
        periodLabel?: string;
    }
): string => {
    const lowerFirst = (value: string) =>
        value ? value[0].toLowerCase() + value.slice(1) : value;

    switch (options.type) {
        case 'ytd':
            return localize('dashboards.compareText.ytd');
        case 'this_month':
            return localize('dashboards.compareText.thisMonth');
        case 'this_quarter':
            return localize('dashboards.compareText.thisQuarter');
        case 'last_months':
            return localize('dashboards.compareText.lastMonths', {
                n: options.monthsCount ?? 0,
            });
        case 'period_prior': {
            const period = options.period;
            if (!period) return localize('dashboards.compareText.lastPeriod');
            switch (period) {
                case 'year':
                    return localize('dashboards.compareText.conceptPriorYear');
                case 'quarter':
                    return localize(
                        'dashboards.compareText.conceptPriorQuarter'
                    );
                case 'month':
                    return localize('dashboards.compareText.conceptPriorMonth');
                case 'week':
                    return localize('dashboards.compareText.conceptPriorWeek');
                case 'day':
                    return localize('dashboards.compareText.conceptPriorDay');
            }

            return throwUnexpectedTimePeriod(period);
        }
        case 'this_period': {
            const period = options.period;
            if (!period) return localize('dashboards.compareText.lastPeriod');
            return localize('dashboards.compareText.vsPeriod', {
                period: `${lowerFirst(localize('time.this'))} ${lowerFirst(localize(`time.${period}`))}`,
            });
        }
        case 'vs_period':
            return localize('dashboards.compareText.vsPeriod', {
                period: options.periodLabel ?? '',
            });
    }

    return throwUnexpectedTimePeriod(options.type);
};
