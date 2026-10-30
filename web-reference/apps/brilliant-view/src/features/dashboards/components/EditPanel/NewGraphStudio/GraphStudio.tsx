import { Button, Icon, SingleSelect } from '@brilliant/bds-core';
import type {
    DashboardGraphType,
    DashboardLayoutItem,
    GraphFormatUnion,
} from '@bv/api';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateGraph } from '~/api/mutations/graph.ts';
import { QUERY_KEY } from '~/api/queryKeys';
import { GraphStudioPreview } from '~/features/dashboards/components/EditPanel/GraphStudio/GraphStudioPreview.tsx';
import { useDashboardContext } from '~/features/dashboards/context/dashboardContextValue';
import { useDashboardData, useDashboardId } from '~/features/dashboards/hooks';
import { useCreateGraph } from '~/features/dashboards/hooks/useCreateGraph';
import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useNewGraphStudioData } from '~/features/dashboards/hooks/useGraphStudioData.tsx';
import { useGraphTypes } from '~/features/dashboards/hooks/useGraphTypes';
import { DateBetweenFilter, DateInPeriodFilter } from '~/filters/filters';
import { useLocalizeFieldConcepts, useMetricConcepts } from '~/hooks';
import { useLocalize } from '~/i18n/I18nContext';
import { useGraphTypeOptions } from '~/site/dashboard/graph/edit/useGraphTypeOptions.tsx';
import { useEffect, useMemo, useState } from 'react';
import { applyGlobalFiltersToDashboardLayout } from '../../Filters/globalFilterUtils.ts';
import type { PaneProps } from '../Panes';
import { PaneLayout } from '../Panes';
import { GraphForm } from './GraphForm.tsx';
import { changeGraphType } from './Utils/changeGraphType.ts';
import {
    graphFormatToLayout,
    graphFormatToQuery,
} from './Utils/graphTransformations.ts';
import { isGraphTypeId } from './Utils/graphTypeIds.ts';

