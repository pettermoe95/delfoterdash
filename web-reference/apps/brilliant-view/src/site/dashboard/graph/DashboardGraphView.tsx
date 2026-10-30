import type { DashboardLayoutItem, GenericData } from '@bv/api';
import { cn, GraphElement } from '@bv/ui';
import {
    useCustomDisplayOptions,
    useDashboardContext,
} from '~/features/dashboards';
import { buildDashboardGraphDisplayConfig } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/legendTextHelpers';
import { useMetricConcepts } from '~/hooks';
import { useDashboardGraphData } from '~/hooks/useDashboardGraphData';
import { useLocaleValue, useLocalize } from '~/i18n/I18nContext';
import { useActiveTheme } from '~/stores/system';
import { isAxiosError } from 'axios';
import { useMemo } from 'react';
import { BusinessLogoGraph } from './BusinessLogoGraph';
import { DashboardGraphProvider } from './dashboardGraphContext';
import { DashboardGraphHeader } from './DashboardGraphHeader';
import { GraphBuilderElement } from './GraphBuilderElement';
import { GraphError } from './GraphError';

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

const HEADER_HEIGHT = '50px';

type GraphDisplayConfig = Record<string, unknown>;

export function DashboardGraphView({
    layout,
    hideMenu,
    previewData,
    isPreviewLoading = false,
    previewError,
    setGraphTitle,
    showEditIcon,
    hasActiveFilters = false,
}: DashboardGraphProps) {
    const localize = useLocalize();
    const locale = useLocaleValue();
    const activeTheme = useActiveTheme();
    const { editMode, globalDateFilter } = useDashboardContext();
    const { customDisplayOptions } = useCustomDisplayOptions();
    const { data: metrics } = useMetricConcepts();

    const graphType = layout.graph.type.name;
    const isAxisType = graphType === 'axis';
    const isBusinessLogo = graphType === 'business-logo';
    const isAiGraph = graphType === 'ai';
    const shouldLoadGraphData = previewData === undefined && !isPreviewLoading;

    const { isLoading, error, data } = useDashboardGraphData(
        layout,
        shouldLoadGraphData
    );
    const effectiveError = previewError ?? error;
    const effectiveIsLoading = isLoading || isPreviewLoading;
    const rawDisplay = layout.graph?.display as unknown;

    const showNoDataMessage =
        hasActiveFilters && isNoDataFromFiltersError(effectiveError);
    const graphErrorMessage =
        effectiveError && !showNoDataMessage
            ? getGraphErrorMessage(effectiveError, localize)
            : undefined;
    const missingDataMessage = showNoDataMessage
        ? localize('graphs.noDataMessage')
        : graphErrorMessage;

    const graphData: GenericData | null | undefined = missingDataMessage
        ? null
        : (previewData ?? data);

    const displayConfig = useMemo<GraphDisplayConfig>(() => {
        return buildDashboardGraphDisplayConfig({
            rawDisplay: rawDisplay ?? '{}',
            customDisplayOptions,
            graphType,
            calculations: layout.graph.query?.calculations,
            metrics,
            localize,
            hideDateFilterLabel: Boolean(globalDateFilter?.isActive()),
        });
    }, [
        customDisplayOptions,
        globalDateFilter,
        graphType,
        layout.graph.query?.calculations,
        localize,
        rawDisplay,
        metrics,
    ]);

    if (isAiGraph) {
        return <GraphBuilderElement layout={layout} />;
    }

    if (isBusinessLogo) {
        return (
            <BusinessLogoGraph
                activeTheme={activeTheme}
                editMode={editMode}
                error={effectiveError}
                hideMenu={hideMenu}
                isLoading={effectiveIsLoading}
                layout={layout}
                hasActiveFilters={hasActiveFilters}
            />
        );
    }

    return (
        <DashboardGraphProvider
            value={{
                layout,
                isLoading: effectiveIsLoading,
                error: effectiveError,
                hideMenu,
                calculations: layout.graph.query?.calculations,
                hasActiveFilters,
            }}
        >
            <div
                className={cn(
                    'flex h-full w-full flex-col justify-start gap-none',
                    isAxisType && graphData
                        ? 'scrollbar-thin overflow-x-auto'
                        : ''
                )}
                data-component-name="DashboardGraphView"
            >
                <div
                    className="w-full items-center justify-between bg-primary"
                    style={{ height: HEADER_HEIGHT }}
                >
                    <DashboardGraphHeader
                        setGraphTitle={setGraphTitle}
                        showEditIcon={showEditIcon}
                    />
                </div>

                <div
                    className="flex w-full flex-1 flex-col"
                    style={{ height: `calc(100% - ${HEADER_HEIGHT})` }}
                >
                    <div
                        id={`graph-${layout.graph.id}`}
                        className={cn(
                            'h-full max-h-full max-w-full flex-1',
                            isAxisType && graphData
                                ? 'scrollbar-thin min-w-[680px] overflow-x-auto lg:mr-[30px] lg:min-w-full'
                                : ''
                        )}
                        style={getGraphBodyPadding(graphType)}
                    >
                        {graphData ? (
                            <GraphElement
                                calculations={layout.graph.query?.calculations}
                                type={graphType}
                                display={displayConfig}
                                data={graphData}
                                className="h-full w-full"
                                localize={localize}
                                locale={locale}
                            />
                        ) : (
                            <GraphError message={missingDataMessage} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardGraphProvider>
    );
}

function getGraphBodyPadding(graphType: string) {
    const isStatusGraph = graphType === 'status';

    return {
        paddingTop: 0,
        paddingLeft: isStatusGraph ? 0 : '14px',
        paddingRight: isStatusGraph ? 0 : '14px',
        paddingBottom: isStatusGraph ? 0 : '14px',
    };
}

function isNoDataFromFiltersError(error: unknown) {
    if (!error) {
        return false;
    }

    if (isAxiosError(error)) {
        const status = error.response?.status;
        return status !== undefined && status >= 400 && status < 500;
    }

    return false;
}

function getGraphErrorMessage(
    error: unknown,
    localize: (key: string) => string
) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return localize('graphs.loadFailed');
}
