import type { SelectOption } from '@brilliant/bds-core';
import { Button, Checkbox, Icon } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    DashboardGraphQueryCalculations,
    ExtensiveDashboardConceptMetric,
    FunnelGraphFormat,
} from '@bv/api';
import { funnelGraphFormatSchema } from '@bv/api';
import type { DashboardColor } from '@bv/ui';
import { AccordionSection, SerieTypeAndColorPicker } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import ActiveFilterBadge from '~/features/dashboards/components/EditPanel/NewGraphStudio/ActiveFilterBadge.tsx';
import { ChevronDown } from '~/features/dashboards/svg/ChevronDown';
import { ChevronUp } from '~/features/dashboards/svg/ChevronUp';
import { Plus } from '~/features/dashboards/svg/Plus';
import { Trash } from '~/features/dashboards/svg/Trash';
import type { QueryFilter } from '~/filters/types';
import { useLocalize } from '~/i18n/I18nContext';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { GraphFilter } from '../../Filters/GraphFilter';
import { ShowDecimals } from '../../Forms/GraphFormComponents/ShowDecimals/ShowDecimals.tsx';
import { DropIndicator } from './DropIndicator';
import { useDragReorder } from './hooks/useDragReorder';
import { MetricWithFilter } from './MetricWithFilter';
import {
    addCalculation,
    buildCalculationFromMetric,
    createEmptyCompareFilter,
    hasInPeriodFilter,
    setCalculationMetricForForm,
    setDisplayToggle,
    toggleInPeriodFilterForCalculation,
} from './Utils/commonFormHelpers';
import { getMetricOptionsFromConcepts } from './Utils/getMetricOptionsFromConcepts';
import { conceptFromCalculation } from './Utils/graphTransformations';
import { buildLegendText } from './Utils/legendTextHelpers.ts';
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm';

type FunnelFormProps = {
    funnelGraph: FunnelGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentFunnelData: (value: FunnelGraphFormat) => void;
};