export function ConceptGraphStudio(pane: PaneProps) {
    const localize = useLocalize();
    const { globalConceptFilters, globalDateFilter } = useDashboardContext();
    const { searchParams, resetPane } = useDashboardParams();
    const { data: dashboard } = useDashboardData();
    const queryClient = useQueryClient();
    const dashboardId = useDashboardId();
    const { data: metrics } = useMetricConcepts();
    const conceptFields = useLocalizeFieldConcepts();
    const { data: graphTypes } = useGraphTypes();
    const isEditGraphMode = Boolean(searchParams.editGraphId);
    const graphBuilderLayout = dashboard?.layouts?.find(
        (l) => l.id.toString() === searchParams.editGraphId
    );
    const [graphTitle, setGraphTitle] = useState(
        graphBuilderLayout?.graph.name
    );

    const layoutGraphTypeId =
        graphBuilderLayout?.graph.type.id.toString() ?? '1';

    const [currentGraphType, setCurrentGraphType] = useState<number>(
        Number(layoutGraphTypeId)
    );

    const { currentGraphData, newGraphStudioData } = useNewGraphStudioData(
        layoutGraphTypeId,
        isEditGraphMode,
        graphBuilderLayout
    );
    const { graphTypeOptions } = useGraphTypeOptions(
        undefined,
        (graphType: DashboardGraphType) => isGraphTypeId(graphType.id)
    );

    const graphType = graphTypes?.find((graphType: DashboardGraphType) => {
        return graphType.id.toString() === layoutGraphTypeId;
    });

    const [graphData, setGraphData] =
        useState<GraphFormatUnion>(currentGraphData);

    useEffect(() => {
        setGraphData(currentGraphData);
    }, [currentGraphData]);

    const handleCancelClick = async () => {
        await queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.DASHBOARD, dashboardId] as const,
        });

        resetPane();
    };

    const selectedLayout = newGraphStudioData.layout;

    const {
        mutateAsync: createGraph,
        isError: isSaveError,
        isPending: isSaveLoading,
    } = useCreateGraph({
        position: selectedLayout
            ? {
                  x: selectedLayout.x,
                  y: selectedLayout.y,
                  width: selectedLayout.width,
                  height: selectedLayout.height,
              }
            : undefined,
    });

    const {
        mutateAsync: updateNewGraph,
        isError: isUpdateError,
        isPending: isUpdateLoading,
    } = useUpdateGraph(graphBuilderLayout);

    const isSaving = isSaveLoading || isUpdateLoading;
    const isError = isSaveError || isUpdateError;

    async function handleSaveClick() {
        const graphQuery = graphFormatToQuery(
            graphData,
            currentGraphType,
            localize
        );
        const name = graphTitle?.trim() ?? '';
        const displayConfig =
            'display' in graphData ? graphData.display : undefined;

        const graph = {
            name,
            type_id: currentGraphType ?? 1,
            query: graphQuery,
            ...(displayConfig !== undefined ? { display: displayConfig } : {}),
        };

        const mut = isEditGraphMode
            ? updateNewGraph(graph)
            : createGraph(graph);
        await mut;
        pane.resetPane();
    }

    const graphTypeChangeHandler = (value: string) => {
        const nextGraphType = Number(value);
        if (
            !isGraphTypeId(nextGraphType) ||
            nextGraphType === currentGraphType
        ) {
            return;
        }

        setGraphData(
            changeGraphType(
                graphData,
                nextGraphType,
                metrics ?? [],
                localize,
                isEditGraphMode && nextGraphType === Number(layoutGraphTypeId)
                    ? currentGraphData
                    : undefined
            )
        );
        setCurrentGraphType(nextGraphType);
    };

    const previewLayout = useMemo<DashboardLayoutItem>(() => {
        const layout = graphFormatToLayout(
            graphData,
            graphBuilderLayout ?? newGraphStudioData.layout,
            currentGraphType,
            localize
        );

        const dateFilterValue =
            globalDateFilter instanceof DateBetweenFilter ||
            globalDateFilter instanceof DateInPeriodFilter
                ? globalDateFilter
                : undefined;

        const globalFilteredLayout = applyGlobalFiltersToDashboardLayout(
            layout,
            globalConceptFilters,
            dateFilterValue,
            localize
        );

        return globalFilteredLayout;
    }, [
        graphBuilderLayout,
        graphData,
        currentGraphType,
        globalConceptFilters,
        globalDateFilter,
        localize,
        newGraphStudioData.layout,
    ]);

    return (
        <PaneLayout className="flex h-full flex-col">
            <div className="mb-6 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4xl">
                    <SingleSelect
                        size="md"
                        options={graphTypeOptions}
                        value={currentGraphType?.toString()}
                        onChange={graphTypeChangeHandler}
                    />
                    <GraphForm
                        metrics={metrics ?? []}
                        conceptFields={conceptFields ?? []}
                        type={currentGraphType ?? graphType?.id}
                        graphData={graphData}
                        setCurrentGraphData={setGraphData}
                    />
                    {isError && (
                        <div className="flex items-center gap-2 rounded-md bg-error-primary p-2 text-error-primary bv-text-font-lg-regular">
                            <Icon icon="mdi:error-outline" />
                            <span>Could not save graph</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-lg">
                <Button
                    variant="ghost"
                    color="gray"
                    onClick={handleCancelClick}
                >
                    {localize('miscTerms.cancel')}
                </Button>
                <Button
                    variant="filled"
                    onClick={handleSaveClick}
                    isLoading={isSaving}
                    disabled={isSaving}
                >
                    {localize('miscTerms.save')}
                </Button>
            </div>
            <GraphStudioPreview
                customTitle={graphTitle ?? ''}
                setName={setGraphTitle}
                typeId={currentGraphType?.toString() ?? layoutGraphTypeId}
                layout={previewLayout}
            />
        </PaneLayout>
    );
}
