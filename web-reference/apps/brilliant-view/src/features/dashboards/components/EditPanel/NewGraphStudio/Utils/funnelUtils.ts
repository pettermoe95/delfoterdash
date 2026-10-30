import type {
    DashboardConceptMetric,
    DashboardGraphQuery,
    DashboardGraphQueryDomain,
    DashboardLayoutItem,
    FunnelGraphFormat,
} from '@bv/api';
import { normalizeDashboardDisplay, queryDomainSchema } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import { isAlltimeData, showAlltimeData } from './graphTransformations';
import { buildLegendText } from './legendTextHelpers';

function getDisplayRecord(
    value: DashboardLayoutItem['graph']['display']
): Record<string, unknown> | undefined {
    const rawValue: unknown = value;
    const normalized =
        typeof rawValue === 'string'
            ? (() => {
                  try {
                      const parsed: unknown = JSON.parse(rawValue);
                      return normalizeDashboardDisplay(parsed);
                  } catch {
                      return undefined;
                  }
              })()
            : normalizeDashboardDisplay(rawValue);

    return isRecord(normalized) ? normalized : undefined;
}

export const templateFunnelGraph = (
    metric: DashboardConceptMetric,
    alltimeData: boolean
) => {
    const metricName = metric.concept_name ?? '';
    const baseCalc = {
        aggregate: metricName,
        filter: [],
    };
    const legendText = buildLegendText(baseCalc, metric ? [metric] : undefined);
    const labeledCalc = {
        ...baseCalc,
        label: legendText,
    };

    const display: FunnelGraphFormat['display'] = {
        colors: ['blue'],
        customDisplayOptions: {},
        showLabelTimePeriod: false,
        showDecimals: false,
    };

    const format: FunnelGraphFormat = {
        calculations: [labeledCalc],
        alltimeData,
        display,
    };
    return format;
};

export function funnelFormatToQuery(
    graphFormat: FunnelGraphFormat
): DashboardGraphQuery {
    const calculations = Array.isArray(graphFormat.calculations)
        ? graphFormat.alltimeData
            ? showAlltimeData(graphFormat.calculations)
            : graphFormat.calculations
        : [];

    const domainFilters = stripEmptyCompareFilters(
        getGraphDomainFilters(graphFormat)
    );

    const mergedDomain = (() => {
        const group = graphFormat.domain?.group;
        const mergedFilters = [...domainFilters];

        if (group || mergedFilters.length > 0) {
            return queryDomainSchema.parse({
                ...(group ? { group } : {}),
                ...(mergedFilters.length > 0 ? { filter: mergedFilters } : {}),
            });
        }
        return undefined;
    })();

    return {
        calculations,
        ...(mergedDomain ? { domain: mergedDomain } : {}),
    };
}

export function layoutItemToFunnelFormat(
    layout: DashboardLayoutItem
): FunnelGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    const domainGroup = query?.domain?.group;
    const domainFilters: DashboardGraphQueryDomain['filter'] = Array.isArray(
        query?.domain?.filter
    )
        ? [...query.domain.filter]
        : [];
    const domain: FunnelGraphFormat['domain'] | undefined = (() => {
        if (domainGroup || domainFilters.length > 0) {
            return {
                ...(domainGroup ? { group: domainGroup } : {}),
                ...(domainFilters.length > 0 ? { filter: domainFilters } : {}),
            };
        }
        return undefined;
    })();

    const parsedDisplay = getDisplayRecord(layout.graph.display) ?? {};
    const display: FunnelGraphFormat['display'] = {
        customDisplayOptions: isRecord(parsedDisplay.customDisplayOptions)
            ? (parsedDisplay.customDisplayOptions as FunnelGraphFormat['display']['customDisplayOptions'])
            : {},
        showLabelTimePeriod:
            typeof parsedDisplay?.showLabelTimePeriod === 'boolean'
                ? parsedDisplay.showLabelTimePeriod
                : false,
        showDecimals:
            typeof parsedDisplay?.showDecimals === 'boolean'
                ? parsedDisplay.showDecimals
                : false,
        ...(typeof parsedDisplay?.color === 'string'
            ? { color: parsedDisplay.color }
            : {}),
        ...(Array.isArray(parsedDisplay?.colors)
            ? {
                  colors: parsedDisplay.colors.filter(
                      (color): color is string => typeof color === 'string'
                  ),
              }
            : {}),
    };

    return {
        calculations,
        ...(domain ? { domain } : {}),
        alltimeData: isAlltimeData(calculations),
        display,
    };
}
