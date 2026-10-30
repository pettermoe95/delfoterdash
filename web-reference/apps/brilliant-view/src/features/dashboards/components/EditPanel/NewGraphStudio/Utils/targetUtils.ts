import type { ExtensiveDashboardConceptMetric } from '@bv/api';

export type DisplayTarget =
    | { calculation: number }
    | { target: number; measurement: string };

export const isTargetConcept = (
    displayTarget: unknown
): displayTarget is { calculation: number } =>
    !!displayTarget &&
    typeof displayTarget === 'object' &&
    'calculation' in displayTarget;

export const getManualTargetDisplayObject = (
    manualTarget: string,
    currentConcept: string,
    metrics: ExtensiveDashboardConceptMetric[]
): { target: number; measurement: string } => {
    const measurement = metrics.find(
        (metric) => metric.concept_name === currentConcept
    );
    const display = {
        target: manualTarget === '' ? 0 : Number(manualTarget),
        measurement: measurement?.unit_name ?? '',
    };

    return display;
};
