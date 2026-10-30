import type { Concept, ConceptPayload, ConceptType } from '@bv/api';
import { conceptPayloadSchema } from '@bv/api';
import type { ToastVariant } from '@bv/ui';
import { useToastContext } from '@bv/ui';
import { PERMISSION, useAccount } from '~/features/auth';
import { filterConcepts } from '~/features/dashboards/components/EditPanel/Panes/utils';
import { useLocalize } from '~/i18n/I18nContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    useCreateConcept,
    useDeleteConcept,
    useUpdateConcept,
} from '../../hooks/useConceptMutations';
import { useEditableConceptsList } from '../../hooks/useEditableConceptsLists';
import { filterConceptsByType } from '../../utils/filterConceptsByType';
import { ConceptForm } from '../ConceptForm/ConceptForm';
import { ConceptsSidebar } from './ConceptsSidebar';

interface SelectedConceptState {
    concept: Concept;
    conceptType: ConceptType;
}

interface ConceptsOverviewProps {
    isCreateMode?: boolean;
    onEnterCreateMode?: () => void;
    onExitCreateMode?: () => void;
    mobileSidebarOpen?: boolean;
    onMobileSidebarOpenChange?: (open: boolean) => void;
}

const normalizeConceptForEdit = (
    concept: Concept,
    conceptType: ConceptType
): Concept => ({
    ...concept,
    concept_name_pretty: concept.concept_name_pretty ?? '',
    description: concept.description ?? '',
    unit_name: concept.unit_name ?? '',
    expression: concept.expression ?? '',
    label_expression: concept.label_expression ?? '',
    concept_type: concept.concept_type ?? conceptType,
    hidden: Boolean(concept.hidden),
});

