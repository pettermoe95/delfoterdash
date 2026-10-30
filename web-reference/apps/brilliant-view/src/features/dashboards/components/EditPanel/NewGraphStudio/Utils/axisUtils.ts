import type {
    AxisGraphFormat,
    DashboardConceptMetric,
    DashboardGraphQuery,
    DashboardLayoutItem,
} from '@bv/api';
import { normalizeDashboardDisplay, queryDomainSchema } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import { isAlltimeData, showAlltimeData } from './graphTransformations';
import { buildLegendText } from './legendTextHelpers';

const DEFAULT_SERIES_COLOR = 'blue';

export const templateAxisGraph = (
    metric: DashboardConceptMetric,
    alltimeData: boolean,
    domain?: AxisGraphFormat['domain']
) => {
    const metricName = metric.concept_name ?? '';
    const baseCalc = {
        aggregate: metricName,
        filter: [],
    };
    const domainValues: AxisGraphFormat['domain'] = domain ?? {
        filter: [],
        group: ['year', 'month'],
    };

    const legendText = buildLegendText(baseCalc, metric ? [metric] : undefined);

    const display: AxisGraphFormat['display'] = {
        showDecimals: false,
        customDisplayOptions: {
            '0': {
                displayType: 'bar',
                color: 'blue',
                legendText,
                curveType: 'step',
            },
        },
    };

    const format: AxisGraphFormat = {
        calculations: [baseCalc],
        domain: domainValues,
        alltimeData,
        display,
    };
    return format;
};

/**
 * Transforms a AxisGraphFormat object into a DashboardGraphQuery.
 */
export function axisFormatToQuery(
    graphFormat: AxisGraphFormat
): DashboardGraphQuery {
    const calculations = graphFormat.alltimeData
        ? showAlltimeData(graphFormat.calculations)
        : graphFormat.calculations;

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

export function layoutItemToAxisFormat(
    layout: DashboardLayoutItem
): AxisGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    const domainGroup = query?.domain?.group;
    const domainFilters = Array.isArray(query?.domain?.filter)
        ? query.domain.filter
        : [];
    const domain: AxisGraphFormat['domain'] | undefined =
        domainGroup || domainFilters.length > 0
            ? {
                  ...(domainGroup ? { group: domainGroup } : {}),
                  ...(domainFilters.length > 0
                      ? { filter: domainFilters }
                      : {}),
              }
            : undefined;

    const display = normalizeAxisDisplay(layout.graph.display, calculations);

    return {
        calculations,
        ...(domain ? { domain } : {}),
        alltimeData: isAlltimeData(calculations),
        display,
    };
}

type RawGraphDisplay = DashboardLayoutItem['graph']['display'];

function normalizeAxisDisplay(
    rawDisplay: RawGraphDisplay,
    calculations: DashboardGraphQuery['calculations']
): AxisGraphFormat['display'] {
    const parsed = parseDisplay(rawDisplay);
    const customDisplayOptions =
        getCustomDisplayOptions(parsed?.customDisplayOptions, calculations) ??
        buildDefaultCustomDisplayOptions(calculations);

    return {
        customDisplayOptions,
        showDecimals: parsed?.showDecimals ?? false,
        ...(typeof parsed?.barDisplay === 'string' && {
            barDisplay: parsed.barDisplay,
        }),
        ...(typeof parsed?.flipAxis === 'boolean' && {
            flipAxis: parsed.flipAxis,
        }),
    };
}

/**
 * Dashboard layouts persist `graph.display` as free-form JSON (string
 * or parsed object). Normalize that payload into something axis graphs can
 * safely consume.
 */
function parseDisplay(
    input: RawGraphDisplay
): Partial<AxisGraphFormat['display']> | undefined {
    if (typeof input === 'string') {
        try {
            const normalized: unknown = normalizeDashboardDisplay(
                JSON.parse(input)
            );
            return isRecord(normalized) ? normalized : undefined;
        } catch {
            return undefined;
        }
    }
    if (!isRecord(input)) {
        return undefined;
    }

    const normalized: unknown = normalizeDashboardDisplay(input);
    return isRecord(normalized) ? normalized : undefined;
}

function getCustomDisplayOptions(
    options: AxisGraphFormat['display']['customDisplayOptions'] | undefined,
    calculations: DashboardGraphQuery['calculations']
): AxisGraphFormat['display']['customDisplayOptions'] | undefined {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
        return undefined;
    }

    return Object.entries(options).reduce(
        (acc, [key, value]) => {
            if (!/^\d+$/.test(key) || typeof value !== 'object' || !value)
                return acc;

            const config = value as Record<string, unknown>;
            const calc = calculations[Number(key)] ?? { aggregate: '' };

            acc[key] = {
                displayType:
                    typeof config.displayType === 'string'
                        ? config.displayType
                        : 'bar',
                curveType:
                    typeof config.curveType === 'string'
                        ? config.curveType
                        : 'step',
                color:
                    typeof config.color === 'string'
                        ? config.color
                        : DEFAULT_SERIES_COLOR,
                legendText:
                    typeof config.legendText === 'string'
                        ? config.legendText
                        : buildLegendText(calc),
            };

            return acc;
        },
        {} as AxisGraphFormat['display']['customDisplayOptions']
    );
}

function buildDefaultCustomDisplayOptions(
    calculations: DashboardGraphQuery['calculations']
): AxisGraphFormat['display']['customDisplayOptions'] {
    return calculations.reduce(
        (acc, calc, index) => {
            acc[index] = {
                displayType: 'bar',
                curveType: 'step',
                color: DEFAULT_SERIES_COLOR,
                legendText: buildLegendText(calc),
            };
            return acc;
        },
        {} as AxisGraphFormat['display']['customDisplayOptions']
    );
}
