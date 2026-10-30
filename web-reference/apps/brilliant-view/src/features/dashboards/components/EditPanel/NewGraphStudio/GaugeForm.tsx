import type { SelectOption } from '@brilliant/bds-core';
import { Button } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    ExtensiveDashboardConceptMetric,
    GaugeGraphFormat,
} from '@bv/api';
import { gaugeGraphFormatSchema } from '@bv/api';
import { AccordionSection } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import ActiveFilterBadge from '~/features/dashboards/components/EditPanel/NewGraphStudio/ActiveFilterBadge.tsx';
import { ChevronDown } from '~/features/dashboards/svg/ChevronDown.tsx';
import { ChevronUp } from '~/features/dashboards/svg/ChevronUp.tsx';
import { Plus } from '~/features/dashboards/svg/Plus.tsx';
import { Trash } from '~/features/dashboards/svg/Trash.tsx';
import type { QueryFilter } from '~/filters/types';
import { useLocalize } from '~/i18n/I18nContext';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { GraphFilter } from '../../Filters/GraphFilter';
import { ShowComparison } from '../../Forms/GraphFormComponents/ShowComparison/ShowComparison.tsx';
import { ShowDecimals } from '../../Forms/GraphFormComponents/ShowDecimals/ShowDecimals.tsx';
import { MetricWithFilter } from './MetricWithFilter.tsx';
import { TargetWithManualToggle } from './TargetWithManualToggle';
import {
    createEmptyCompareFilter,
    setDisplayToggle,
    setDisplayValue,
    toggleTimeFilterFlag,
} from './Utils/commonFormHelpers.ts';
import { getMetricOptionsFromConcepts } from './Utils/getMetricOptionsFromConcepts.ts';
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers.ts';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm.ts';
import { useTargetGraphFormValues } from './Utils/useTargetGraphFormValues.ts';

interface GaugeFormProps {
    gaugeGraph: GaugeGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentGaugeData: (value: GaugeGraphFormat) => void;
}

export function GaugeForm({
    gaugeGraph,
    metrics,
    conceptFieldOptions,
    setCurrentGaugeData,
}: GaugeFormProps) {
    const localize = useLocalize();
    const metricOptions = getMetricOptionsFromConcepts(metrics);

    const gaugeForm = useForm<GaugeGraphFormat>({
        defaultValues: gaugeGraph,
        resolver: zodResolver(gaugeGraphFormatSchema),
        mode: 'onChange',
    });

    const {
        formTarget,
        formConcept,
        formDisplay,
        formConceptTimeFilter,
        formTargetTimeFilter,
        showDecimals,
    } = useTargetGraphFormValues(gaugeForm.control);
    const isShowingComparison = useWatch({
        control: gaugeForm.control,
        name: 'display.compare.isShowingComparison',
    });
    const {
        fields: domainFilterFields,
        append: domainFilterAppend,
        remove: domainFilterRemove,
    } = useFieldArray({
        control: gaugeForm.control,
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
        gaugeForm.setValue(`filter.${index}`, nextFilter, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleShowComparisonCheckedChange(comparison: boolean): void {
        setDisplayToggle(
            gaugeForm,
            'display.compare.isShowingComparison',
            comparison
        );
    }

    useSyncParsedGraphForm({
        watch: gaugeForm.watch,
        schema: gaugeGraphFormatSchema,
        onChange: setCurrentGaugeData,
    });

    return (
        <>
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
                        gaugeForm.setValue('conceptTimeFilter', next, {
                            shouldDirty: true,
                        });
                        gaugeForm.setValue(
                            'alltimeData',
                            !(next || formTargetTimeFilter),
                            { shouldDirty: true }
                        );
                    }}
                    concept={formConcept}
                    setMetric={(concept: ConceptSeries) => {
                        gaugeForm.setValue('concept', concept);
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
                            form: gaugeForm,
                            currentValue: formTargetTimeFilter,
                            flagName: 'targetTimeFilter',
                            otherActive: formConceptTimeFilter,
                        });
                    }}
                    onTargetConceptChange={(metric) => {
                        gaugeForm.setValue('target', metric);
                    }}
                    onDisplayTargetChange={(display) => {
                        setDisplayValue(gaugeForm, 'display.target', display);
                    }}
                    calculationIndex={2}
                    checkboxPosition="after"
                    checkboxContainerClassName="flex justify-start border-primary bg-primary py-sm text-secondary"
                    showDisabledMetricWhenManual={true}
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
                <ShowDecimals
                    isShowingDecimals={showDecimals}
                    onChangeDecimals={(checked) =>
                        setDisplayToggle(
                            gaugeForm,
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
                                    control={gaugeForm.control}
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
        </>
    );
}