export function FunnelForm({
    funnelGraph,
    metrics,
    conceptFieldOptions,
    setCurrentFunnelData,
}: FunnelFormProps) {
    const localize = useLocalize();
    const metricOptions = getMetricOptionsFromConcepts(metrics);

    const funnelForm = useForm<FunnelGraphFormat>({
        defaultValues: funnelGraph,
        resolver: zodResolver(funnelGraphFormatSchema),
        mode: 'onChange',
    });
    const formDisplay = useWatch({
        control: funnelForm.control,
        name: 'display',
    });

    const {
        fields: calculationFields,
        append: appendCalculation,
        remove: removeCalculation,
        move: moveCalculation,
    } = useFieldArray({
        control: funnelForm.control,
        name: 'calculations',
    });

    const {
        fields: domainFilterFields,
        append: appendDomainFilter,
        remove: removeDomainFilter,
    } = useFieldArray({ control: funnelForm.control, name: 'domain.filter' });

    const handleAddSeries = useCallback(() => {
        const currentCalcs = funnelForm.getValues('calculations') ?? [];
        addCalculation({
            calculations: currentCalcs,
            appendCalculation,
        });
    }, [funnelForm, appendCalculation]);

    const handleRemoveSeries = useCallback(
        (idx: number) => {
            const display = funnelForm.getValues('display') ?? {
                customDisplayOptions: {},
                showDecimals: false,
                showLabelTimePeriod: false,
            };
            const currentColors = display?.colors ?? [];
            const nextColors = currentColors.filter((_, i) => i !== idx);
            funnelForm.setValue(
                'display',
                { ...display, colors: nextColors },
                { shouldDirty: true, shouldValidate: true }
            );
            removeCalculation(idx);
        },
        [funnelForm, removeCalculation]
    );

    const toggleCalculationTimeFilter = useCallback(
        (index: number) => {
            const currentCalcs = funnelForm.getValues('calculations') ?? [];
            const currentCalc =
                currentCalcs[index] ??
                funnelForm.getValues(`calculations.${index}` as const);
            if (!currentCalc) return;

            const concept = conceptFromCalculation(currentCalc);
            const nextCalc = toggleInPeriodFilterForCalculation(
                currentCalc,
                concept
            );

            const legendText = buildLegendText(nextCalc, metrics);
            const nextCalcs = currentCalcs.map((calc, i) =>
                i === index ? { ...nextCalc, label: legendText } : calc
            );
            const nextAlltime = !nextCalcs.some(hasInPeriodFilter);

            funnelForm.setValue('calculations', nextCalcs, {
                shouldDirty: true,
                shouldValidate: true,
            });
            funnelForm.setValue('alltimeData', nextAlltime, {
                shouldDirty: true,
            });
        },
        [funnelForm, metrics]
    );

    const handleSetMetric = useCallback(
        (metric: ConceptSeries, index: number) => {
            setCalculationMetricForForm({
                form: funnelForm,
                index,
                metric,
                buildNextCalc: (currentCalc, nextMetric) => {
                    const hasTimeFilter = hasInPeriodFilter(currentCalc);
                    return buildCalculationFromMetric(
                        nextMetric,
                        hasTimeFilter
                    );
                },
                onAfterSet: (nextCalc) => {
                    const legendText = buildLegendText(nextCalc, metrics);
                    funnelForm.setValue(
                        `calculations.${index}` as const,
                        { ...nextCalc, label: legendText },
                        { shouldDirty: true, shouldValidate: true }
                    );
                },
            });
        },
        [funnelForm, metrics]
    );

    const handleColorChange = useCallback(
        (data: { color: DashboardColor | undefined }, index: number) => {
            const display = funnelForm.getValues('display') ?? {
                customDisplayOptions: {},
                showDecimals: false,
                showLabelTimePeriod: false,
            };
            const currentColors = display?.colors ?? [];
            const nextColors = [...currentColors];
            nextColors[index] = data.color ?? '';
            funnelForm.setValue(
                'display',
                { ...display, colors: nextColors },
                { shouldDirty: true, shouldValidate: true }
            );
        },
        [funnelForm]
    );

    const handleAddDomainFilter = useCallback(() => {
        appendDomainFilter(createEmptyCompareFilter());
    }, [appendDomainFilter]);

    const handleRemoveDomainFilter = useCallback(
        (idx: number) => removeDomainFilter(idx),
        [removeDomainFilter]
    );

    const handleDomainFilterChange = useCallback(
        (index: number, nextFilter: QueryFilter) => {
            funnelForm.setValue(`domain.filter.${index}`, nextFilter, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [funnelForm]
    );

    useEffect(() => {
        const currentDisplay = funnelForm.getValues('display');
        if (!currentDisplay) {
            funnelForm.setValue(
                'display',
                {
                    colors: [],
                    customDisplayOptions: {},
                    showDecimals: false,
                    showLabelTimePeriod: false,
                },
                { shouldDirty: false }
            );
            return;
        }

        if (
            currentDisplay.customDisplayOptions &&
            typeof currentDisplay.customDisplayOptions === 'object'
        ) {
            const hasChanges =
                Object.keys(currentDisplay.customDisplayOptions).length !==
                Object.keys(currentDisplay.customDisplayOptions).length;

            if (hasChanges) {
                funnelForm.setValue(
                    'display',
                    {
                        ...currentDisplay,
                        customDisplayOptions:
                            currentDisplay.customDisplayOptions,
                    },
                    { shouldDirty: false }
                );
            }
        }
    }, [funnelForm]);

    useEffect(() => {
        const currentCalcs = funnelForm.getValues('calculations') ?? [];
        if (currentCalcs.length === 0 || metrics.length === 0) return;

        let updated = false;
        const nextCalcs = currentCalcs.map((calc) => {
            if (!calc) return calc;
            const legendText = buildLegendText(calc, metrics);
            const normalizedLabel = calc.label?.trim().toLowerCase();
            const needsLabel =
                !calc.label ||
                normalizedLabel === 'no label' ||
                calc.label === calc.aggregate;

            if (!needsLabel) return calc;
            updated = true;
            return {
                ...calc,
                label: legendText,
            };
        });

        if (updated) {
            funnelForm.setValue('calculations', nextCalcs, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }
    }, [funnelForm, metrics]);

    useSyncParsedGraphForm({
        watch: funnelForm.watch,
        schema: funnelGraphFormatSchema,
        onChange: setCurrentFunnelData,
    });

    const handleLabelChange = (checked: boolean | 'indeterminate'): void => {
        funnelForm.setValue('display.showLabelTimePeriod', checked === true);
    };

    const {
        dropIndex: dropSeriesIndex,
        isDragging,
        onDragStart,
        onDragOver,
        onContainerDragOver,
        onDrop,
        onDragEnd,
    } = useDragReorder({
        itemCount: calculationFields.length,
        onMove: (from, to) => {
            moveCalculation(from, to);
            const currentDisplay = funnelForm.getValues('display') ?? {
                customDisplayOptions: {},
                showDecimals: false,
                showLabelTimePeriod: false,
            };
            const currentColors = currentDisplay.colors ?? [];
            if (currentColors.length > 0) {
                const nextColors = Array.from(
                    { length: calculationFields.length },
                    (_, idx) => currentColors[idx] ?? ''
                );
                const [movedColor] = nextColors.splice(from, 1);
                nextColors.splice(to, 0, movedColor ?? '');
                funnelForm.setValue(
                    'display',
                    { ...currentDisplay, colors: nextColors },
                    { shouldDirty: true, shouldValidate: true }
                );
            }
        },
    });

    return (
        <>
            <AccordionSection
                title={localize('dashboards.options.funnelSteps')}
                value="funnel-steps"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <div
                    className="flex flex-col gap-5xl"
                    onDragOverCapture={onContainerDragOver}
                    onDropCapture={onDrop}
                >
                    {calculationFields.map((field, index) => {
                        const currentCalc: DashboardGraphQueryCalculations =
                            funnelForm.getValues(
                                `calculations.${index}` as const
                            ) ??
                            funnelGraph.calculations[index] ??
                            field;
                        const fieldConcept =
                            conceptFromCalculation(currentCalc);
                        return (
                            <div
                                className="flex flex-col gap-md"
                                key={field.id}
                                data-drag-row="true"
                                onDragOverCapture={(event) =>
                                    onDragOver(event, index)
                                }
                                onDropCapture={onDrop}
                            >
                                <DropIndicator
                                    active={dropSeriesIndex === index}
                                    onDragOverCapture={(event) =>
                                        onDragOver(event, index)
                                    }
                                    onDropCapture={onDrop}
                                />
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex select-none items-center gap-xs text-secondary ${
                                            isDragging
                                                ? 'cursor-grabbing'
                                                : 'cursor-grab'
                                        }`}
                                        draggable
                                        onDragStart={onDragStart(index)}
                                        onDragEnd={onDragEnd}
                                    >
                                        <Icon icon="mdi:drag" fontSize={20} />
                                        <p className="text-secondary bv-text-font-xs-regular">
                                            {localize(
                                                'dashboards.options.step'
                                            )}{' '}
                                            {index + 1}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        color="error"
                                        className="p-1.5"
                                        onClick={() =>
                                            handleRemoveSeries(index)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                                <MetricWithFilter
                                    metricOptions={metricOptions}
                                    periodOptions={createPeriodOptions(
                                        localize
                                    )}
                                    isShowingTimeFilter={hasInPeriodFilter(
                                        currentCalc
                                    )}
                                    setIsShowingTimeFilter={() =>
                                        toggleCalculationTimeFilter(index)
                                    }
                                    concept={fieldConcept}
                                    setMetric={(metric: ConceptSeries) => {
                                        handleSetMetric(metric, index);
                                    }}
                                >
                                    <SerieTypeAndColorPicker
                                        index={index}
                                        hideTypeOptions={true}
                                        displayOptions={{
                                            color:
                                                funnelForm.getValues(
                                                    `display.colors.${index}`
                                                ) ??
                                                funnelForm.getValues(
                                                    `display.customDisplayOptions.${index}.color`
                                                ) ??
                                                undefined,
                                            displayType: 'bar',
                                            curveType: 'step',
                                        }}
                                        onChangeHandler={(data) =>
                                            handleColorChange(data, index)
                                        }
                                    />
                                </MetricWithFilter>
                            </div>
                        );
                    })}
                    <DropIndicator
                        active={dropSeriesIndex === calculationFields.length}
                        onDragOverCapture={(event) =>
                            onDragOver(event, calculationFields.length)
                        }
                        onDropCapture={onDrop}
                    />

                    {calculationFields.length < 7 && (
                        <Button
                            className="place-self-start"
                            variant="ghost"
                            color="gray"
                            onClick={handleAddSeries}
                        >
                            <Plus />
                            <p className="bv-text-font-sm-medium">
                                {localize('dashboards.options.addStep')}
                            </p>
                        </Button>
                    )}
                </div>
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.displayOptions')}
                value="displayOptions"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
            >
                <div className="flex flex-col gap-4 border-primary bg-primary py-sm text-secondary">
                    <Checkbox
                        id={'showTimePeriodOnLabels'}
                        size="sm"
                        text="Show time period on labels"
                        checked={formDisplay?.showLabelTimePeriod}
                        onCheckedChange={handleLabelChange}
                    />
                    <ShowDecimals
                        isShowingDecimals={formDisplay?.showDecimals ?? false}
                        onChangeDecimals={(checked) =>
                            setDisplayToggle(
                                funnelForm,
                                'display.showDecimals',
                                checked
                            )
                        }
                    />
                </div>
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
                                control={funnelForm.control}
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
