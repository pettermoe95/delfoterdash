import type { DashboardGraphType, GenericData } from '@bv/api';
import { useMemo } from 'react';

type UseCalculationTargetProps = {
    graphType?: DashboardGraphType;
    graphData?: GenericData | null;
};

/**
 * Encapsulated check for gauge/status graph type to reduce complexity
 */
function isGraphTypeWithTarget(graphType?: DashboardGraphType): boolean {
    return (
        graphType?.name === 'gauge' ||
        graphType?.name === 'status' ||
        graphType?.name === 'cylinder'
    );
}

/**
 * Safely extracts the target value if possible
 */
function extractFirstCalculationValue(
    graphData?: GenericData | null
): number | null {
    return graphData?.calculations[1]?.series[0]?.values[0]?.y ?? null;
}

export function useCalculationTarget({
    graphType,
    graphData,
}: UseCalculationTargetProps): number | null {
    return useMemo(() => {
        if (!isGraphTypeWithTarget(graphType)) {
            return null;
        }

        return extractFirstCalculationValue(graphData);
    }, [graphType, graphData]);
}