export function ConceptsOverview({
    isCreateMode = false,
    onEnterCreateMode,
    onExitCreateMode,
    mobileSidebarOpen,
    onMobileSidebarOpenChange,
}: ConceptsOverviewProps) {
    const localize = useLocalize();
    const { data: concepts, isLoading } = useEditableConceptsList();
    const [selectedConcept, setSelectedConcept] =
        useState<SelectedConceptState | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<ConceptType>('metric');
    const initialCreateValues = useMemo(
        () => createInitialConceptValues(activeTab),
        [activeTab]
    );
    const [showCreatePanel, setShowCreatePanel] = useState(isCreateMode);
    const { displayToast } = useToastContext();
    const { hasPermission } = useAccount();

    const { mutate: createConcept, isPending: isCreating } = useCreateConcept();
    const { mutate: updateConcept, isPending: isSaving } = useUpdateConcept();
    const { mutate: deleteConcept, isPending: isDeleting } = useDeleteConcept();

    const { fields, metrics } = useMemo(
        () => filterConceptsByType(concepts),
        [concepts]
    );

    const excludeConceptName = false;
    const minQueryLength = 1;
    const sortByPrettyName = false;

    const filteredFields = useMemo(
        () =>
            filterConcepts(
                fields,
                search,
                excludeConceptName,
                minQueryLength,
                sortByPrettyName
            ),
        [excludeConceptName, fields, minQueryLength, search, sortByPrettyName]
    );

    const filteredMetrics = useMemo(
        () =>
            filterConcepts(
                metrics,
                search,
                excludeConceptName,
                minQueryLength,
                sortByPrettyName
            ),
        [excludeConceptName, metrics, minQueryLength, search, sortByPrettyName]
    );

    useEffect(() => {
        if (
            selectedConcept &&
            !concepts?.some(
                (concept) =>
                    concept.concept_name ===
                    selectedConcept.concept.concept_name
            )
        ) {
            setSelectedConcept(null);
        }
    }, [concepts, selectedConcept]);

    useEffect(() => {
        setShowCreatePanel(isCreateMode);
    }, [isCreateMode]);

    useEffect(() => {
        if (showCreatePanel) {
            setSelectedConcept(null);
        }
    }, [showCreatePanel]);

    const showToast = useCallback(
        (
            message: string,
            options?: { description?: string; variant?: ToastVariant }
        ) => {
            displayToast({
                type: options?.variant ?? 'success',
                text: message,
            });
        },
        [displayToast]
    );

    const toError = (error: unknown) =>
        error instanceof Error ? error : new Error(getErrorMessage(error));

    const getErrorMessage = (error: unknown) =>
        error instanceof Error ? error.message : localize('genericError');

    const openCreatePanel = useCallback(() => {
        setSelectedConcept(null);
        setShowCreatePanel(true);
        onEnterCreateMode?.();
        onMobileSidebarOpenChange?.(false);
    }, [onEnterCreateMode, onMobileSidebarOpenChange]);

    const exitCreateMode = useCallback(() => {
        setShowCreatePanel(false);
        onExitCreateMode?.();
    }, [onExitCreateMode]);

    const handleSelectConcept = (
        concept: Concept,
        conceptType: ConceptType
    ) => {
        exitCreateMode();
        setSelectedConcept({
            concept: normalizeConceptForEdit(concept, conceptType),
            conceptType,
        });
        onMobileSidebarOpenChange?.(false);
    };

    if (!hasPermission(PERMISSION.CONCEPTS_EDIT)) {
        return (
            <div
                data-component="concepts-overview"
                className="text-danger p-md"
            >
                {localize('users.noAccess')}
            </div>
        );
    }

    if (!concepts && !isLoading) {
        return (
            <div
                data-component="concepts-overview"
                className="text-warning p-md"
            >
                {localize('concepts.conceptsNotFound')}
            </div>
        );
    }

    const handleCreateSubmit = (values: Concept) =>
        new Promise<Concept | void>((resolve, reject) => {
            createConcept(
                {
                    concept_name: values.concept_name,
                    concept_name_pretty: values.concept_name_pretty,
                    description: values.description?.trim() ?? '',
                    unit_name: values.unit_name ? values.unit_name : null,
                    expression: values.expression,
                    label_expression: values.label_expression
                        ? values.label_expression
                        : undefined,
                    concept_type: values.concept_type,
                    hidden: Boolean(values.hidden),
                    filters: values.filters ?? [],
                },
                {
                    onSuccess: (createdConcept) => {
                        const concept = createdConcept ?? values;
                        const conceptType =
                            concept.concept_type === 'field' ||
                            concept.concept_type === 'metric'
                                ? concept.concept_type
                                : activeTab;
                        setSelectedConcept({
                            concept: normalizeConceptForEdit(
                                concept,
                                conceptType
                            ),
                            conceptType,
                        });
                        showToast(localize('concepts.toastCreateSuccess'));
                        exitCreateMode();
                        resolve(concept);
                    },
                    onError: (error) => {
                        showToast(localize('concepts.toastCreateFailed'), {
                            variant: 'error',
                            description: getErrorMessage(error),
                        });
                        reject(toError(error));
                    },
                }
            );
        });

    const toValidConceptPayload = (concept: Concept): ConceptPayload =>
        conceptPayloadSchema.parse({
            concept_name: concept.concept_name,
            concept_name_pretty: concept.concept_name_pretty,
            concept_type: concept.concept_type,
            expression: concept.expression,
            label_expression: concept.label_expression,
            unit_name: concept.unit_name || '',
            description: concept.description?.trim() ?? '',
            hidden: Boolean(concept.hidden),
            filters: concept.filters ?? [],
        });

    const handleUpdateSubmit = (values: Concept) =>
        new Promise<Concept | void>((resolve, reject) => {
            updateConcept(toValidConceptPayload(values), {
                onSuccess: () => {
                    showToast(localize('concepts.toastUpdateSuccess'));
                    resolve(values);
                },
                onError: (error) => {
                    showToast(localize('concepts.toastUpdateFailed'), {
                        variant: 'error',
                        description: getErrorMessage(error),
                    });
                    reject(toError(error));
                },
            });
        });

    const handleDeleteConcept = (conceptName: string) =>
        new Promise<void>((resolve, reject) => {
            deleteConcept(conceptName, {
                onSuccess: () => {
                    showToast(localize('concepts.toastDeleteSuccess'));
                    setSelectedConcept(null);
                    resolve();
                },
                onError: (error) => {
                    showToast(localize('concepts.toastDeleteFailed'), {
                        variant: 'error',
                        description: getErrorMessage(error),
                    });
                    reject(toError(error));
                },
            });
        });

    const shouldShowForm = showCreatePanel || !!selectedConcept;

    const renderContent = () => {
        if (!shouldShowForm) {
            return (
                <p className="text-placeholder bv-text-font-sm-regular">
                    {localize('concepts.welcomeMessage')}
                </p>
            );
        }

        const formInitialValues = showCreatePanel
            ? initialCreateValues
            : (selectedConcept?.concept ?? initialCreateValues);

        const formConceptType = showCreatePanel
            ? activeTab
            : (selectedConcept?.conceptType ?? activeTab);

        return (
            <ConceptForm
                initialValues={formInitialValues}
                conceptType={formConceptType}
                onSubmit={
                    showCreatePanel ? handleCreateSubmit : handleUpdateSubmit
                }
                onCancel={showCreatePanel ? exitCreateMode : undefined}
                submitLabel={
                    showCreatePanel
                        ? localize('concepts.createConcept')
                        : localize('concepts.saveConcept')
                }
                cancelLabel={
                    showCreatePanel
                        ? localize('miscTerms.cancel')
                        : localize('miscTerms.resetChanges')
                }
                isSubmitting={showCreatePanel ? isCreating : isSaving}
                isDeleting={isDeleting}
                disableCancelWhenPristine={!showCreatePanel}
                onDelete={
                    !showCreatePanel && selectedConcept
                        ? () =>
                              handleDeleteConcept(
                                  selectedConcept.concept.concept_name
                              )
                        : undefined
                }
            />
        );
    };

    return (
        <>
            <div
                data-component="concepts-overview"
                className="h-full w-full overflow-y-auto overflow-x-hidden lg:mr-[var(--edit-panel-width)]"
            >
                <div className="min-w-0 flex-1 overflow-auto">
                    <div className="min-h-full rounded-sm py-lg">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <ConceptsSidebar
                search={search}
                onSearchChange={(value) => setSearch(value)}
                activeTab={activeTab}
                onTabChange={(value) => setActiveTab(value)}
                filteredFields={filteredFields}
                filteredMetrics={filteredMetrics}
                isLoading={isLoading}
                handleSelectConcept={handleSelectConcept}
                selectedConcept={selectedConcept?.concept}
                onCreateConcept={openCreatePanel}
                mobileOpen={mobileSidebarOpen}
                onMobileOpenChange={onMobileSidebarOpenChange}
            />
        </>
    );
}

function createInitialConceptValues(conceptType: ConceptType): Concept {
    return {
        concept_name: '',
        concept_name_pretty: '',
        description: '',
        unit_name: '',
        expression: '',
        label_expression: '',
        concept_type: conceptType,
        filters: [],
        hidden: false,
    };
}
