import type { SelectOption } from '@brilliant/bds-core';
import { Button, ComboBox } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    ExtensiveDashboardConceptMetric,
    PieGraphFormat,
} from '@bv/api';
import { pieGraphFormatSchema } from '@bv/api';
import { AccordionSection } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import ActiveFilterBadge from '~/features/dashboards/components/EditPanel/NewGraphStudio/ActiveFilterBadge.tsx';
import { ChevronDown } from '~/features/dashboards/svg/ChevronDown';
import { ChevronUp } from '~/features/dashboards/svg/ChevronUp';
import { Plus } from '~/features/dashboards/svg/Plus';
import { Trash } from '~/features/dashboards/svg/Trash';
import type { QueryFilter } from '~/filters/types';
import { useLocalize } from '~/i18n/I18nContext';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { GraphFilter } from '../../Filters/GraphFilter';
import { ShowDecimals } from '../../Forms/GraphFormComponents/ShowDecimals/ShowDecimals.tsx';
import { MetricWithFilter } from './MetricWithFilter';
import {
    applyDomainGroupChange,
    createEmptyCompareFilter,
    setDisplayToggle,
} from './Utils/commonFormHelpers';
import { getMetricOptionsFromConcepts } from './Utils/getMetricOptionsFromConcepts';
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm';

type PieFormProps = {
    pieGraph: PieGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentPieData: (value: PieGraphFormat) => void;
};

export function PieForm({
    pieGraph,
    metrics,
    conceptFieldOptions,
    setCurrentPieData,
}: PieFormProps) {
    const localize = useLocalize();
    const metricOptions = useMemo(
        () => getMetricOptionsFromConcepts(metrics),
        [metrics]
    );

    const pieForm = useForm<PieGraphFormat>({
        defaultValues: pieGraph,
        resolver: zodResolver(pieGraphFormatSchema),
        mode: 'onChange',
    });
    const formAlltimeData = useWatch({
        control: pieForm.control,
        name: 'alltimeData',
    });
    const formConcept = useWatch({
        control: pieForm.control,
        name: 'concept',
    });
    const showDecimals =
        useWatch({
            control: pieForm.control,
            name: 'display.showDecimals',
        }) ?? false;

    const {
        fields: domainFilterFields,
        append: appendDomainFilter,
        remove: removeDomainFilter,
    } = useFieldArray({ control: pieForm.control, name: 'domain.filter' });

    const formDomain = useWatch({
        control: pieForm.control,
        name: 'domain',
    });

    const handleAddDomainFilter = useCallback(() => {
        appendDomainFilter(createEmptyCompareFilter());
    }, [appendDomainFilter]);

    const handleRemoveDomainFilter = useCallback(
        (idx: number) => removeDomainFilter(idx),
        [removeDomainFilter]
    );

    const handleDomainFilterChange = useCallback(
        (index: number, nextFilter: QueryFilter) => {
            pieForm.setValue(`domain.filter.${index}`, nextFilter, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [pieForm]
    );

    const handlePieGroupChange = (value: string | string[]) => {
        const selection = Array.isArray(value)
            ? (value[value.length - 1] ?? '')
            : (value ?? '');

        if (!selection) {
            pieForm.setValue('domain.group', [], {
                shouldDirty: true,
                shouldValidate: true,
            });
            return;
        }

        const isAlltime = pieForm.getValues('alltimeData');
        applyDomainGroupChange(pieForm, selection, isAlltime);
    };

    useSyncParsedGraphForm({
        watch: pieForm.watch,
        schema: pieGraphFormatSchema,
        onChange: setCurrentPieData,
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
                    isShowingTimeFilter={!formAlltimeData}
                    setIsShowingTimeFilter={() => {
                        const wasAlltime = formAlltimeData;
                        const nowAlltime = !wasAlltime;
                        pieForm.setValue('alltimeData', nowAlltime, {
                            shouldDirty: true,
                        });
                    }}
                    concept={formConcept}
                    setMetric={(concept: ConceptSeries) => {
                        pieForm.setValue('concept', concept);
                    }}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('miscTerms.groupedBy')}
                value="group"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <ComboBox
                    value={
                        formDomain?.group
                            ? formDomain.group[formDomain.group.length - 1]
                            : ''
                    }
                    onChange={handlePieGroupChange}
                    options={conceptFieldOptions}
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
                <ShowDecimals
                    isShowingDecimals={showDecimals}
                    onChangeDecimals={(checked) =>
                        setDisplayToggle(
                            pieForm,
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
                    {domainFilterFields.map((field, index) => (
                        <div key={field.id} className="flex flex-col gap-md">
                            <div className="flex items-center justify-between">
                                <p className="text-secondary bv-text-font-xs-regular">
                                    {localize('dashboards.options.filter')}{' '}
                                    {index + 1}
                                </p>
                                <Button
                                    variant="ghost"
                                    color="error"
                                    className="p-1.5"
                                    onClick={() =>
                                        handleRemoveDomainFilter(index)
                                    }
                                >
                                    <Trash />
                                </Button>
                            </div>
                            <GraphFilter
                                control={pieForm.control}
                                name={`domain.filter.${index}`}
                                onFilterChange={(nextFilter) =>
                                    handleDomainFilterChange(index, nextFilter)
                                }
                                conceptFieldOptions={conceptFieldOptions}
                            />
                        </div>
                    ))}

                    <Button
                        className="place-self-start"
                        variant="ghost"
                        color="gray"
                        onClick={handleAddDomainFilter}
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
