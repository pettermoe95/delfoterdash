import type { SelectOption } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    DashboardGraphQuery,
    DashboardGraphQueryDomain,
} from '@bv/api';
import { genericDataToSeries2D } from '@bv/ui';
import {
    createPeriodOptions,
    OFFSET_KEY_BY_PERIOD,
} from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers.ts';
import type { Period } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers.ts';
import { DateInPeriodFilter, PeriodType } from '~/filters/filters';
import { useLocalizeFieldConcepts } from '~/hooks';
import { useLoadDataQuery } from '~/hooks/query.ts';
import { useLocalize } from '~/i18n/I18nContext';
import { byGlobalDefaultThenByPrettyName } from '~/utils/conceptSorting.ts';
import { PreviewGraph } from './ConceptPreviewConfiguration/PreviewGraph.tsx';
import { SelectGrouping } from './ConceptPreviewConfiguration/SelectGrouping.tsx';
import { SelectTimePeriod } from './ConceptPreviewConfiguration/SelectTimePeriod.tsx';

type ConceptPreviewProps = {
    expression: string;
    validated: boolean;
    filters: DashboardGraphQueryDomain['filter'];
    timePeriod: Period;
    onTimePeriodChange: (timePeriod: Period) => void;
    deicticModifier: ConceptSeries['deictic_modifier'];
    setDeicticModifier: (modifier: ConceptSeries['deictic_modifier']) => void;
    grouping: string;
    setGrouping: (grouping: string) => void;
};

export default function ConceptPreview({
    expression,
    validated,
    filters,
    timePeriod,
    onTimePeriodChange,
    deicticModifier,
    setDeicticModifier,
    grouping,
    setGrouping,
}: ConceptPreviewProps) {
    const localize = useLocalize();
    const conceptFields = useLocalizeFieldConcepts();

    const groupingOptions: SelectOption[] = (() => {
        const seen = new Set<string>();

        const fieldOptions =
            conceptFields
                ?.sort(byGlobalDefaultThenByPrettyName)
                .map((field) => ({
                    value: field.concept_name,
                    label: field.concept_name_pretty,
                })) ?? [];

        return [...createPeriodOptions(localize), ...fieldOptions].filter(
            (option) => {
                const key = String(option.value);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }
        );
    })();

    const query: DashboardGraphQuery | null = (() => {
        if (!validated) return null;

        const offsetKey = OFFSET_KEY_BY_PERIOD[timePeriod];
        const domainGroup = grouping ? [grouping] : [];

        return {
            calculations: [
                {
                    aggregate: expression,
                    filter: offsetKey
                        ? [
                              new DateInPeriodFilter(
                                  PeriodType.fromTypeName(timePeriod),
                                  deicticModifier ?? 0
                              ).toQueryFilter(),
                          ]
                        : [],
                },
            ],
            domain: {
                filter: filters,
                ...(domainGroup.length ? { group: domainGroup } : {}),
            },
        };
    })();

    const { data, isFetching, isError, error } = useLoadDataQuery(query);

    if (!validated) return null;

    const seriesData = data ? genericDataToSeries2D(data) : null;
    const previewErrorMessage =
        isError && query
            ? error instanceof Error
                ? error.message
                : localize('concepts.form.previewFailed')
            : undefined;

    const handleDeicticChange = (modifier: string | number) => {
        const numericValue =
            typeof modifier === 'number'
                ? modifier
                : Number.parseInt(modifier, 10);
        setDeicticModifier(numericValue === -1 ? -1 : 0);
    };

    const handleGroupChange = (value: string | string[]) => {
        const next = Array.isArray(value) ? value[0] : value;
        setGrouping(next);
    };

    return (
        <div
            className="mt-xl flex flex-col gap-md lg:mt-0"
            component-name="ConceptPreview"
        >
            <PreviewGraph
                seriesData={seriesData}
                isFetching={isFetching && !isError}
                errorMessage={previewErrorMessage}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-md">
                <SelectTimePeriod
                    deicticModifier={deicticModifier}
                    handleDeicticChange={handleDeicticChange}
                    timePeriod={timePeriod}
                    setTimePeriod={onTimePeriodChange}
                />
                <SelectGrouping
                    grouping={grouping}
                    groupingOptions={groupingOptions}
                    handleGroupChange={handleGroupChange}
                />
            </div>
        </div>
    );
}
