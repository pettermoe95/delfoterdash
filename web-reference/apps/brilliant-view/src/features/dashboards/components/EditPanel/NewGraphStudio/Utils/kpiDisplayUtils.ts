import { gaugeGraphFormatSchema, normalizeDashboardDisplay } from '@bv/api';
import type { GaugeGraphFormat } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';

type KpiDisplayDefaults = {
    comparisonCalculationIndex: number;
    targetCalculationIndex: number;
    isShowingGraph?: boolean;
    isShowingGoal?: boolean;
};

export function normalizeKpiDisplay(
    value: unknown,
    defaults: KpiDisplayDefaults
): GaugeGraphFormat['display'] | undefined {
    const normalized = normalizeDashboardDisplay<unknown>(value);
    if (!isRecord(normalized)) return undefined;

    const compare = isRecord(normalized.compare) ? normalized.compare : {};
    const target = isRecord(normalized.target) ? normalized.target : {};
    const isShowingGraph = getBooleanOrDefault(
        compare.isShowingGraph,
        defaults.isShowingGraph
    );
    const isShowingGoal = getBooleanOrDefault(
        compare.isShowingGoal,
        defaults.isShowingGoal
    );

    const candidate = {
        showDecimals:
            typeof normalized.showDecimals === 'boolean'
                ? normalized.showDecimals
                : false,
        compare: {
            isShowingComparison:
                typeof compare.isShowingComparison === 'boolean'
                    ? compare.isShowingComparison
                    : true,
            calculation:
                typeof compare.calculation === 'number'
                    ? compare.calculation
                    : defaults.comparisonCalculationIndex,
            compareText:
                typeof compare.compareText === 'string'
                    ? compare.compareText
                    : '',
            measurement:
                typeof compare.measurement === 'string'
                    ? compare.measurement
                    : '',
            ...(isShowingGraph === undefined ? {} : { isShowingGraph }),
            ...(isShowingGoal === undefined ? {} : { isShowingGoal }),
            ...(typeof compare.type === 'string' ? { type: compare.type } : {}),
        },
        target:
            typeof target.target === 'number' &&
            typeof target.measurement === 'string'
                ? {
                      target: target.target,
                      measurement: target.measurement,
                  }
                : {
                      calculation:
                          typeof target.calculation === 'number'
                              ? target.calculation
                              : defaults.targetCalculationIndex,
                  },
    };
    const parsed = gaugeGraphFormatSchema.shape.display.safeParse(candidate);

    return parsed.success ? parsed.data : undefined;
}

function getBooleanOrDefault(
    value: unknown,
    defaultValue: boolean | undefined
): boolean | undefined {
    return typeof value === 'boolean' ? value : defaultValue;
}
