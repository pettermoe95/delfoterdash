import {
    BetweenFilter,
    DateBetweenFilter,
    DateInPeriodFilter,
    ExcludeFilter,
    IncludeFilter,
    IsNotNullFilter,
    IsNullFilter,
    NotBetweenFilter,
    PeriodType,
} from '~/filters/filters.ts';
import type {
    InPeriodQueryFilter,
    PeriodTypeName,
    QueryFilter,
} from '~/filters/types.ts';
import { DATE_FILTER_CONCEPT } from '~/filters/types.ts';
import type { ViewFilter } from './viewFilter.ts';

export const ViewFilterFactory = {
    fromQueryFilter(queryFilter: QueryFilter): ViewFilter {
        if (queryFilter.type === 'compare') {
            const condition = queryFilter.condition as Record<string, unknown>;

            if (
                Array.isArray(condition.in) &&
                condition.in.every(
                    (item) =>
                        typeof item === 'string' || typeof item === 'number'
                )
            ) {
                return queryFilter.not
                    ? new ExcludeFilter(queryFilter.value, condition.in)
                    : new IncludeFilter(queryFilter.value, condition.in);
            }

            if (
                (typeof condition.from === 'string' ||
                    typeof condition.from === 'number') &&
                (typeof condition.to === 'string' ||
                    typeof condition.to === 'number')
            ) {
                const from = condition.from;
                const to = condition.to;

                if (queryFilter.value === DATE_FILTER_CONCEPT) {
                    const preset =
                        'preset' in queryFilter &&
                        typeof queryFilter.preset === 'string'
                            ? queryFilter.preset
                            : undefined;
                    return new DateBetweenFilter(from, to, preset);
                }

                return queryFilter.not
                    ? new NotBetweenFilter(queryFilter.value, from, to)
                    : new BetweenFilter(queryFilter.value, from, to);
            }
        } else if (queryFilter.type === 'is_null') {
            return queryFilter.not
                ? new IsNotNullFilter(queryFilter.concept)
                : new IsNullFilter(queryFilter.concept);
        } else if (queryFilter.type === 'date') {
            return new DateInPeriodFilter(
                PeriodType.fromTypeName(queryFilter.period),
                DateInPeriodFilter.getOffset(queryFilter),
                queryFilter.preset
            );
        }

        throw new Error('Trying to build ViewFilter from unknown structure.');
    },

    fromFilterValue(concept: string, value: unknown): ViewFilter | null {
        if (concept === DATE_FILTER_CONCEPT) {
            return ViewFilterFactory.fromDateValue(value);
        }

        if (isCompareBetweenFilterValue(value)) {
            const { from, to } = getBetweenRange(value);
            return value.not
                ? new NotBetweenFilter(concept, from, to)
                : new BetweenFilter(concept, from, to);
        }

        if (isNullFilterValue(value)) {
            return value.not
                ? new IsNotNullFilter(concept)
                : new IsNullFilter(concept);
        }

        const isCompareValue = isCompareFilterValue(value);

        if (value && typeof value === 'object' && !isCompareValue) {
            return null;
        }

        const values = toStringArray(isCompareValue ? value.in : value);
        if (values.length === 0) {
            if (isCompareValue) {
                return value.not
                    ? new ExcludeFilter(concept, [])
                    : new IncludeFilter(concept, []);
            }
            return null;
        }

        if (isCompareFilterValue(value) && value.not) {
            return new ExcludeFilter(concept, values);
        }

        return new IncludeFilter(concept, values);
    },

    fromDateValue(
        value: unknown
    ): DateBetweenFilter | DateInPeriodFilter | null {
        if (
            value &&
            typeof value === 'object' &&
            'from' in value &&
            'to' in value &&
            (typeof (value as { from?: unknown }).from === 'string' ||
                typeof (value as { from?: unknown }).from === 'number') &&
            (typeof (value as { to?: unknown }).to === 'string' ||
                typeof (value as { to?: unknown }).to === 'number')
        ) {
            const from = (value as { from: string | number }).from;
            const to = (value as { to: string | number }).to;
            const preset =
                typeof (value as { preset?: unknown }).preset === 'string'
                    ? (value as { preset?: string }).preset
                    : undefined;
            return new DateBetweenFilter(from, to, preset);
        }

        if (
            value &&
            typeof value === 'object' &&
            (value as { condition?: unknown }).condition === 'in_period' &&
            typeof (value as { period?: unknown }).period === 'string'
        ) {
            const periodType = PeriodType.fromTypeName(
                (value as { period: PeriodTypeName }).period
            );
            const amount = DateInPeriodFilter.getOffset(
                value as InPeriodQueryFilter
            );
            const preset: string | undefined =
                typeof (value as { preset?: unknown }).preset === 'string'
                    ? (value as { preset: string }).preset
                    : undefined;
            return new DateInPeriodFilter(periodType, amount, preset);
        }

        return null;
    },

    createEmpty(concept: string): ViewFilter {
        if (concept === DATE_FILTER_CONCEPT) {
            return new DateBetweenFilter();
        }
        return new IncludeFilter(concept, []);
    },
};

type CompareFilterValue = {
    in: unknown;
    not?: boolean;
};

type CompareBetweenFilterValue = {
    from?: unknown;
    to?: unknown;
    not?: boolean;
};

const isCompareFilterValue = (value: unknown): value is CompareFilterValue =>
    Boolean(
        value &&
            typeof value === 'object' &&
            'in' in value &&
            Array.isArray((value as CompareFilterValue).in)
    );

const isCompareBetweenFilterValue = (
    value: unknown
): value is CompareBetweenFilterValue => {
    if (!value || typeof value !== 'object') return false;
    return 'from' in value || 'to' in value;
};

const isNullFilterValue = (
    value: unknown
): value is { is_null?: unknown; not?: boolean } => {
    if (!value || typeof value !== 'object') return false;
    return (
        'is_null' in value && (value as { is_null?: unknown }).is_null === true
    );
};

const getBetweenRange = (value: CompareBetweenFilterValue) => {
    const from = value.from;
    const to = value.to;
    return {
        from:
            typeof from === 'number' || typeof from === 'string'
                ? from
                : undefined,
        to: typeof to === 'number' || typeof to === 'string' ? to : undefined,
    };
};

export const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value
            .filter(
                (entry): entry is string | number | boolean =>
                    (typeof entry === 'string' && entry !== '') ||
                    typeof entry === 'number' ||
                    typeof entry === 'boolean'
            )
            .map((entry) => String(entry));
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry !== '');
    }

    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return [String(value)];
    }

    return [];
};
