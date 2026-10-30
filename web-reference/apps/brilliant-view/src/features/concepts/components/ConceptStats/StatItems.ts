import type { ConceptStats } from '@bv/api';

interface BuildStatsItemsParams {
    stats: ConceptStats | undefined;
    isLoading: boolean;
    isError: boolean;
    localize: (key: string) => string;
}

export interface StatsItem {
    key: string;
    label: string;
    count: number;
    title: string;
    description: string;
}

export const buildStatsItems = ({
    stats,
    isLoading,
    isError,
    localize,
}: BuildStatsItemsParams): StatsItem[] => {
    const dashboardGraphs = stats?.dashboard_graphs ?? [];
    const globalFilters = stats?.global_filters ?? [];
    const relatedConcepts = stats?.concepts ?? [];

    const graphCount = dashboardGraphs.length;
    const globalFilterCount = globalFilters.length;
    const conceptCount = relatedConcepts.length;

    return [
        {
            key: 'graphs',
            label: 'graphs',
            count: graphCount,
            title: localize('concepts.form.graphs'),
            description: buildStatsDescription(
                {
                    isLoading,
                    isError,
                },
                dashboardGraphs.map(
                    (dashboard) =>
                        `${dashboard.dashboard_name} (${dashboard.graph_count})`
                ),
                'concepts.form.graphsNotUsed',
                localize
            ),
        },
        {
            key: 'global_filters',
            label: 'global filters',
            count: globalFilterCount,
            title: localize('concepts.form.globalFilters'),
            description: buildStatsDescription(
                {
                    isLoading,
                    isError,
                },
                globalFilters.map((filter) =>
                    formatGlobalFilterEntry(
                        filter,
                        localize('concepts.form.globalFiltersUnknown')
                    )
                ),
                'concepts.form.globalFiltersNotUsed',
                localize
            ),
        },
        {
            key: 'concepts',
            label: 'concepts',
            count: conceptCount,
            title: localize('concepts.form.concepts'),
            description: buildStatsDescription(
                {
                    isLoading,
                    isError,
                },
                relatedConcepts.map((concept) => concept.concept_name),
                'concepts.form.conceptsNotUsed',
                localize
            ),
        },
    ];
};

function formatGlobalFilterEntry(
    globalFilter: {
        dashboard_name?: string;
        filter_name: string;
    },
    unknownLabel: string
) {
    const { dashboard_name: dashboardName, filter_name: filterName } =
        globalFilter;

    if (dashboardName && filterName) {
        return `${dashboardName} (${filterName})`;
    }

    if (dashboardName) return dashboardName;
    if (filterName) return filterName;

    return unknownLabel;
}

function buildStatsDescription(
    state: { isLoading: boolean; isError: boolean },
    entries: string[],
    emptyMessageKey: string,
    localize: (key: string) => string
) {
    if (state.isLoading) return localize('concepts.form.loadingStatsData');
    if (state.isError) return localize('concepts.form.loadingStatsDataFailed');
    if (!entries.length) return localize(emptyMessageKey);

    return entries.map((entry) => `• ${entry}`).join('\n');
}
