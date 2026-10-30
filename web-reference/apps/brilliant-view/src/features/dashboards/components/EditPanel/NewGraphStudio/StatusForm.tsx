import type { SelectOption } from '@brilliant/bds-core';
import { Button, ComboBox } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    ExtensiveDashboardConceptMetric,
    StatusGraphFormat,
} from '@bv/api';
import { statusGraphFormatSchema } from '@bv/api';
import { AccordionSection } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import ActiveFilterBadge from '~/features/dashboards/components/EditPanel/NewGraphStudio/ActiveFilterBadge.tsx';
import { ChevronDown } from '~/features/dashboards/svg/ChevronDown';
import { ChevronUp } from '~/features/dashboards/svg/ChevronUp';
import { Plus } from '~/features/dashboards/svg/Plus.tsx';
import { Trash } from '~/features/dashboards/svg/Trash.tsx';
import type { QueryFilter } from '~/filters/types';
import { useLocalize } from '~/i18n/I18nContext';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { GraphFilter } from '../../Filters/GraphFilter';
import { ShowComparison } from '../../Forms/GraphFormComponents/ShowComparison/ShowComparison.tsx';
import { ShowDecimals } from '../../Forms/GraphFormComponents/ShowDecimals/ShowDecimals.tsx';
import { ShowGoal } from '../../Forms/GraphFormComponents/ShowGoal/ShowGoal.tsx';
import { ShowGraph } from '../../Forms/GraphFormComponents/ShowGraph/ShowGraph.tsx';
import { MetricWithFilter } from './MetricWithFilter';
import { TargetWithManualToggle } from './TargetWithManualToggle';
import {
    applyDomainGroupChange,
    createEmptyCompareFilter,
    setDisplayToggle,
    setDisplayValue,
    toggleTimeFilterFlag,
} from './Utils/commonFormHelpers.ts';
import { getMetricOptionsFromConcepts } from './Utils/getMetricOptionsFromConcepts';
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm';

interface StatusFormProps {
    statusGraph: StatusGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentGaugeData: (value: StatusGraphFormat) => void;
}

