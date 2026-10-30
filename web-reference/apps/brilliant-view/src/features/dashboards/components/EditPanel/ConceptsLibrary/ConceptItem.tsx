import { Skeleton } from '@brilliant/bds-core';
import type { DashboardConceptMetric } from '@bv/api';

export function ConceptItem({ metric }: { metric: DashboardConceptMetric }) {
    return (
        <div className="cursor-grab rounded-md border border-secondary bg-secondary px-5 py-3 hover:bg-secondary-hover">
            <h3 className="line-clamp-1 text-primary bv-text-font-sm-regular">
                {metric.concept_name_pretty}
            </h3>
        </div>
    );
}

export function ConceptItemLoader() {
    return (
        <div className="rounded-md border border-secondary bg-secondary px-5 py-3 hover:bg-secondary-hover">
            <Skeleton className="h-4 w-full rounded-xs" />
        </div>
    );
}
