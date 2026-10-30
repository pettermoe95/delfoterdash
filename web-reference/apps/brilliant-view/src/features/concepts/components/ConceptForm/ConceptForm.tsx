import type { SelectOption } from '@brilliant/bds-core';
import { Button, Checkbox, SingleSelect, TextField } from '@brilliant/bds-core';
import type { Concept, ConceptSeries, ConceptType } from '@bv/api';
import type { Period } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers.ts';
import type { ViewFilter } from '~/filters/viewFilter';
import { useFieldConcepts } from '~/hooks';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useConceptStats } from '../../hooks/useConceptUsage';
import { useValidateConceptExpression } from '../../hooks/useConceptValidation';
import ConceptPreview from '../ConceptPreview/ConceptPreview';
import { ConceptStats } from '../ConceptStats/ConceptStats';
import SyntaxHighlightedInput from '../SyntaxHighlighter/SyntaxHighlightedInput';
import type { KeywordColors } from '../SyntaxHighlighter/types';
import useHighlighterKeywords from '../SyntaxHighlighter/useHighlighterKeywords';
import { ConceptFilters } from './ConceptFilters/ConceptFilters';
import type { ConceptFilter } from './ConceptFilters/conceptFilterUtils';
import {
    addEditableFilterIfMissing,
    buildConceptFieldOptions,
    cleanFilters,
    clearEditableFilter,
    hasEditableFilterForConcept,
    removeEditableFilter,
    setEditableFilter,
    splitConceptFilters,
} from './ConceptFilters/conceptFilterUtils';
import { DeleteConceptModal } from './DeleteConceptModal/DeleteConceptModal';
import { ValidationMessage } from './ValidationMessage/ValidationMessage';

function createConceptTypeLabel(localize: (key: string) => string) {
    const CONCEPT_TYPE_LABELS: Record<ConceptType, string> = {
        metric: 'Metric',
        field: 'Field',
    };

    const CREATE_CONCEPT_TYPE_OPTIONS: SelectOption[] = [
        {
            label: localize(`concepts.form.type${CONCEPT_TYPE_LABELS.metric}`),
            value: 'metric',
        },
        {
            label: localize(`concepts.form.type${CONCEPT_TYPE_LABELS.field}`),
            value: 'field',
        },
    ];

    return CREATE_CONCEPT_TYPE_OPTIONS;
}

interface ConceptFormProps {
    initialValues: Concept;
    conceptType: ConceptType;
    onSubmit: (values: Concept) => Promise<Concept | void> | (Concept | void);
    onCancel?: () => void;
    onDelete?: () => Promise<void> | void;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    isDeleting?: boolean;
    disableCancelWhenPristine?: boolean;
}

type ConceptFormValues = Omit<Concept, 'filters'> & {
    filters: ViewFilter[];
};

