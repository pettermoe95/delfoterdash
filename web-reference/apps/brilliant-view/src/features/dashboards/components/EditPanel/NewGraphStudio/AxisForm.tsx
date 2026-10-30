import type { SelectOption } from '@brilliant/bds-core';
import { Button, Checkbox, ComboBox, Icon } from '@brilliant/bds-core';
import type {
    AxisGraphFormat,
    ConceptSeries,
    DashboardGraphQueryCalculations,
    ExtensiveDashboardConceptMetric,
} from '@bv/api';
import { axisGraphFormatSchema } from '@bv/api';
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
import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { GraphFilter } from '../../Filters/GraphFilter';
import { ShowDecimals } from '../../Forms/GraphFormComponents/ShowDecimals/ShowDecimals.tsx';
import { DropIndicator } from './DropIndicator';
import { useDragReorder } from './hooks/useDragReorder';
import { MetricWithFilter } from './MetricWithFilter';
import {
    addCalculation,
    buildCalculationFromMetricPreservingTimeFilter,
    createEmptyCompareFilter,
    hasInPeriodFilter,
    setCalculationMetricForForm,
    setDisplayToggle,
    toggleCalculationTimeFilterForForm,
} from './Utils/commonFormHelpers';
import { getMetricOptionsFromConcepts } from './Utils/getMetricOptionsFromConcepts';
import {
    conceptFromCalculation,
    isAlltimeData,
} from './Utils/graphTransformations';
import {
    buildLegendBaseText,
    buildLegendText,
} from './Utils/legendTextHelpers.ts';
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm';

type AxisFormProps = {
    axisGraph: AxisGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentAxisData: (value: AxisGraphFormat) => void;
};

type CustomDisplayOptions = AxisGraphFormat['display']['customDisplayOptions'];

