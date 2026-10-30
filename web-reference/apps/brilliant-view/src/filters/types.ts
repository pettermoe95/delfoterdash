export const DATE_FILTER_CONCEPT = 'date';

export type PeriodTypeName = 'year' | 'quarter' | 'month' | 'week' | 'day';

export type CompareInQueryFilter = {
    type: 'compare';
    value: string;
    condition: {
        in: (string | number)[];
    };
    not?: boolean;
};

export type BetweenQueryFilter = {
    type: 'compare';
    value: string;
    condition: {
        from: string | number;
        to: string | number;
    };
    not?: boolean;
};

export type IsNullQueryFilter = {
    type: 'is_null';
    concept: string;
    not?: boolean;
};

export type InPeriodQueryFilter = {
    type: 'date';
    condition: 'in_period';
    period: PeriodTypeName;
    offset_years?: number;
    offset_quarters?: number;
    offset_months?: number;
    offset_weeks?: number;
    offset_days?: number;
    preset?: string;
};

export type QueryFilter =
    | CompareInQueryFilter
    | BetweenQueryFilter
    | IsNullQueryFilter
    | InPeriodQueryFilter;
