import type {
    AxisGraphFormat,
    CylinderGraphFormat,
    DashboardConceptMetric,
    DashboardLayoutItem,
    FunnelGraphFormat,
    GaugeGraphFormat,
    GraphFormatUnion,
    PieGraphFormat,
    StatusGraphFormat,
    TableGraphFormat,
} from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useMemo } from 'react';
import {
    layoutItemToAxisFormat,
    templateAxisGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/axisUtils';
import {
    layoutItemToCylinderFormat,
    templateCylinderGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/cylinderUtils';
import {
    layoutItemToFunnelFormat,
    templateFunnelGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/funnelUtils';
import {
    layoutItemToGaugeFormat,
    templateGaugeGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/gaugeUtils';
import { GraphTypeId } from '../components/EditPanel/NewGraphStudio/Utils/graphTypeIds';
import {
    layoutItemToPieFormat,
    templatePieGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/pieUtils';
import {
    layoutItemToStatusFormat,
    templateStatusGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/statusUtils';
import {
    layoutItemToTableFormat,
    templateTableGraph,
} from '../components/EditPanel/NewGraphStudio/Utils/tableUtils';
import type { DashboardCellDroppable } from '../components/Grid';

const newGraphStudioDataAtom = atomWithStorage<DashboardCellDroppable>(
    'newGraphStudioDataAtom',
    {},
    undefined,
    { getOnInit: true }
);

export function useNewGraphStudioData(
    graphType?: string,
    isExistingGraph?: boolean,
    layoutGraph?: DashboardLayoutItem
) {
    const localize = useLocalize();
    const [newGraphStudioData, setNewGraphStudioData] = useAtom(
        newGraphStudioDataAtom
    );

    const axisGraphData = useMemo<AxisGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.axis) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToAxisFormat(layoutGraph);
            }

            const metrics: DashboardConceptMetric =
                newGraphStudioData?.metric ?? {
                    concept_name: '',
                    concept_name_pretty: '',
                };

            const format = templateAxisGraph(metrics, true, undefined);
            return format;
        }
        return {} as AxisGraphFormat;
    }, [graphType, isExistingGraph, layoutGraph, newGraphStudioData.metric]);

    const gaugeGraphFormat = useMemo<GaugeGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.gauge) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToGaugeFormat(layoutGraph);
            }
            const metricName = newGraphStudioData?.metric?.concept_name ?? '';
            const format = templateGaugeGraph(metricName, localize);
            return format;
        }
        return {} as GaugeGraphFormat;
    }, [
        graphType,
        isExistingGraph,
        newGraphStudioData.metric,
        layoutGraph,
        localize,
    ]);

    const cylinderGraphFormat = useMemo<CylinderGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.cylinder) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToCylinderFormat(layoutGraph);
            }
            const metricName = newGraphStudioData?.metric?.concept_name ?? '';
            const format = templateCylinderGraph(metricName);
            return format;
        }
        return {} as CylinderGraphFormat;
    }, [graphType, newGraphStudioData.metric, layoutGraph, isExistingGraph]);

    const funnelGraphData = useMemo<FunnelGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.funnel) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToFunnelFormat(layoutGraph);
            }

            const metric: DashboardConceptMetric =
                newGraphStudioData?.metric ?? {
                    concept_name: '',
                    concept_name_pretty: '',
                };

            return templateFunnelGraph(metric, true);
        }
        return {} as FunnelGraphFormat;
    }, [graphType, isExistingGraph, layoutGraph, newGraphStudioData.metric]);

    const pieGraphData = useMemo<PieGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.pie) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToPieFormat(layoutGraph);
            }
            const metricName = newGraphStudioData?.metric?.concept_name ?? '';
            return templatePieGraph(metricName);
        }
        return {} as PieGraphFormat;
    }, [graphType, newGraphStudioData.metric, layoutGraph, isExistingGraph]);

    const statusGraphData = useMemo<StatusGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.status) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToStatusFormat(layoutGraph);
            }
            const metricName = newGraphStudioData?.metric?.concept_name ?? '';
            const format = templateStatusGraph(metricName, localize);
            return format;
        }
        return {} as StatusGraphFormat;
    }, [
        graphType,
        isExistingGraph,
        newGraphStudioData.metric,
        layoutGraph,
        localize,
    ]);

    const tableGraphData = useMemo<TableGraphFormat>(() => {
        if (Number(graphType) === GraphTypeId.table) {
            if (isExistingGraph && layoutGraph) {
                return layoutItemToTableFormat(layoutGraph);
            }
            const metric = newGraphStudioData?.metric ?? {
                concept_name: '',
                concept_name_pretty: '',
            };
            return templateTableGraph(metric);
        }
        return {} as TableGraphFormat;
    }, [graphType, newGraphStudioData.metric, layoutGraph, isExistingGraph]);

    const currentGraphData = useMemo<GraphFormatUnion>(() => {
        if (Number(graphType) === GraphTypeId.axis) return axisGraphData;
        if (Number(graphType) === GraphTypeId.gauge) return gaugeGraphFormat;
        if (Number(graphType) === GraphTypeId.cylinder)
            return cylinderGraphFormat;
        if (Number(graphType) === GraphTypeId.pie) return pieGraphData;
        if (Number(graphType) === GraphTypeId.status) return statusGraphData;
        if (Number(graphType) === GraphTypeId.table) return tableGraphData;
        if (Number(graphType) === GraphTypeId.funnel) return funnelGraphData;
        return {} as AxisGraphFormat;
    }, [
        graphType,
        gaugeGraphFormat,
        cylinderGraphFormat,
        axisGraphData,
        pieGraphData,
        statusGraphData,
        tableGraphData,
        funnelGraphData,
    ]);

    return { newGraphStudioData, setNewGraphStudioData, currentGraphData };
}

/* Display options hook for altering series display types and colors */
export type SeriesCustomDisplay = {
    displayType?: string;
    color?: string;
    legendText?: string;
};
export type CustomDisplay = Record<number, SeriesCustomDisplay>;

const customDisplayOptionsAtom = atom<CustomDisplay>({});

export function useCustomDisplayOptions() {
    const [customDisplayOptions, setCustomDisplayOptions] = useAtom(
        customDisplayOptionsAtom
    );

    const addOrUpdateDisplayOption = (
        index: number,
        display: SeriesCustomDisplay
    ) => {
        setCustomDisplayOptions((prev) => ({
            ...prev,
            [index]: { ...prev[index], ...display },
        }));
    };

    // Remove display option by index key
    const removeDisplayOption = (seriesIndex: number) => {
        setCustomDisplayOptions((prev) => {
            const { [seriesIndex]: _, ...rest } = prev;
            return rest;
        });
    };

    return {
        customDisplayOptions,
        addOrUpdateDisplayOption,
        removeDisplayOption,
    };
}
