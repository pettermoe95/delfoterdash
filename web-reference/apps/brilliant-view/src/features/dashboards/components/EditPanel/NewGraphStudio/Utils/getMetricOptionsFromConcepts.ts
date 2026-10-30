import type { SelectOption } from '@brilliant/bds-core';
import type { DashboardConceptMetric } from '@bv/api';

export function getMetricOptionsFromConcepts(
    metrics: DashboardConceptMetric[]
): SelectOption[] {
    return metrics
        .sort((a, b) =>
            a.concept_name_pretty.localeCompare(b.concept_name_pretty)
        )
        .map(
            (metric): SelectOption => ({
                value: metric.concept_name,
                label: metric.concept_name_pretty,
            })
        );
}
