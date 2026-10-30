import type { ConceptSeries, DashboardGraphQueryCalculations } from '@bv/api';
import { queryCalculationSchema, queryCompareFilterSchema } from '@bv/api';
import { DateInPeriodFilter, PeriodType } from '~/filters/filters';
import type {
    FieldPath,
    FieldPathByValue,
    FieldPathValue,
    FieldValues,
    UseFormGetValues,
    UseFormSetValue,
} from 'react-hook-form';
import { isTimePeriod, isValidInPeriod } from './offsetAndPeriodFilterHelpers';

type FormValueSetter<TFieldValues extends FieldValues> = {
    setValue: UseFormSetValue<TFieldValues>;
};

/* --- HELPERS FOR ALL GRAPH TYPES --- */

/**
 * Creates a valid empty compare filter object using schema parsing.
 *
 * This is commonly used to initialize the compare filter section of a domain block
 * when no compare conditions have been defined yet.
 *
 * @returns An empty compare filter with `in: []` condition.
 */
export function createEmptyCompareFilter() {
    return queryCompareFilterSchema.parse({
        condition: { in: [] },
    });
}

/* --- HELPERS FOR GRAPH TYPES THAT CONTAIN MULTIPLE CALCULATIONS (axis / table) --- */

type AddCalculationParams = {
    calculations: DashboardGraphQueryCalculations[];
    appendCalculation: (value: DashboardGraphQueryCalculations) => void;
};

// Used in AxisForm, TableForm and FunnelForm
export function addCalculation(params: AddCalculationParams) {
    const { calculations, appendCalculation } = params;
    const reference = calculations[0];

    const nextCalc = queryCalculationSchema.parse({
        aggregate: reference?.aggregate ?? '',
        filter: reference?.filter ?? [],
    });

    appendCalculation(nextCalc);
}

// Used in AxisForm and FunnelForm
export function buildCalculationFromMetric(
    metric: ConceptSeries,
    useTimeFilter: boolean
): DashboardGraphQueryCalculations {
    return queryCalculationSchema.parse({
        aggregate: metric.concept_name,
        filter: useTimeFilter
            ? [
                  new DateInPeriodFilter(
                      PeriodType.fromTypeName(metric.time_period),
                      metric.deictic_modifier ?? 0
                  ).toQueryFilter(),
              ]
            : [],
    });
}

export function hasInPeriodFilter(
    calc: DashboardGraphQueryCalculations | null | undefined
): boolean {
    const filters = Array.isArray(calc?.filter) ? calc.filter : [];
    return filters.some(isValidInPeriod);
}

// Used in AxisForm and FunnelForm when changing the metric but keeping the
// existing time filter toggle state.
export function buildCalculationFromMetricPreservingTimeFilter(
    currentCalc: DashboardGraphQueryCalculations | undefined,
    metric: ConceptSeries
) {
    const hasTimeFilter = hasInPeriodFilter(currentCalc);
    return buildCalculationFromMetric(metric, hasTimeFilter);
}

// Used in AxisForm and StatusForm for normalizing the domain.group selection
// while respecting all-time data behavior.
export function normalizeDomainGroup(
    value: string | string[] | undefined,
    isAlltime: boolean
): string[] {
    const domainGroup = Array.isArray(value) ? value[0] : value;
    if (!domainGroup) return [];
    if (!isAlltime) return [domainGroup];
    if (isTimePeriod(domainGroup)) {
        return domainGroup === 'year' ? ['year'] : ['year', domainGroup];
    }
    return [domainGroup];
}

// Used in AxisForm, PieForm, StatusForm, and TableForm to apply a group change
// consistently with dirty/validate flags.
export function applyDomainGroupChange<
    TFieldValues extends FieldValues,
    TPath extends FieldPathByValue<TFieldValues, string[] | undefined>,
>(
    form: FormValueSetter<TFieldValues>,
    value: string | string[] | undefined,
    isAlltime: boolean,
    path: TPath = 'domain.group' as TPath
): void {
    const next = normalizeDomainGroup(value, isAlltime);
    form.setValue(path, next as FieldPathValue<TFieldValues, TPath>, {
        shouldDirty: true,
        shouldValidate: true,
    });
}

// Used in graph forms for display-related toggles that should mark the form
// as dirty and validate immediately.
export function setDisplayValue<
    TFieldValues extends FieldValues,
    TPath extends FieldPath<TFieldValues>,
>(
    form: FormValueSetter<TFieldValues>,
    path: TPath,
    value: FieldPathValue<TFieldValues, TPath>
) {
    form.setValue(path, value, {
        shouldDirty: true,
        shouldValidate: true,
    });
}

// Used in graph forms for boolean display toggles such as showDecimals,
// showComparison, showGraph, and showGoal.
export function setDisplayToggle<
    TFieldValues extends FieldValues,
    TPath extends FieldPathByValue<TFieldValues, boolean | undefined>,
>(form: FormValueSetter<TFieldValues>, path: TPath, checked: boolean) {
    setDisplayValue(form, path, checked as FieldPathValue<TFieldValues, TPath>);
}

type ManualTargetDisplayOptions = {
    calculationIndex: number;
    measurement?: string;
    targetValue?: number;
};

