import { PreviewOverlay } from '@brilliant/components';
import type { DashboardGraphTemplate, DashboardLayoutItem } from '@bv/api';
import { useGraphDataQuery, useGraphTypes } from '~/features/dashboards/hooks';
import { DashboardGraphView } from '~/site/dashboard/graph/DashboardGraphView';
import { useMemo } from 'react';

type GraphPreviewProps = {
    layout: DashboardLayoutItem;
    customTitle: string;
    setName: (name: string) => void;
    typeId: string;
};

export function GraphStudioPreview({
    layout,
    customTitle,
    setName,
    typeId,
}: GraphPreviewProps) {
    const { data: graphTypes } = useGraphTypes();

    const adjustedLayout = useMemo(() => {
        const graphType = graphTypes?.find(
            (option) => option.id.toString() === typeId
        );
        if (!graphType) {
            return layout;
        }

        return {
            ...layout,
            graph: {
                ...layout.graph,
                name: customTitle,
                type: graphType,
            } satisfies DashboardGraphTemplate,
        };
    }, [customTitle, graphTypes, typeId, layout]);

    const {
        data: previewData,
        isLoading: isPreviewLoading,
        error: previewError,
    } = useGraphDataQuery(adjustedLayout.graph.query, 'preview');

    const hasActiveFilters = useMemo(() => {
        const domainExtraFilters =
            adjustedLayout.graph?.query?.domain?.extra_filters;
        if (
            Array.isArray(domainExtraFilters) &&
            domainExtraFilters.length > 0
        ) {
            return true;
        }

        const calculations = adjustedLayout.graph?.query?.calculations;
        return (
            Array.isArray(calculations) &&
            calculations.some(
                (calculation) =>
                    Array.isArray(calculation.extra_filters) &&
                    calculation.extra_filters.length > 0
            )
        );
    }, [adjustedLayout]);

    return (
        <PreviewOverlay className="grid h-dvh w-dvw place-items-center pb-20">
            <div
                className="w-full max-w-screen-sm space-y-lg"
                data-component-name="graph-studio-preview"
            >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-primary bg-primary p-md text-primary">
                    <DashboardGraphView
                        layout={adjustedLayout}
                        setGraphTitle={setName}
                        previewData={previewData ?? null}
                        isPreviewLoading={isPreviewLoading}
                        previewError={previewError}
                        showEditIcon={true}
                        hideMenu
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>
            </div>
        </PreviewOverlay>
    );
}