export function ConceptForm({
    initialValues,
    conceptType,
    onSubmit,
    onCancel,
    onDelete,
    submitLabel = 'Save',
    cancelLabel = 'Reset Changes',
    isSubmitting = false,
    isDeleting = false,
    disableCancelWhenPristine = true,
}: ConceptFormProps) {
    const localize = useLocalize();
    const [searchParams] = useSearchParams();
    const { initialFormValues, initialPassthroughFilters } = useMemo(() => {
        const { editable, passthrough } = splitConceptFilters(
            Array.isArray(initialValues.filters) ? initialValues.filters : []
        );

        return {
            initialFormValues: {
                ...initialValues,
                filters: editable,
            } satisfies ConceptFormValues,
            initialPassthroughFilters: passthrough,
        };
    }, [initialValues]);
    const [previewTimePeriod, setPreviewTimePeriod] = useState<Period>('year');
    const [previewDeicticModifier, setPreviewDeicticModifier] =
        useState<ConceptSeries['deictic_modifier']>(0);
    const [previewGrouping, setPreviewGrouping] = useState<string>('month');
    const { data: conceptFields } = useFieldConcepts();
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isDirty },
    } = useForm<ConceptFormValues>({ defaultValues: initialFormValues });
    const isCreateMode = searchParams.get('createMode') === 'true';
    const { data: conceptUsage } = useConceptStats(initialValues.concept_name);

    const expression = useWatch({ control, name: 'expression' }) ?? '';
    const labelExpression =
        useWatch({ control, name: 'label_expression' }) ?? '';
    const conceptName = useWatch({ control, name: 'concept_name' }) ?? '';
    const conceptDisplayName =
        useWatch({ control, name: 'concept_name_pretty' }) ?? '';
    const unitNameValue = useWatch({ control, name: 'unit_name' }) ?? '';
    const conceptTypeValue = useWatch({ control, name: 'concept_type' }) as
        | ConceptType
        | undefined;
    const rawEditableFilters = useWatch({ control, name: 'filters' });
    const editableFilters = Array.isArray(rawEditableFilters)
        ? rawEditableFilters
        : [];
    const currentType =
        conceptTypeValue === 'metric' || conceptTypeValue === 'field'
            ? conceptTypeValue
            : conceptType;
    const typeSelectOptions: SelectOption[] = createConceptTypeLabel(localize);
    const disableUnit = currentType === 'field';
    const disableLabelExpression = currentType === 'metric';
    const keywords = useHighlighterKeywords();
    const highlighterColors: KeywordColors = {
        functions: '#4d86ae',
        tables: '#b544a6',
        columns: '#8366c3',
        metric_concepts: '#50b554',
        field_concepts: '#54a8a8',
        numbers: '#b89e1a',
        strings: '#008000',
        error: '#ff0000',
    };

    const conceptFieldOptions = useMemo(
        () => buildConceptFieldOptions(conceptFields),
        [conceptFields]
    );

    const applyEditableFilters = (nextEditable: ViewFilter[]) => {
        setValue('filters', nextEditable, { shouldDirty: true });
    };

    const updateConceptFilter = (nextFilter: ViewFilter) => {
        applyEditableFilters(setEditableFilter(editableFilters, nextFilter));
    };

    const removeConceptFilter = (concept: string) => {
        applyEditableFilters(removeEditableFilter(editableFilters, concept));
    };

    const clearConceptFilter = (concept: string) => {
        applyEditableFilters(clearEditableFilter(editableFilters, concept));
    };

    const handleAddFilter = (concept: string) => {
        if (!hasEditableFilterForConcept(editableFilters, concept)) {
            applyEditableFilters(
                addEditableFilterIfMissing(editableFilters, concept)
            );
        }
    };

    const cleanedFilters = cleanFilters([
        ...initialPassthroughFilters,
        ...editableFilters.map(
            (filter) => filter.toQueryFilter() as ConceptFilter
        ),
    ]);

    const { data: validationResult, isFetching: isValidating } =
        useValidateConceptExpression({
            expression,
            type: currentType,
        });
    const {
        data: labelExpressionValidationResult,
        isFetching: isLabelExpressionValidating,
    } = useValidateConceptExpression({
        expression: disableLabelExpression ? '' : labelExpression,
        type: 'field',
    });
    const hasExpressionInput = !!expression.trim();
    const hasLabelExpressionInput =
        !disableLabelExpression && !!labelExpression.trim();
    const isExpressionValid =
        hasExpressionInput && !!validationResult?.valid && !isValidating;
    const isLabelExpressionValid =
        disableLabelExpression ||
        !hasLabelExpressionInput ||
        (!!labelExpressionValidationResult?.valid &&
            !isLabelExpressionValidating);

    useEffect(() => {
        reset(initialFormValues);
    }, [initialFormValues, reset]);

    useEffect(() => {
        if (disableUnit && unitNameValue !== '') {
            setValue('unit_name', '', { shouldDirty: true });
        }
    }, [disableUnit, setValue, unitNameValue]);

    const handleCancel = () => {
        reset(initialFormValues);
        onCancel?.();
    };

    const onValidSubmit = handleSubmit(async (values) => {
        if (
            !isExpressionValid ||
            !isLabelExpressionValid ||
            !values.concept_name.trim()
        )
            return;

        const submittedFilters = cleanFilters([
            ...initialPassthroughFilters,
            ...(Array.isArray(values.filters) ? values.filters : []).map(
                (filter) => filter.toQueryFilter() as ConceptFilter
            ),
        ]);

        const payload: Concept = {
            concept_name: values.concept_name.trim(),
            concept_name_pretty: values.concept_name_pretty?.trim() ?? '',
            description: values.description?.trim() ?? '',
            unit_name: values.unit_name?.trim() ?? '',
            expression: values.expression,
            label_expression: values.label_expression,
            concept_type: values.concept_type,
            filters: submittedFilters,
            hidden: Boolean(values.hidden),
        };

        const result = (await onSubmit(payload)) ?? payload;
        const nextFilters = splitConceptFilters(
            Array.isArray(result.filters) ? result.filters : []
        );
        const nextFormValues: ConceptFormValues = {
            ...result,
            filters: nextFilters.editable,
        };
        reset(nextFormValues);
    });

    const hasRequiredFields =
        !!conceptName.trim() &&
        !!conceptDisplayName.trim() &&
        hasExpressionInput &&
        !!currentType;
    const saveDisabled =
        !isExpressionValid ||
        !isLabelExpressionValid ||
        !hasRequiredFields ||
        !isDirty ||
        isSubmitting;
    const cancelDisabled = disableCancelWhenPristine && !isDirty;
    const shouldShowPreview = isExpressionValid && currentType !== 'field';
    const canDelete = !isCreateMode && Boolean(onDelete);
    const isConceptInUse = Boolean(
        (conceptUsage?.dashboard_graphs?.length ?? 0) +
            (conceptUsage?.global_filters?.length ?? 0) +
            (conceptUsage?.concepts?.length ?? 0)
    );
    const deleteDisabled = !canDelete || isConceptInUse;

    return (
        <div data-component="concept-form">
            <ConceptStats conceptName={conceptName} />
            <div className="flex flex-col flex-wrap gap-3xl pb-3xl lg:w-[calc(100%_-_var(--edit-panel-width))] lg:flex-row lg:items-start lg:gap-xl">
                <form onSubmit={onValidSubmit} data-component="concept-form">
                    <div className="flex w-full max-w-[95%] flex-col gap-lg xl:max-w-[630px]">
                        <div className="flex w-full max-w-full flex-col gap-sm xl:max-w-[630px]">
                            <div className="flex flex-col gap-lg xl:flex-row xl:justify-between">
                                <div className="flex w-full flex-col gap-lg">
                                    <Controller
                                        name="concept_name"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={localize(
                                                    'concepts.form.name'
                                                )}
                                                size="sm"
                                                disabled={!isCreateMode}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="concept_name_pretty"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={localize(
                                                    'concepts.form.displayName'
                                                )}
                                                size="sm"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="flex w-full flex-col gap-lg">
                                    <Controller
                                        name="concept_type"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <SingleSelect
                                                name={field.name}
                                                label={localize(
                                                    'concepts.form.type'
                                                )}
                                                size="sm"
                                                options={typeSelectOptions}
                                                value={
                                                    field.value ?? currentType
                                                }
                                                disabled={!isCreateMode}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="unit_name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={localize(
                                                    'concepts.form.unit'
                                                )}
                                                size="sm"
                                                disabled={disableUnit}
                                                placeholder={
                                                    disableUnit
                                                        ? localize(
                                                              'concepts.form.notApplicableForFields'
                                                          )
                                                        : localize(
                                                              'concepts.form.noUnitDefined'
                                                          )
                                                }
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mt-sm flex flex-row items-end gap-lg">
                                <div className="w-[75%]">
                                    <Controller
                                        name="description"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                label={localize(
                                                    'miscTerms.description'
                                                )}
                                                size="sm"
                                                onChange={(event) =>
                                                    field.onChange(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                <div className="mb-2 w-[25%]">
                                    <Controller
                                        name="hidden"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                text={localize(
                                                    'concepts.form.hiddenConcept'
                                                )}
                                                size="sm"
                                                checked={field.value ?? false}
                                                onCheckedChange={(checked) =>
                                                    field.onChange(
                                                        Boolean(checked)
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mt-sm flex flex-col">
                                <p className="mb-sm text-secondary bv-text-font-sm-medium">
                                    {localize('concepts.form.expression')}
                                </p>
                                <Controller
                                    name="expression"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <SyntaxHighlightedInput
                                            className="h-[100px] w-full rounded-[5px] border border-solid border-[#394663] px-1 py-1 xl:w-[630px]"
                                            value={field.value ?? ''}
                                            keywords={keywords}
                                            colors={highlighterColors}
                                            onChange={(event) =>
                                                field.onChange(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    )}
                                />
                            </div>
                            <ValidationMessage
                                expression={expression}
                                conceptType={currentType}
                                validationResult={validationResult}
                                isValidating={isValidating}
                            />
                            <div className="mt-sm flex flex-col">
                                <p className="mb-sm text-secondary bv-text-font-sm-medium">
                                    {localize('concepts.form.labelExpression')}
                                </p>
                                <Controller
                                    name="label_expression"
                                    control={control}
                                    rules={{ required: false }}
                                    render={({ field }) => (
                                        <SyntaxHighlightedInput
                                            className="h-[100px] w-full rounded-[5px] border border-solid border-[#394663] px-1 py-1 xl:w-[630px]"
                                            value={
                                                disableLabelExpression
                                                    ? ''
                                                    : field.value
                                            }
                                            keywords={keywords}
                                            colors={highlighterColors}
                                            disabled={disableLabelExpression}
                                            onChange={(event) =>
                                                field.onChange(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    )}
                                />
                            </div>
                            {!disableLabelExpression && (
                                <ValidationMessage
                                    expression={labelExpression}
                                    conceptType={currentType}
                                    validationResult={
                                        labelExpressionValidationResult
                                    }
                                    isValidating={isLabelExpressionValidating}
                                />
                            )}
                            <ConceptFilters
                                conceptFieldOptions={conceptFieldOptions}
                                editableFilters={editableFilters}
                                localize={localize}
                                onAddFilter={handleAddFilter}
                                onConceptValueChange={updateConceptFilter}
                                onDeleteFilter={removeConceptFilter}
                                onClearFilterValue={clearConceptFilter}
                            />
                        </div>
                        <div
                            className={
                                isCreateMode
                                    ? 'flex flex-col items-end gap-md lg:flex-row lg:justify-end'
                                    : 'flex flex-col items-end gap-md lg:flex-row lg:justify-between'
                            }
                        >
                            <div className={isCreateMode ? 'hidden' : 'block'}>
                                <DeleteConceptModal
                                    concept={initialValues}
                                    onDelete={onDelete}
                                    disabled={deleteDisabled}
                                    isDeleting={isDeleting}
                                />
                            </div>
                            <div className="mt-md flex w-full flex-col gap-sm lg:w-auto lg:flex-row">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="w-26"
                                    disabled={cancelDisabled}
                                    onClick={handleCancel}
                                >
                                    {cancelLabel}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="filled"
                                    className="w-26"
                                    disabled={saveDisabled}
                                >
                                    {isSubmitting
                                        ? localize('miscTerms.saving')
                                        : submitLabel}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="mt-3xl w-[92vw] pt-3xl lg:mt-0 lg:flex lg:w-full lg:items-end lg:justify-end xl:w-[630px]">
                    {shouldShowPreview && (
                        <ConceptPreview
                            expression={expression}
                            validated={isExpressionValid}
                            filters={cleanedFilters}
                            timePeriod={previewTimePeriod}
                            onTimePeriodChange={setPreviewTimePeriod}
                            deicticModifier={previewDeicticModifier}
                            setDeicticModifier={setPreviewDeicticModifier}
                            grouping={previewGrouping}
                            setGrouping={setPreviewGrouping}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
