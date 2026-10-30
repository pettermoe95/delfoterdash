import type {
    DashboardDetails,
    DashboardGraph,
    DashboardLayoutItem,
    UpdateDashboardLayoutBatchItem,
} from '@bv/api';
import { useLayoutMutations } from '~/api/mutations/dashboard';
import { useDeleteGraph } from '~/api/mutations/graph';
import type { ViewFilter } from '~/filters/viewFilter';
import useGlobalFilters, {
    useMutateGlobalFilterValue,
} from '~/hooks/useGlobalFilters';
import { useGlobalLayoutMatch } from '~/stores/system';
import type { PropsWithChildren } from 'react';
import { useDashboardParams } from '../hooks/useDashboardParams';
import type { DashboardContextValue } from './dashboardContextValue';
import { InnerDashboardProvider } from './dashboardContextValue';

type DashboardProviderProps = {
    dashboard: DashboardDetails;
} & PropsWithChildren;

export function DashboardProvider({
    dashboard,
    children,
}: DashboardProviderProps) {
    const context = useBuildDashboardContext(dashboard);

    return (
        <InnerDashboardProvider value={context}>
            {children}
        </InnerDashboardProvider>
    );
}

function useBuildDashboardContext(dashboard: DashboardDetails) {
    const { addLayout, updateLayouts } = useLayoutMutations(dashboard);
    const deleteGraph = useDeleteGraph();
    const isFullscreen = useGlobalLayoutMatch('fullscreen');
    const { editMode } = useDashboardParams();

    const conceptFilterValuesMap = useGlobalFilters(dashboard.id);
    const conceptFilterValues = Object.values(conceptFilterValuesMap);
    const dateFilterValue = conceptFilterValues.find(
        (filter) => filter.concept === 'date'
    );
    const filterValueMutation = useMutateGlobalFilterValue(dashboard.id);

    return {
        fullscreen: isFullscreen,
        editMode: editMode && !isFullscreen,
        addGraph(graph: DashboardGraph, x: number, y: number) {
            addLayout.mutate({
                id: -1,
                x,
                y,
                width: 6,
                height: 2,
                graph_id: graph.id,
            });
        },
        moveElement(element: UpdateDashboardLayoutBatchItem) {
            updateLayouts.mutate({ layouts: [element] });
        },
        moveElements(elements: UpdateDashboardLayoutBatchItem[]) {
            updateLayouts.mutate({ layouts: elements });
        },
        removeElement(remove: DashboardLayoutItem) {
            deleteGraph.mutate(remove);
        },
        globalConceptFilters: conceptFilterValues,
        globalDateFilter: dateFilterValue,
        updateFilterValue(filter: ViewFilter) {
            filterValueMutation.set(filter);
        },
        clearFilterValue(concept: string) {
            filterValueMutation.remove(concept);
        },
    } satisfies DashboardContextValue;
}