export function StatusForm({
    statusGraph,
    metrics,
    conceptFieldOptions,
    setCurrentGaugeData,
}: StatusFormProps) {
    const localize = useLocalize();
    const metricOptions = getMetricOptionsFromConcepts(metrics);

    const statusForm = useForm<StatusGraphFormat>({
        defaultValues: statusGraph,
        resolver: zodResolver(statusGraphFormatSchema),
        mode: 'onChange',
    });
    const formAlltimeData = useWatch({
        control: statusForm.control,
        name: 'alltimeData',
    });
    const formConceptTimeFilterValue = useWatch({
        control: statusForm.control,
        name: 'conceptTimeFilter',
    });
    const formTargetTimeFilterValue = useWatch({
        control: statusForm.control,
        name: 'targetTimeFilter',
    });
    const formConcept = useWatch({
        control: statusForm.control,
        name: 'concept',
    });
    const formDisplay = useWatch({
        control: statusForm.control,
        name: 'display.target',
    });
    const formTarget = useWatch({
        control: statusForm.control,
        name: 'target',
    });
    const formDomain = useWatch({
        control: statusForm.control,
        name: 'domain',
    });
    const isShowingGoal =
        useWatch({
            control: statusForm.control,
            name: 'display.compare.isShowingGoal',
        }) ?? true;
    const isShowingComparison = useWatch({
        control: statusForm.control,
        name: 'display.compare.isShowingComparison',
    });
    const isShowingGraph =
        useWatch({
            control: statusForm.control,
            name: 'display.compare.isShowingGraph',
        }) ?? true;
    const showDecimals =
        useWatch({
            control: statusForm.control,
            name: 'display.showDecimals',
        }) ?? false;
    const formConceptTimeFilter =
        formConceptTimeFilterValue ?? !formAlltimeData;
    const formTargetTimeFilter = formTargetTimeFilterValue ?? !formAlltimeData;

    const {
        fields: domainFilterFields,
        append: domainFilterAppend,
        remove: domainFilterRemove,
    } = useFieldArray({
        control: statusForm.control,
        name: 'filter',
    });

    function addFilter(): void {
        domainFilterAppend(createEmptyCompareFilter());
    }

    function removeFilterAt(index: number): void {
        domainFilterRemove(index);
    }

    function handleDomainFilterChange(
        index: number,
        nextFilter: QueryFilter
    ): void {
        statusForm.setValue(`filter.${index}`, nextFilter, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleShowComparisonCheckedChange(comparison: boolean): void {
        setDisplayToggle(
            statusForm,
            'display.compare.isShowingComparison',
            comparison
        );
    }

    function handleGroupChange(value: string | string[]): void {
        const isAlltime = statusForm.getValues('alltimeData');
        applyDomainGroupChange(statusForm, value, isAlltime);
    }

    function handleShowGraphCheckedChange(graph: boolean): void {
        setDisplayToggle(statusForm, 'display.compare.isShowingGraph', graph);
    }

    function handleShowGoalCheckedChange(goal: boolean): void {
        setDisplayToggle(statusForm, 'display.compare.isShowingGoal', goal);
    }

    useSyncParsedGraphForm({
        watch: statusForm.watch,
        schema: statusGraphFormatSchema,
        onChange: setCurrentGaugeData,
    });

    return (
        <div data-component="kpi-form" className="flex flex-col gap-5xl">
            <AccordionSection
                title={localize('dashboards.options.concept')}
                value="concept"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <MetricWithFilter
                    metricOptions={metricOptions}
                    periodOptions={createPeriodOptions(localize)}
                    isShowingTimeFilter={formConceptTimeFilter}
                    setIsShowingTimeFilter={() => {
                        const next = !formConceptTimeFilter;
                        statusForm.setValue('conceptTimeFilter', next, {
                            shouldDirty: true,
                        });
                        statusForm.setValue(
                            'alltimeData',
                            !(next || formTargetTimeFilter),
                            { shouldDirty: true }
                        );
                    }}
                    concept={formConcept}
                    setMetric={(concept: ConceptSeries) => {
                        statusForm.setValue('concept', concept);
                    }}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.goal')}
                value="goal"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <TargetWithManualToggle
                    metricOptions={metricOptions}
                    periodOptions={createPeriodOptions(localize)}
                    metrics={metrics}
                    displayTarget={formDisplay}
                    targetConcept={formTarget}
                    conceptForMeasurement={formConcept.concept_name}
                    isShowingTimeFilter={formTargetTimeFilter}
                    setIsShowingTimeFilter={() => {
                        toggleTimeFilterFlag({
                            form: statusForm,
                            currentValue: formTargetTimeFilter,
                            flagName: 'targetTimeFilter',
                            otherActive: formConceptTimeFilter,
                        });
                    }}
                    onTargetConceptChange={(metric) => {
                        statusForm.setValue('target', metric);
                    }}
                    onDisplayTargetChange={(display) => {
                        setDisplayValue(statusForm, 'display.target', display);
                    }}
                    calculationIndex={2}
                    checkboxPosition="after"
                    checkboxContainerClassName="flex justify-start border-primary bg-primary py-sm text-secondary"
                    showDisabledMetricWhenManual={true}
                />
                <ShowGoal
                    id={'showGoal'}
                    isShowingGoal={isShowingGoal}
                    onChangeGoal={handleShowGoalCheckedChange}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.graphSettings')}
                value="group"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={false}
            >
                <ComboBox
                    label={localize('dashboards.options.grouping')}
                    value={
                        formDomain?.group
                            ? formDomain.group[formDomain.group.length - 1]
                            : ''
                    }
                    onChange={handleGroupChange}
                    options={createPeriodOptions(localize)}
                    localizeFn={localize}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.displayOptions')}
                value="displayOptions"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={false}
            >
                <ShowComparison
                    id={'comparison'}
                    isShowingComparison={isShowingComparison}
                    toggleComparison={handleShowComparisonCheckedChange}
                />
                <ShowGraph
                    id={'graph'}
                    isShowingGraph={isShowingGraph}
                    onChangeGraph={handleShowGraphCheckedChange}
                />
                <ShowDecimals
                    isShowingDecimals={showDecimals}
                    onChangeDecimals={(checked) =>
                        setDisplayToggle(
                            statusForm,
                            'display.showDecimals',
                            checked
                        )
                    }
                />
            </AccordionSection>
            <AccordionSection
                title={
                    <>
                        {localize('dashboards.options.filters')}
                        {!!domainFilterFields.length && <ActiveFilterBadge />}
                    </>
                }
                value="filters"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={domainFilterFields.length > 0}
            >
                <div className="flex flex-col gap-5xl">
                    {domainFilterFields.map((domainFilterField, index) => {
                        return (
                            <div
                                key={domainFilterField.id}
                                className="flex flex-col gap-md"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-secondary bv-text-font-xs-regular">
                                        {localize('dashboards.options.filter')}{' '}
                                        {index + 1}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        color="error"
                                        className="p-1.5"
                                        onClick={() => removeFilterAt(index)}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                                <GraphFilter
                                    control={statusForm.control}
                                    name={`filter.${index}`}
                                    onFilterChange={(nextFilter) =>
                                        handleDomainFilterChange(
                                            index,
                                            nextFilter
                                        )
                                    }
                                    conceptFieldOptions={conceptFieldOptions}
                                />
                            </div>
                        );
                    })}
                    <Button
                        className="place-self-start"
                        variant="ghost"
                        onClick={addFilter}
                    >
                        <Plus />
                        <p className="bv-text-font-sm-medium">
                            {localize('dashboards.options.addFilter')}
                        </p>
                    </Button>
                </div>
            </AccordionSection>
        </div>
    );
}
