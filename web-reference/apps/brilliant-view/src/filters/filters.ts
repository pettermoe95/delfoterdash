import type {
    InPeriodQueryFilter,
    PeriodTypeName,
    QueryFilter,
} from '~/filters/types.ts';
import { DATE_FILTER_CONCEPT } from '~/filters/types.ts';
import { ViewFilter } from '~/filters/viewFilter.ts';

abstract class IncludeExcludeBase extends ViewFilter {
    values: (string | number)[] = [];
    abstract readonly not: boolean;

    constructor(concept: string, values: (string | number)[]) {
        super(concept);
        this.values = values;
    }

    toQueryFilter = () =>
        ({
            type: 'compare',
            value: this.concept,
            condition: {
                in: this.values,
            },
            not: this.not,
        }) as QueryFilter;

    isActive = () => this.values.length > 0;

    toQueryParams = () => {
        const params = new URLSearchParams();
        const paramName = this.concept + (this.not ? 'Exclude' : 'Include');
        this.values.forEach((value) =>
            params.append(paramName, value.toString())
        );
        return params;
    };
}

export class IncludeFilter extends IncludeExcludeBase {
    readonly not = false;
}

export class ExcludeFilter extends IncludeExcludeBase {
    readonly not = true;
}

abstract class AbstractNullFilter extends ViewFilter {
    abstract not: boolean;

    toQueryFilter = () =>
        ({
            type: 'is_null',
            concept: this.concept,
            not: this.not,
        }) as QueryFilter;

    isActive = () => true;

    toQueryParams = () =>
        new URLSearchParams([
            [this.concept + 'IsNull', this.not ? 'false' : 'true'],
        ]);
}

export class IsNullFilter extends AbstractNullFilter {
    not = false;
}

export class IsNotNullFilter extends AbstractNullFilter {
    not = true;
}

abstract class AbstractBetweenFilter extends ViewFilter {
    from: string | number | undefined;
    to: string | number | undefined;
    abstract not: boolean;

    constructor(
        concept: string,
        from: string | number | undefined = undefined,
        to: string | number | undefined = undefined
    ) {
        super(concept);
        this.from = from;
        this.to = to;
    }

    toQueryFilter() {
        return {
            type: 'compare',
            value: this.concept,
            condition: {
                from: this.from,
                to: this.to,
            },
            not: this.not,
        } as QueryFilter;
    }

    isActive = () => {
        const fromValid =
            this.from !== undefined &&
            this.from !== null &&
            String(this.from).trim() !== '';
        const toValid =
            this.to !== undefined &&
            this.to !== null &&
            String(this.to).trim() !== '';
        return fromValid && toValid;
    };

    toQueryParams() {
        const params = new URLSearchParams();
        if (
            this.isActive() &&
            this.from !== undefined &&
            this.to !== undefined
        ) {
            params.append(this.concept + 'From', this.from.toString());
            params.append(this.concept + 'To', this.to.toString());
            if (this.not) {
                params.append(this.concept + 'NotBetween', 'true');
            }
        }
        return params;
    }
}

export class BetweenFilter extends AbstractBetweenFilter {
    not = false;
}

export class NotBetweenFilter extends AbstractBetweenFilter {
    not = true;
}

export class DateBetweenFilter extends AbstractBetweenFilter {
    not = false;
    preset?: string;

    constructor(
        from: string | number | undefined = undefined,
        to: string | number | undefined = undefined,
        preset?: string
    ) {
        super(DATE_FILTER_CONCEPT, from, to);
        this.preset = preset;
    }

    override toQueryParams = () => {
        const params = super.toQueryParams();
        if (this.preset) {
            params.append(this.concept + 'Preset', this.preset.toString());
        }
        return params;
    };

    override toQueryFilter = () => {
        const base = super.toQueryFilter();
        return this.preset ? { ...base, preset: this.preset } : base;
    };
}

export class PeriodType {
    private constructor(
        public readonly typeName: PeriodTypeName,
        public readonly offsetName: string
    ) {}

    static readonly Day = new PeriodType('day', 'offset_days');
    static readonly Week = new PeriodType('week', 'offset_weeks');
    static readonly Month = new PeriodType('month', 'offset_months');
    static readonly Quarter = new PeriodType('quarter', 'offset_quarters');
    static readonly Year = new PeriodType('year', 'offset_years');

    static fromTypeName(typeName: PeriodTypeName): PeriodType {
        switch (typeName) {
            case 'day':
                return PeriodType.Day;
            case 'week':
                return PeriodType.Week;
            case 'month':
                return PeriodType.Month;
            case 'quarter':
                return PeriodType.Quarter;
            case 'year':
            default:
                return PeriodType.Year;
        }
    }
}

export class DateInPeriodFilter extends ViewFilter {
    period: PeriodType;
    amount: number;
    preset?: string;

    constructor(period: PeriodType, amount = 0, preset?: string) {
        super(DATE_FILTER_CONCEPT);
        this.period = period;
        this.amount = amount;
        this.preset = preset;
    }

    isActive = () => this.period !== undefined;
    toQueryFilter = () => {
        const base = {
            type: 'date',
            condition: 'in_period',
            period: this.period.typeName,
            [this.period.offsetName]: this.amount,
        } as QueryFilter;
        return this.preset ? { ...base, preset: this.preset } : base;
    };

    toQueryParams(): URLSearchParams {
        const params = new URLSearchParams([
            ['datePeriod', this.period.typeName],
            ['dateAmount', this.amount.toString()],
        ]);
        if (this.preset) {
            params.append('datePreset', this.preset);
        }
        return params;
    }

    static getOffset(filter: InPeriodQueryFilter): number {
        switch (filter.period) {
            case 'day':
                return filter.offset_days ?? 0;
            case 'week':
                return filter.offset_weeks ?? 0;
            case 'month':
                return filter.offset_months ?? 0;
            case 'quarter':
                return filter.offset_quarters ?? 0;
            case 'year':
            default:
                return filter.offset_years ?? 0;
        }
    }
}