export function AxisForm({
    axisGraph,
    metrics,
    conceptFieldOptions,
    setCurrentAxisData,
}: AxisFormProps) {
    const localize = useLocalize();
    const metricOptions = useMemo(
        () => getMetricOptionsFromConcepts(metrics),
        [metrics]
    );

    const axisForm = useForm<AxisGraphFormat>({
        defaultValues: axisGraph,
        resolver: zodResolver(axisGraphFormatSchema),
        mode: 'onChange',
    });

    const computeLegendText = useCallback(
        (
            calculation: AxisGraphFormat['calculations'][number] | undefined,
            _index?: number
        ) => {
            if (!calculation) {
                return '';
            }

            return buildLegendText(calculation, metrics, {
                baseLegendText: buildLegendBaseText(calculation, metrics),
            });
        },
        [metrics]
    );

    const updateLegendTextForIndex = useCallback(
        (index: number) => {
            const calculation = axisForm.getValues(
                `calculations.${index}` as const
            );
            if (!calculation) {
                return;
            }

            const legendText = computeLegendText(calculation, index);
            const currentDisplays =
                axisForm.getValues('display.customDisplayOptions') ?? {};
            const key = String(index);
            const existingConfig = currentDisplays[key] ?? {};

            if (existingConfig.legendText === legendText) {
                return;
            }

            axisForm.setValue(
                'display.customDisplayOptions',
                {
                    ...currentDisplays,
                    [key]: {
                        ...existingConfig,
                        legendText,
                    },
                },
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            );
        },
        [axisForm, computeLegendText]
    );

    const {
        fields: calculationFields,
        append: appendCalculation,
        remove: removeCalculation,
        move: moveCalculation,
    } = useFieldArray({
        control: axisForm.control,
        name: 'calculations',
    });

    const {
        fields: domainFilterFields,
        append: appendDomainFilter,
        remove: removeDomainFilter,
    } = useFieldArray({ control: axisForm.control, name: 'domain.filter' });

    const formDomain = useWatch({ control: axisForm.control, name: 'domain' });
    const display = useWatch({ control: axisForm.control, name: 'display' });
    const customDisplayOptions = display?.customDisplayOptions as
        | CustomDisplayOptions
        | undefined;

    const { hasLineSeries, isCurveLine } = useMemo(() => {
        const values = Object.values(customDisplayOptions ?? {});
        const lineConfigs = values.filter(
            (option): option is CustomDisplayOptions[string] =>
                option?.displayType === 'line'
        );
        if (lineConfigs.length === 0) {
            return {
                hasLineSeries: false,
                isCurveLine: false,
            };
        }
        const everyCurved = lineConfigs.every(
            (option) => option?.curveType !== 'step'
        );
        return {
            hasLineSeries: true,
            isCurveLine: everyCurved,
        };
    }, [customDisplayOptions]);

    const handleAddSeries = useCallback(() => {
        const currentCalcs = axisForm.getValues('calculations') ?? [];
        addCalculation({
            calculations: currentCalcs,
            appendCalculation,
        });
        updateLegendTextForIndex(currentCalcs.length);
    }, [axisForm, appendCalculation, updateLegendTextForIndex]);

    const handleRemoveSeries = useCallback(
        (idx: number) => {
            const currentDisplays =
                axisForm.getValues('display.customDisplayOptions') ?? {};

            const nextDisplays = Object.entries(currentDisplays).reduce(
                (acc, [key, value]) => {
                    const numericKey = Number(key);
                    if (Number.isNaN(numericKey) || numericKey === idx) {
                        return acc;
                    }
                    const nextKey =
                        numericKey > idx ? String(numericKey - 1) : key;
                    acc[nextKey] = value;
                    return acc;
                },
                {} as AxisGraphFormat['display']['customDisplayOptions']
            );

            axisForm.setValue('display.customDisplayOptions', nextDisplays, {
                shouldDirty: true,
                shouldValidate: true,
            });
            removeCalculation(idx);
        },
        [axisForm, removeCalculation]
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
            axisForm.setValue(`domain.filter.${index}`, nextFilter, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [axisForm]
    );

    const handleXAxisGroupChange = (value: string | string[]) => {
        const next = Array.isArray(value) ? value : value ? [value] : [];
        axisForm.setValue('domain.group', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleToggleTimeFilter = useCallback(
        (index: number) => {
            toggleCalculationTimeFilterForForm({
                form: axisForm,
                index,
                isAlltimeData,
                conceptFromCalculation,
            });
            updateLegendTextForIndex(index);
        },
        [axisForm, updateLegendTextForIndex]
    );

    const handleSetMetric = useCallback(
        (metric: ConceptSeries, index: number) => {
            setCalculationMetricForForm({
                form: axisForm,
                index,
                metric,
                buildNextCalc: buildCalculationFromMetricPreservingTimeFilter,
                onAfterSet: () => {
                    const nextCalcs = axisForm.getValues('calculations') ?? [];
                    axisForm.setValue('alltimeData', isAlltimeData(nextCalcs), {
                        shouldDirty: true,
                    });
                    updateLegendTextForIndex(index);
                },
            });
        },
        [axisForm, updateLegendTextForIndex]
    );

    const handleSerieAndColorPicker = (
        data: {
            color: DashboardColor | undefined;
            displayType: 'bar' | 'line';
            curveType: 'step' | 'curve';
            open?: boolean;
            index?: number;
        },
        index: number
    ) => {
        const legendsText = computeLegendText(
            axisForm.getValues(`calculations.${index}`),
            index
        );
        const existing =
            axisForm.getValues('display.customDisplayOptions') ?? {};
        const existingConfig = existing[String(index)] ?? {};
        axisForm.setValue(
            'display.customDisplayOptions',
            {
                ...existing,
                [String(index)]: {
                    ...existingConfig,
                    displayType: data.displayType,
                    curveType: data.curveType,
                    color: data.color ?? '',
                    legendText: legendsText,
                },
            },
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        );
    };

    const handleStackChange = (checked: boolean): void => {
        if (checked) {
            axisForm.setValue('display.barDisplay', 'stack');
        } else {
            axisForm.setValue('display.barDisplay', 'group');
        }
    };

    const handleCurveTypeChange = (checked: boolean): void => {
        const existing =
            axisForm.getValues('display.customDisplayOptions') ?? {};
        const next = Object.entries(existing).reduce((acc, [key, value]) => {
            if (value?.displayType === 'line') {
                acc[key] = {
                    ...value,
                    curveType: checked ? 'curve' : 'step',
                };
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as CustomDisplayOptions);
        axisForm.setValue('display.customDisplayOptions', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleFlipChange = (checked: boolean): void => {
        axisForm.setValue('display.flipAxis', checked);
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
            const currentDisplays =
                axisForm.getValues('display.customDisplayOptions') ?? {};
            const orderedDisplays = calculationFields.map(
                (_, index) => currentDisplays[String(index)] ?? {}
            );
            const [movedDisplay] = orderedDisplays.splice(from, 1);
            orderedDisplays.splice(to, 0, movedDisplay);
            const nextDisplays = orderedDisplays.reduce((acc, value, index) => {
                acc[String(index)] = value;
                return acc;
            }, {} as CustomDisplayOptions);
            axisForm.setValue('display.customDisplayOptions', nextDisplays, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
    });

    useEffect(() => {
        const calculationsList = axisForm.getValues('calculations') ?? [];
        calculationsList.forEach((_, idx) => {
            updateLegendTextForIndex(idx);
        });
    }, [axisForm, metrics, updateLegendTextForIndex]);

    useSyncParsedGraphForm({
        watch: axisForm.watch,
        schema: axisGraphFormatSchema,
        onChange: setCurrentAxisData,
    });

    return (
        <>
            <AccordionSection
                title={localize('dashboards.options.yAxis')}
                value="y-axis"
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
                            axisForm.getValues(
                                `calculations.${index}` as const
                            ) ??
                            axisGraph.calculations[index] ??
                            field;
                        const fieldConcept =
                            conceptFromCalculation(currentCalc);
                        const hasTimeFilter = hasInPeriodFilter(currentCalc);
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
                                                'dashboards.options.series'
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
                                    isShowingTimeFilter={hasTimeFilter}
                                    setIsShowingTimeFilter={() =>
                                        handleToggleTimeFilter(index)
                                    }
                                    concept={fieldConcept}
                                    setMetric={(metric: ConceptSeries) => {
                                        handleSetMetric(metric, index);
                                    }}
                                >
                                    <SerieTypeAndColorPicker
                                        index={index}
                                        displayOptions={
                                            customDisplayOptions?.[index]
                                        }
                                        onChangeHandler={(data) => {
                                            handleSerieAndColorPicker(
                                                data,
                                                index
                                            );
                                        }}
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
                                {localize('dashboards.options.addSeries')}
                            </p>
                        </Button>
                    )}
                </div>
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.xAxis')}
                value="x-axis"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <ComboBox
                    multiple
                    maxItems={3}
                    value={formDomain?.group ?? []}
                    onChange={handleXAxisGroupChange}
                    options={conceptFieldOptions}
                    localizeFn={localize}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.displayOptions')}
                value="displayOptions"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
            >
                <div className="flex flex-col gap-4 border-primary bg-primary py-sm text-secondary">
                    <Checkbox
                        id={'flip'}
                        size="sm"
                        text={localize('dashboards.options.flipAxis')}
                        checked={display?.flipAxis}
                        onCheckedChange={handleFlipChange}
                    />
                    <Checkbox
                        id={'stack'}
                        size="sm"
                        text={localize('dashboards.options.stacked')}
                        disabled={calculationFields.length < 2}
                        checked={display?.barDisplay === 'stack'}
                        onCheckedChange={handleStackChange}
                    />
                    <Checkbox
                        id={'curveType'}
                        size="sm"
                        text={localize('dashboards.options.curvedLine')}
                        disabled={!hasLineSeries}
                        checked={hasLineSeries ? isCurveLine : false}
                        onCheckedChange={handleCurveTypeChange}
                    />
                    <ShowDecimals
                        useHint={true}
                        isShowingDecimals={display?.showDecimals ?? false}
                        onChangeDecimals={(checked) =>
                            setDisplayToggle(
                                axisForm,
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
                        {localize('dashboards.options.filter')}
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
                                    {localize('dashboards.options.filters')}{' '}
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
                                control={axisForm.control}
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
