import type { DashboardGraphQuery } from '@bv/api';
import { ViewFilterFactory } from '~/filters/factory';
import type { QueryFilter } from '~/filters/types';
import { isRecord } from '~/utils/typeGuards';

export type AnyFilter =
    | {
          type?: string;
          value?: string;
          concept?: string;
          not?: boolean;
          condition?: unknown;
          period?: unknown;
      }
    | undefined
    | null;

const isStringOrNumber = (value: unknown): value is string | number =>
    typeof value === 'string' || typeof value === 'number';

const isValidRangeValue = (value: unknown): value is string | number => {
    if (!isStringOrNumber(value)) return false;
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    return true;
};

const isQueryFilter = (filter: AnyFilter): filter is QueryFilter => {
    if (!filter || typeof filter !== 'object') return false;
    if (filter.type === 'compare') {
        if (typeof filter.value !== 'string') return false;
        if (!isRecord(filter.condition)) return false;
        const condition = filter.condition;
        if (
            Array.isArray(condition.in) &&
            condition.in.every((item) => isStringOrNumber(item))
        ) {
            return true;
        }
        if (
            isStringOrNumber(condition.from) &&
            isStringOrNumber(condition.to)
        ) {
            return true;
        }
        return false;
    }

    if (filter.type === 'is_null') {
        return typeof filter.concept === 'string';
    }

    if (filter.type === 'date') {
        return (
            filter.condition === 'in_period' &&
            typeof filter.period === 'string'
        );
    }

    return false;
};

export const stripEmptyCompareFilters = (
    filters: AnyFilter[] | undefined | null
): QueryFilter[] => {
    if (!Array.isArray(filters)) return [];

    return filters.filter((filter): filter is QueryFilter => {
        if (!filter || typeof filter !== 'object') return false;

        if (filter.type === 'compare' && isRecord(filter.condition)) {
            const condition = filter.condition;
            const hasRangeKey = 'from' in condition || 'to' in condition;
            if (hasRangeKey) {
                const fromValid = isValidRangeValue(condition.from);
                const toValid = isValidRangeValue(condition.to);
                if (!fromValid || !toValid) {
                    return false;
                }
            }
        }

        if (!isQueryFilter(filter)) {
            // Preserve unknown compare operators (equals/gt/lt/etc.) or
            // filters missing the fields required by the factory.
            return true;
        }

        return ViewFilterFactory.fromQueryFilter(filter).isActive();
    });
};

export function removeEmptyDomain(
    query?: DashboardGraphQuery | null
): DashboardGraphQuery | null | undefined {
    if (!query) {
        return query;
    }

    const domain = query.domain;
    if (!domain || Object.keys(domain).length > 0) {
        return query;
    }

    const { domain: _domain, ...queryWithoutDomain } = query;
    return queryWithoutDomain;
}
