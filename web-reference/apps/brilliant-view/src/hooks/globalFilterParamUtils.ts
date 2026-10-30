import { ViewFilterFactory } from '~/filters/factory';
import { PeriodType } from '~/filters/filters';
import type { PeriodTypeName } from '~/filters/types';
import type { ViewFilter } from '~/filters/viewFilter';

type SearchParamValue = string | string[];
type SearchParamsRecord = Partial<Record<string, SearchParamValue>>;

type ParamFilterEntry = {
    include?: string[];
    exclude?: string[];
    from?: string;
    to?: string;
    notBetween?: boolean;
    isNull?: boolean;
    preset?: string;
    datePeriod?: string;
    dateAmount?: string;
};

const toStringArray = (value: SearchParamValue | undefined): string[] => {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
};

const FILTER_POSTFIXES = [
    'Include',
    'Exclude',
    'From',
    'To',
    'NotBetween',
    'IsNull',
    'Preset',
] as const;

type FilterPostfix = (typeof FILTER_POSTFIXES)[number];

const FILTER_PARAM_HANDLERS: Record<
    FilterPostfix,
    (entry: ParamFilterEntry, values: string[]) => void
> = {
    Include: (entry, values) => {
        entry.include = values;
    },
    Exclude: (entry, values) => {
        entry.exclude = values;
    },
    From: (entry, values) => {
        entry.from = values[0];
    },
    To: (entry, values) => {
        entry.to = values[0];
    },
    NotBetween: (entry, values) => {
        entry.notBetween = values[0] !== 'false';
    },
    IsNull: (entry, values) => {
        entry.isNull = values[0] !== 'false';
    },
    Preset: (entry, values) => {
        entry.preset = values[0];
    },
};

const DATE_PARAM_KEYS = [
    'dateFrom',
    'dateTo',
    'datePreset',
    'datePeriod',
    'dateAmount',
    'period',
    'amount',
] as const;

type DateParamKey = (typeof DATE_PARAM_KEYS)[number];
const DATE_PARAM_KEY_SET = new Set(DATE_PARAM_KEYS);

const DATE_PARAM_HANDLERS: Record<
    DateParamKey,
    (entry: ParamFilterEntry, value: SearchParamValue) => void
> = {
    dateFrom: (entry, value) => {
        entry.from = toStringArray(value)[0];
    },
    dateTo: (entry, value) => {
        entry.to = toStringArray(value)[0];
    },
    datePreset: (entry, value) => {
        entry.preset = toStringArray(value)[0];
    },
    datePeriod: (entry, value) => {
        entry.datePeriod = toStringArray(value)[0];
    },
    dateAmount: (entry, value) => {
        entry.dateAmount = toStringArray(value)[0];
    },
    period: (entry, value) => {
        entry.datePeriod = toStringArray(value)[0];
    },
    amount: (entry, value) => {
        entry.dateAmount = toStringArray(value)[0];
    },
};

const isDateParamKey = (key: string): key is DateParamKey =>
    DATE_PARAM_KEY_SET.has(key as DateParamKey);

const isPeriodTypeName = (value: unknown): value is PeriodTypeName =>
    value === 'year' ||
    value === 'quarter' ||
    value === 'month' ||
    value === 'week' ||
    value === 'day';

export const DATE_FILTER_KEY = 'date';

export const snapshotSearchParams = (
    params: URLSearchParams
): SearchParamsRecord => {
    const snapshot: SearchParamsRecord = {};

    params.forEach((value, key) => {
        appendParamRecord(snapshot, key, value);
    });

    return snapshot;
};

export const buildSearchParams = (
    record: SearchParamsRecord
): URLSearchParams => {
    const nextParams = new URLSearchParams();

    Object.entries(record).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((entry) => {
                if (entry !== '') {
                    nextParams.append(key, entry);
                }
            });
            return;
        }

        if (value !== '') {
            nextParams.set(key, value);
        }
    });

    return nextParams;
};

export const appendParamRecord = (
    record: SearchParamsRecord,
    key: string,
    value: string
): void => {
    const existingValue = record[key];

    if (existingValue === undefined) {
        record[key] = value;
        return;
    }

    if (Array.isArray(existingValue)) {
        existingValue.push(value);
        return;
    }

    record[key] = [existingValue, value];
};

export const clearFilterParams = (
    concept: string,
    params: URLSearchParams
): URLSearchParams => {
    const nextParams = new URLSearchParams(params);

    if (concept === DATE_FILTER_KEY) {
        DATE_PARAM_KEYS.forEach((key) => nextParams.delete(key));
        return nextParams;
    }

    nextParams.delete(`${concept}Include`);
    nextParams.delete(`${concept}Exclude`);
    nextParams.delete(`${concept}From`);
    nextParams.delete(`${concept}To`);
    nextParams.delete(`${concept}NotBetween`);
    nextParams.delete(`${concept}IsNull`);
    nextParams.delete(`${concept}Preset`);

    return nextParams;
};

export const buildBaseFilters = (
    enabledDashboardFilters: readonly string[],
    globalFilterValues?: Record<string, ViewFilter>
): Record<string, ViewFilter> => {
    return enabledDashboardFilters.reduce<Record<string, ViewFilter>>(
        (filters, concept) => {
            const existingFilter = globalFilterValues?.[concept];

            filters[concept] =
                existingFilter ?? ViewFilterFactory.createEmpty(concept);

            return filters;
        },
        {}
    );
};

