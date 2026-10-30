import type { DashboardGraphType, DashboardLayoutItem } from '@bv/api';
import { useGraphTypes } from '~/features/dashboards/hooks/useGraphTypes';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo } from 'react';
import { GraphTypeLabel } from './GraphTypeLabel';

export function useGraphTypeOptions(
    layout?: DashboardLayoutItem,
    filterFn: (graphType: DashboardGraphType) => boolean = enabledGraphType
) {
    const localize = useLocalize();
    const graphType = layout?.graph.type;
    const enabled = graphType && filterFn(graphType);
    const { data: graphTypes } = useGraphTypes();

    const graphTypeOptions = useMemo(() => {
        const filteredGraphTypes = graphTypes?.filter(filterFn) ?? [];
        const sortedGraphTypes = filteredGraphTypes.sort(
            (a: DashboardGraphType, b: DashboardGraphType) =>
                a.name.localeCompare(b.name)
        );

        return sortedGraphTypes.map((graphType: DashboardGraphType) => ({
            label: <GraphTypeLabel graphType={graphType} localize={localize} />,
            value: graphType.id.toString(),
        }));
    }, [filterFn, graphTypes, localize]);

    return {
        graphTypeOptions,
        enabled,
    };
}

const DISABLED_GRAPH_TYPES = ['calendar', 'business-logo', 'progress'];

function enabledGraphType(type: DashboardGraphType) {
    return !DISABLED_GRAPH_TYPES.includes(type.name.toLowerCase());
}