// Used in GaugeForm, StatusForm, and CylinderForm for manual target toggles.
export function buildManualTargetDisplay(
    checked: boolean,
    options: ManualTargetDisplayOptions
) {
    if (checked) {
        return {
            target: options.targetValue ?? 0,
            measurement: options.measurement ?? 'kr',
        };
    }
    return { calculation: options.calculationIndex };
}

type CalculationFormValues = FieldValues & {
    calculations: DashboardGraphQueryCalculations[];
    alltimeData: boolean;
};

type CalculationFormMethods<TFieldValues extends CalculationFormValues> = {
    getValues: UseFormGetValues<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
};

// Used in FunnelForm and TableForm for toggling the in-period filter without re-building
// the calculation from scratch.
export function toggleInPeriodFilterForCalculation(
    calculation: DashboardGraphQueryCalculations,
    concept: ConceptSeries
): DashboardGraphQueryCalculations {
    const filters = Array.isArray(calculation.filter) ? calculation.filter : [];
    const hasTimeFilter = filters.some(isValidInPeriod);

    if (hasTimeFilter) {
        return {
            ...calculation,
            filter: filters.filter((filter) => !isValidInPeriod(filter)),
        };
    }

    const nextFilter = new DateInPeriodFilter(
        PeriodType.fromTypeName(concept.time_period),
        concept.deictic_modifier ?? 0
    ).toQueryFilter();

    return {
        ...calculation,
        filter: [...filters, nextFilter],
    };
}

// Used in AxisForm and TableForm to toggle the in-period filter and sync
// alltimeData from the updated calculations list.
export function toggleCalculationTimeFilterForForm<
    TFieldValues extends CalculationFormValues,
>(params: {
    form: CalculationFormMethods<TFieldValues>;
    index: number;
    isAlltimeData: (calculations: DashboardGraphQueryCalculations[]) => boolean;
    conceptFromCalculation: (
        calc: DashboardGraphQueryCalculations
    ) => ConceptSeries;
}) {
    const { form, index, isAlltimeData, conceptFromCalculation } = params;
    const calculationPath = `calculations.${index}` as FieldPath<TFieldValues>;
    const currentCalc = form.getValues(calculationPath) as
        | DashboardGraphQueryCalculations
        | undefined;
    if (!currentCalc) {
        return;
    }

    const concept = conceptFromCalculation(currentCalc);
    const nextCalc = toggleInPeriodFilterForCalculation(currentCalc, concept);

    form.setValue(
        calculationPath,
        nextCalc as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
        {
            shouldDirty: true,
            shouldValidate: true,
        }
    );

    const calculationsPath = 'calculations' as FieldPath<TFieldValues>;
    const nextCalcs =
        (form.getValues(calculationsPath) as
            | DashboardGraphQueryCalculations[]
            | undefined) ?? [];
    form.setValue(
        'alltimeData' as FieldPath<TFieldValues>,
        isAlltimeData(nextCalcs) as FieldPathValue<
            TFieldValues,
            FieldPath<TFieldValues>
        >,
        {
            shouldDirty: true,
        }
    );
}

// Used in AxisForm, TableForm, and FunnelForm for updating a calculation's
// metric while preserving the time filter toggle. Optional callbacks allow
// form-specific side effects (e.g., legend text or alltime data).
export function setCalculationMetricForForm<
    TFieldValues extends CalculationFormValues,
>(params: {
    form: CalculationFormMethods<TFieldValues>;
    index: number;
    metric: ConceptSeries;
    buildNextCalc: (
        currentCalc: DashboardGraphQueryCalculations | undefined,
        metric: ConceptSeries
    ) => DashboardGraphQueryCalculations;
    onAfterSet?: (nextCalc: DashboardGraphQueryCalculations) => void;
}) {
    const { form, index, metric, buildNextCalc, onAfterSet } = params;
    const calculationPath = `calculations.${index}` as FieldPath<TFieldValues>;
    const currentCalc = form.getValues(calculationPath) as
        | DashboardGraphQueryCalculations
        | undefined;
    const nextCalc = buildNextCalc(currentCalc, metric);
    form.setValue(
        calculationPath,
        nextCalc as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
        {
            shouldDirty: true,
            shouldValidate: true,
        }
    );
    onAfterSet?.(nextCalc);
}

// Used in GaugeForm, CylinderForm, and StatusForm to toggle a time filter
// flag and keep alltimeData in sync.
export function toggleTimeFilterFlag<
    TFieldValues extends FieldValues & {
        conceptTimeFilter?: boolean;
        targetTimeFilter?: boolean;
        comparisonTimeFilter?: boolean;
        alltimeData: boolean;
    },
>(params: {
    form: FormValueSetter<TFieldValues>;
    currentValue: boolean;
    flagName: 'conceptTimeFilter' | 'targetTimeFilter' | 'comparisonTimeFilter';
    otherActive?: boolean;
}) {
    const { form, currentValue, flagName, otherActive = false } = params;
    const next = !currentValue;
    form.setValue(
        flagName as FieldPath<TFieldValues>,
        next as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
        {
            shouldDirty: true,
        }
    );
    form.setValue(
        'alltimeData' as FieldPath<TFieldValues>,
        !(otherActive || next) as FieldPathValue<
            TFieldValues,
            FieldPath<TFieldValues>
        >,
        { shouldDirty: true }
    );
}
