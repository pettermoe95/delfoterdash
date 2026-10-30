import type {
    DashboardGraphQuery,
    DashboardGraphQueryDomain,
    DashboardLayoutItem,
    PieGraphFormat,
} from '@bv/api';
import { queryDomainSchema } from '@bv/api';
import { isRecord } from '~/utils/typeGuards';
import { stripEmptyCompareFilters } from '../../../Filters/filterUtils';
import { getGraphDomainFilters } from './getGraphDomainFilters';
import {
    buildCalculation,
    conceptFromCalculation,
} from './graphTransformations';
import { isValidInPeriod } from './offsetAndPeriodFilterHelpers';

export const templatePieGraph = (metricName: string) => {
    const format: PieGraphFormat = {
        concept: {
            concept_name: metricName,
            deictic_modifier: 0,
            time_period: 'year',
        },
        filter: [],
        display: {
            showDecimals: false,
        },
        alltimeData: true,
        domain: {
            group: ['month'],
        },
    };
    return format;
};

/**
 * Transforms a PieGraphFormat object into a DashboardGraphQuery.
 * - Builds a base calculation from `concept`.
 * - Applies domain filters from `filter` when provided.
 */
export function pieFormatToQuery(
    graphFormat: PieGraphFormat
): DashboardGraphQuery {
    const calculations: DashboardGraphQuery['calculations'] = [];

    const domainFilters = stripEmptyCompareFilters(
        getGraphDomainFilters(graphFormat)
    );
    const domainGroup = graphFormat.domain?.group;

    // Base calculation from concept
    const baseCalc = buildCalculation(
        graphFormat.concept,
        !graphFormat.alltimeData,
        graphFormat.calculationTimeFilter
    );
    calculations.push(baseCalc);

    const hasDomain =
        (Array.isArray(domainGroup) && domainGroup.length > 0) ||
        domainFilters.length > 0;

    const query: DashboardGraphQuery = {
        calculations,
        ...(hasDomain
            ? {
                  domain: queryDomainSchema.parse({
                      ...(domainGroup ? { group: domainGroup } : {}),
                      ...(domainFilters.length > 0
                          ? { filter: domainFilters }
                          : {}),
                  }),
              }
            : {}),
    };

    return query;
}

/**
 * Transforms a DashboardLayoutItem into a PieGraphFormat structure.
 */
export function layoutItemToPieFormat(
    layout: DashboardLayoutItem
): PieGraphFormat {
    const query = layout.graph.query;
    const calculations = Array.isArray(query?.calculations)
        ? query.calculations
        : [];
    // Base concept
    const baseConcept: PieGraphFormat['concept'] = conceptFromCalculation(
        calculations[0]
    );

    // Domain-level filters
    const domainFilters: DashboardGraphQueryDomain['filter'] = Array.isArray(
        query?.domain?.filter
    )
        ? [...query.domain.filter]
        : [];
    const domainGroup = query?.domain?.group;
    const domain: PieGraphFormat['domain'] | undefined =
        domainGroup || domainFilters.length > 0
            ? {
                  ...(domainGroup ? { group: domainGroup } : {}),
                  ...(domainFilters.length > 0
                      ? { filter: domainFilters }
                      : {}),
              }
            : undefined;

    const displaySource = isRecord(layout.graph.display)
        ? layout.graph.display
        : {};
    const display: PieGraphFormat['display'] = {
        ...displaySource,
        showDecimals:
            typeof displaySource.showDecimals === 'boolean'
                ? displaySource.showDecimals
                : false,
    };

    return {
        concept: baseConcept,
        calculationTimeFilter: calculations[0],
        filter: domainFilters,
        display,
        ...(domain ? { domain } : {}),
        alltimeData: !(calculations[0]?.filter?.some(isValidInPeriod) ?? false),
    };
}
