import type {
    DashboardConceptMetric,
    DashboardGraphQuery,
    DashboardGraphQueryCalculations,
    DashboardGraphQueryDomain,
    DashboardLayoutItem,
    ExtensiveDashboardConceptMetric,
    TableGraphFormat,
} from '@bv/api';
import { queryDomainSchema } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import type { UseFormReturn } from 'react-hook-form';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import {
    conceptFromCalculation,
    isAlltimeData,
    showAlltimeData,
} from './graphTransformations';
import { buildLegendText } from './legendTextHelpers';

export const templateTableGraph = (
    metric: DashboardConceptMetric,
    currentUnit?: string
): TableGraphFormat => {
    const unitSuffix = currentUnit ? ` (${currentUnit})` : '';
    const metricLabel =
        metric.concept_name_pretty?.trim() || metric.concept_name;

    const baseCalc = {
        aggregate: metric.concept_name,
        filter: [],
        label: `${metricLabel}${unitSuffix}`,
    };

    const domainValues: TableGraphFormat['domain'] = {
        filter: [],
        group: ['month'],
    };

    return {
        calculations: [baseCalc],
        domain: domainValues,
        alltimeData: true,
        display: { showSumRow: true, showDecimals: false },
    };
};

export function buildTableColumnLabels(
    table: TableGraphFormat,
    metrics: ExtensiveDashboardConceptMetric[]
): TableGraphFormat['calculations'] {
    const calculations = table.calculations ?? [];

    return calculations.map((calc: DashboardGraphQueryCalculations) => {
        const concept = conceptFromCalculation(calc);

        const calcForLegend = table.alltimeData
            ? { ...calc, filter: [] }
            : calc;

        const legendText = buildLegendText(calcForLegend, metrics);
        const unitName =
            metrics.find((m) => m.concept_name === concept.concept_name)
                ?.unit_name ?? '';

        return {
            ...calc,
            label: `${legendText}${unitName ? ` (${unitName})` : ''}`,
        };
    });
}

type TableFormMethods = Pick<
    UseFormReturn<TableGraphFormat>,
    'getValues' | 'setValue'
>;

export function setShowTotalRow({
    form,
    value,
}: {
    form: TableFormMethods;
    value: boolean;
}) {
    const currentDisplay = form.getValues('display') ?? {
        showSumRow: true,
        showDecimals: false,
    };

    form.setValue(
        'display',
        {
            ...currentDisplay,
            showSumRow: value,
        },
        {
            shouldDirty: true,
            shouldValidate: true,
        }
    );
}

/**
 * Transforms a TableGraphFormat object into a DashboardGraphQuery.
 */
export function tableFormatToQuery(
    graphFormat: TableGraphFormat
): DashboardGraphQuery {
    const calculations = Array.isArray(graphFormat.calculations)
        ? graphFormat.alltimeData
            ? showAlltimeData(graphFormat.calculations)
            : graphFormat.calculations
        : [];

    const domainFilters: NonNullable<DashboardGraphQueryDomain['filter']> =
        stripEmptyCompareFilters(getGraphDomainFilters(graphFormat));

    const mergedDomain = (() => {
        const group = graphFormat.domain?.group;

        if (group || domainFilters.length > 0) {
            return queryDomainSchema.parse({
                ...(group ? { group } : {}),
                ...(domainFilters.length > 0 ? { filter: domainFilters } : {}),
            });
        }
        return undefined;
    })();

    return {
        calculations,
        ...(mergedDomain ? { domain: mergedDomain } : {}),
    };
}

export function layoutItemToTableFormat(
    layout: DashboardLayoutItem
): TableGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    const domainGroup = query?.domain?.group;
    const domainFilters: DashboardGraphQueryDomain['filter'] = [
        ...(query?.domain?.filter ?? []),
    ];
    const domain: TableGraphFormat['domain'] | undefined = (() => {
        if (domainGroup || domainFilters.length > 0) {
            return {
                ...(domainGroup ? { group: domainGroup } : {}),
                ...(domainFilters.length > 0 ? { filter: domainFilters } : {}),
            };
        }
        return undefined;
    })();

    const displaySource = isRecord(layout.graph.display)
        ? layout.graph.display
        : {};
    const display: NonNullable<TableGraphFormat['display']> = {
        ...displaySource,
        showSumRow:
            typeof displaySource.showSumRow === 'boolean'
                ? displaySource.showSumRow
                : true,
        showDecimals:
            typeof displaySource.showDecimals === 'boolean'
                ? displaySource.showDecimals
                : false,
    };

    return {
        calculations,
        ...(domain ? { domain } : {}),
        alltimeData: isAlltimeData(calculations),
        display,
    };
}
