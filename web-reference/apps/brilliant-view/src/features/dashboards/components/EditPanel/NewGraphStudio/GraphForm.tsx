import type { SelectOption } from '@brilliant/bds-core';
import type {
    AxisGraphFormat,
    Concept,
    CylinderGraphFormat,
    ExtensiveDashboardConceptMetric,
    FunnelGraphFormat,
    GaugeGraphFormat,
    GraphFormatUnion,
    PieGraphFormat,
    StatusGraphFormat,
    TableGraphFormat,
} from '@bv/api';
import { byGlobalDefaultThenByPrettyName } from '~/utils/conceptSorting.ts';
import { AxisForm } from './AxisForm.tsx';
import { CylinderForm } from './CylinderForm.tsx';
import { FunnelForm } from './FunnelForm.tsx';
import { GaugeForm } from './GaugeForm.tsx';
import { PieForm } from './PieForm.tsx';
import { StatusForm } from './StatusForm.tsx';
import { TableForm } from './TableForm.tsx';
import { GraphTypeId } from './Utils/graphTypeIds.ts';

interface GraphFormProps {
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFields: Concept[];
    type?: number;
    graphData: GraphFormatUnion;
    setCurrentGraphData: (value: GraphFormatUnion) => void;
}

export function GraphForm({
    metrics,
    conceptFields,
    type,
    graphData,
    setCurrentGraphData,
}: GraphFormProps) {
    const conceptFieldOptions = conceptFields
        .sort(byGlobalDefaultThenByPrettyName)
        .map((conceptField: Concept): SelectOption => {
            return {
                value: conceptField.concept_name,
                label: conceptField.concept_name_pretty,
            };
        });

    switch (type) {
        case GraphTypeId.axis:
            return (
                <AxisForm
                    axisGraph={graphData as AxisGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentAxisData={setCurrentGraphData}
                />
            );
        case GraphTypeId.gauge:
            return (
                <GaugeForm
                    gaugeGraph={graphData as GaugeGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentGaugeData={setCurrentGraphData}
                />
            );
        case GraphTypeId.cylinder:
            return (
                <CylinderForm
                    cylinderGraph={graphData as CylinderGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentCylinderData={setCurrentGraphData}
                />
            );
        case GraphTypeId.pie:
            return (
                <PieForm
                    pieGraph={graphData as PieGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentPieData={setCurrentGraphData}
                />
            );
        case GraphTypeId.status:
            return (
                <StatusForm
                    statusGraph={graphData as StatusGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentGaugeData={setCurrentGraphData}
                />
            );
        case GraphTypeId.table:
            return (
                <TableForm
                    tableGraph={graphData as TableGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentTableData={setCurrentGraphData}
                />
            );
        case GraphTypeId.funnel:
            return (
                <FunnelForm
                    funnelGraph={graphData as FunnelGraphFormat}
                    metrics={metrics}
                    conceptFieldOptions={conceptFieldOptions}
                    setCurrentFunnelData={setCurrentGraphData}
                />
            );
        default:
            return undefined;
    }
}
