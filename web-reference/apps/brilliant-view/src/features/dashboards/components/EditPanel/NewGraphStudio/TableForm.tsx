import type { SelectOption } from '@brilliant/bds-core';
import { Button, Checkbox, ComboBox, Icon } from '@brilliant/bds-core';
import type {
    ConceptSeries,
    DashboardGraphQueryCalculations,
    ExtensiveDashboardConceptMetric,
    TableGraphFormat,
} from '@bv/api';
import { tableGraphFormatSchema } from '@bv/api';
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
import { createPeriodOptions } from './Utils/offsetAndPeriodFilterHelpers';
import { buildTableColumnLabels, setShowTotalRow } from './Utils/tableUtils';
import { useSyncParsedGraphForm } from './Utils/useSyncParsedGraphForm';

type TableFormProps = {
    tableGraph: TableGraphFormat;
    metrics: ExtensiveDashboardConceptMetric[];
    conceptFieldOptions: SelectOption[];
    setCurrentTableData: (value: TableGraphFormat) => void;
};

export function TableForm({
    tableGraph,
    metrics,
    conceptFieldOptions,
    setCurrentTableData,
}: TableFormProps) {
    const localize = useLocalize();
    const metricOptions = useMemo(
        () => getMetricOptionsFromConcepts(metrics),
        [metrics]
    );

    const defaultConcept = useMemo<ConceptSeries | null>(() => {
        const firstOption = metricOptions[0];
        if (!firstOption) return null;
        return {
            concept_name: String(firstOption.value ?? ''),
            deictic_modifier: 0,
            time_period: 'year',
        } satisfies ConceptSeries;
    }, [metricOptions]);

    const tableForm = useForm<TableGraphFormat>({
        defaultValues: tableGraph,
        resolver: zodResolver(tableGraphFormatSchema),
        mode: 'onChange',
    });

    const {
        fields: calculationFields,
        append: appendCalculation,
        remove: removeCalculation,
        move: moveCalculation,
    } = useFieldArray({ control: tableForm.control, name: 'calculations' });

    const {
        fields: domainFilterFields,
        append: appendDomainFilter,
        remove: removeDomainFilter,
    } = useFieldArray({ control: tableForm.control, name: 'domain.filter' });

    const calculations = tableForm.getValues('calculations') ?? [];

    const formDomain = useWatch({
        control: tableForm.control,
        name: 'domain',
    });
    const formDisplay = useWatch({
        control: tableForm.control,
        name: 'display',
    });
    const showSumRow = formDisplay?.showSumRow ?? true;
    const showDecimals = formDisplay?.showDecimals ?? false;

    const calculationsList = calculations;

    function handleToggleTimeFilter(index: number) {
        toggleCalculationTimeFilterForForm({
            form: tableForm,
            index,
            isAlltimeData,
            conceptFromCalculation,
        });
    }

    const handleSetMetric = useCallback(
        (concept: ConceptSeries, index: number) => {
            setCalculationMetricForForm({
                form: tableForm,
                index,
                metric: concept,
                buildNextCalc: buildCalculationFromMetricPreservingTimeFilter,
                onAfterSet: () => {
                    const nextCalcs = tableForm.getValues('calculations') ?? [];
                    tableForm.setValue(
                        'alltimeData',
                        isAlltimeData(nextCalcs),
                        {
                            shouldDirty: true,
                        }
                    );
                },
            });
        },
        [tableForm]
    );

    const handleRemoveCalculation = useCallback(
        (index: number) => {
            if (calculationFields.length <= 1) {
                return;
            }
            removeCalculation(index);
        },
        [calculationFields.length, removeCalculation]
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
            tableForm.setValue(`domain.filter.${index}`, nextFilter, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [tableForm]
    );

    const handleShowTotalRowChange = useCallback(
        (checked: boolean) => {
            setShowTotalRow({ form: tableForm, value: checked });
        },
        [tableForm]
    );

    const handleTableGroupChange = (value: string | string[]) => {
        const next = Array.isArray(value) ? value : value ? [value] : [];
        tableForm.setValue('domain.group', next, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const {
        dropIndex: dropCalculationIndex,
        isDragging,
        onDragStart,
        onDragOver,
        onContainerDragOver,
        onDrop,
        onDragEnd,
    } = useDragReorder({
        itemCount: calculationFields.length,
        onMove: (from, to) => moveCalculation(from, to),
    });

    const buildCurrentTableData = useCallback(
        (data: TableGraphFormat) => {
            const nextCalcs = buildTableColumnLabels(data, metrics);
            return { ...data, calculations: nextCalcs };
        },
        [metrics]
    );
    useSyncParsedGraphForm({
        watch: tableForm.watch,
        schema: tableGraphFormatSchema,
        onChange: setCurrentTableData,
        transform: buildCurrentTableData,
    });

    return (
        <>
            <AccordionSection
                title={localize('dashboards.options.columnGrouping')}
                value="group"
                ChevronUp={ChevronUp}
                ChevronDown={ChevronDown}
                startOpened={true}
            >
                <ComboBox
                    multiple
                    maxItems={3}
                    value={formDomain?.group ?? []}
                    onChange={handleTableGroupChange}
                    options={conceptFieldOptions}
                    localizeFn={localize}
                />
            </AccordionSection>
            <AccordionSection
                title={localize('dashboards.options.columns')}
                value="concept"
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
                        const calculation:
                            | DashboardGraphQueryCalculations
                            | undefined = calculationsList[index];
                        const concept = calculation
                            ? conceptFromCalculation(calculation)
                            : defaultConcept;
                        if (!concept) {
                            return null;
                        }
                        const hasTimeFilter = hasInPeriodFilter(calculation);

                        return (
                            <div
                                key={field.id}
                                className="flex flex-col gap-md"
                                data-drag-row="true"
                                onDragOverCapture={(event) =>
                                    onDragOver(event, index)
                                }
                                onDropCapture={onDrop}
                            >
                                <DropIndicator
                                    active={dropCalculationIndex === index}
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
                                                'dashboards.options.column'
                                            )}{' '}
                                            {index + 2}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        color="error"
                                        className="p-1.5"
                                        disabled={calculationFields.length <= 1}
                                        onClick={() =>
                                            handleRemoveCalculation(index)
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
                                    concept={concept}
                                    setMetric={(nextConcept: ConceptSeries) => {
                                        handleSetMetric(nextConcept, index);
                                    }}
                                />
                            </div>
                        );
                    })}
                    <DropIndicator
                        active={
                            dropCalculationIndex === calculationFields.length
                        }
                        onDragOverCapture={(event) =>
                            onDragOver(event, calculationFields.length)
                        }
                        onDropCapture={onDrop}
                    />

                    {calculationFields.length < 15 && (
                        <Button
                            className="place-self-start"
                            variant="ghost"
                            color="gray"
                            onClick={() =>
                                addCalculation({
                                    calculations,
                                    appendCalculation,
                                })
                            }
                        >
                            <Plus />
                            <p className="bv-text-font-sm-medium">
                                {localize('dashboards.options.addConcept')}
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
                        id={'showSumRow'}
                        size="sm"
                        text={localize('dashboards.options.showSumRow')}
                        checked={showSumRow}
                        onCheckedChange={(next) =>
                            handleShowTotalRowChange(next === true)
                        }
                    />
                    <ShowDecimals
                        isShowingDecimals={showDecimals}
                        onChangeDecimals={(checked) =>
                            setDisplayToggle(
                                tableForm,
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
                                control={tableForm.control}
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
