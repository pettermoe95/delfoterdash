import { createSafeContext } from '@brilliant/bds-core';
import type {
    DashboardGraphQueryCalculations,
    DashboardLayoutItem,
    GenericData,
} from '@bv/api';

type DashboardGraphProps = {
    layout: DashboardLayoutItem;
    previewData?: GenericData | null;
    isPreviewLoading?: boolean;
    previewError?: unknown;
    hideMenu?: boolean;
    keys?: number;
    setGraphTitle?: (graphTitle: string) => void;
    showEditIcon?: boolean;
    hasActiveFilters?: boolean;
};

export type DashboardGraphContextValue = DashboardGraphProps & {
    isLoading?: boolean;
    error?: unknown;
    hideMenu?: boolean;
    calculations?: DashboardGraphQueryCalculations[];
};

export const [DashboardGraphProvider, useDashboardGraphContext] =
    createSafeContext<DashboardGraphContextValue>(
        'No DashboardGraphProvider found in the tree.'
    );