const applyDateParam = (
    entry: ParamFilterEntry,
    filters: Record<string, ViewFilter>
): Record<string, ViewFilter> => {
    if (entry.datePeriod && isPeriodTypeName(entry.datePeriod)) {
        const period = PeriodType.fromTypeName(entry.datePeriod);
        const parsedAmount = Number(entry.dateAmount ?? 0);
        const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

        const dateFilter = ViewFilterFactory.fromDateValue({
            condition: 'in_period',
            period: period.typeName,
            [period.offsetName]: amount,
            ...(entry.preset ? { preset: entry.preset } : {}),
        });

        if (!dateFilter) {
            return filters;
        }

        return {
            ...filters,
            [DATE_FILTER_KEY]: dateFilter,
        };
    }

    if (entry.from && entry.to) {
        const dateFilter = ViewFilterFactory.fromFilterValue(DATE_FILTER_KEY, {
            from: entry.from,
            to: entry.to,
            ...(entry.preset ? { preset: entry.preset } : {}),
        });

        if (!dateFilter) {
            return filters;
        }

        return {
            ...filters,
            [DATE_FILTER_KEY]: dateFilter,
        };
    }

    return filters;
};

const createViewFilterFromParamEntry = (
    concept: string,
    entry: ParamFilterEntry
): ViewFilter | null => {
    if (entry.isNull !== undefined) {
        return (
            ViewFilterFactory.fromFilterValue(concept, {
                is_null: true,
                ...(entry.isNull ? {} : { not: true }),
            }) ?? null
        );
    }

    if (entry.from || entry.to) {
        return (
            ViewFilterFactory.fromFilterValue(concept, {
                from: entry.from ?? '',
                to: entry.to ?? '',
                ...(entry.notBetween ? { not: true } : {}),
            }) ?? null
        );
    }

    if (entry.exclude?.length) {
        return (
            ViewFilterFactory.fromFilterValue(concept, {
                in: entry.exclude,
                not: true,
            }) ?? null
        );
    }

    if (entry.include?.length) {
        return (
            ViewFilterFactory.fromFilterValue(concept, {
                in: entry.include,
            }) ?? null
        );
    }

    return null;
};

export const applyParamFilters = (
    baseFilters: Record<string, ViewFilter>,
    paramFilters: Record<string, ParamFilterEntry>
): Record<string, ViewFilter> => {
    return Object.entries(paramFilters).reduce<Record<string, ViewFilter>>(
        (filters, [concept, entry]) => {
            if (concept === DATE_FILTER_KEY) {
                return applyDateParam(entry, filters);
            }

            const viewFilter = createViewFilterFromParamEntry(concept, entry);

            if (!viewFilter) {
                return filters;
            }

            return {
                ...filters,
                [concept]: viewFilter,
            };
        },
        baseFilters
    );
};

const getOrCreateParamFilterEntry = (
    entries: Record<string, ParamFilterEntry>,
    concept: string
): ParamFilterEntry => {
    if (!entries[concept]) {
        entries[concept] = {};
    }

    return entries[concept];
};

const splitConceptParam = (
    key: string
): { concept: string; suffix: FilterPostfix } | null => {
    const suffix = FILTER_POSTFIXES.find((postfix) => key.endsWith(postfix));

    if (!suffix) {
        return null;
    }

    return {
        concept: key.slice(0, -suffix.length),
        suffix,
    };
};

export const collectParamFilters = (
    paramsSnapshot: SearchParamsRecord,
    enabledDashboardFilters: ReadonlySet<string>
): {
    paramFilters: Record<string, ParamFilterEntry>;
    passthroughParams: SearchParamsRecord;
} => {
    const paramFilters: Record<string, ParamFilterEntry> = {};
    const passthroughParams: SearchParamsRecord = {};

    Object.entries(paramsSnapshot).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }
        if (isDateParamKey(key)) {
            if (!enabledDashboardFilters.has(DATE_FILTER_KEY)) {
                passthroughParams[key] = value;
                return;
            }

            const entry = getOrCreateParamFilterEntry(
                paramFilters,
                DATE_FILTER_KEY
            );
            DATE_PARAM_HANDLERS[key](entry, value);
            return;
        }

        const splitParam = splitConceptParam(key);

        if (!splitParam) {
            passthroughParams[key] = value;
            return;
        }

        const { concept, suffix } = splitParam;

        if (!enabledDashboardFilters.has(concept)) {
            passthroughParams[key] = value;
            return;
        }

        const entry = getOrCreateParamFilterEntry(paramFilters, concept);
        FILTER_PARAM_HANDLERS[suffix](entry, toStringArray(value));
    });

    return { paramFilters, passthroughParams };
};

export const buildFiltersQueryParams = (
    filters: Record<string, ViewFilter>,
    passthroughParams: SearchParamsRecord
): SearchParamsRecord => {
    const nextParams: SearchParamsRecord = { ...passthroughParams };

    Object.values(filters).forEach((filter) => {
        if (!filter?.isActive()) {
            return;
        }

        filter.toQueryParams().forEach((value, key) => {
            appendParamRecord(nextParams, key, value);
        });
    });

    return nextParams;
};
