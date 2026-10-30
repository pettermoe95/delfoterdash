import { createSafeContext } from '@brilliant/bds-core';
import type {
    DashboardGraph,
    DashboardLayoutItem,
    UpdateDashboardLayoutBatchItem,
} from '@bv/api';
import type { ViewFilter } from '~/filters/viewFilter';

export type DashboardContextValue = {
    fullscreen: boolean;
    editMode: boolean;
    addGraph(el: DashboardGraph, x: number, y: number): void;
    moveElement(el: UpdateDashboardLayoutBatchItem): void;
    moveElements(elements: UpdateDashboardLayoutBatchItem[]): void;
    removeElement(el: DashboardLayoutItem): void;
    globalConceptFilters: ViewFilter[];
    globalDateFilter: ViewFilter | undefined;
    updateFilterValue(filter: ViewFilter): void;
    clearFilterValue(concept: string): void;
};

export const [InnerDashboardProvider, useDashboardContext] =
    createSafeContext<DashboardContextValue>(
        'No DashboardProvider found in the tree.'
    );
