import type { Concept, ConceptType } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo } from 'react';

export interface ConceptListProps {
    concepts: Concept[];
    conceptType: ConceptType;
    isLoading: boolean;
    onSelectConcept: (concept: Concept, type: ConceptType) => void;
    selectedConcept?: Concept | null;
    emptyLabel: string;
}

export function ConceptList({
    concepts,
    conceptType,
    isLoading,
    onSelectConcept,
    selectedConcept,
    emptyLabel,
}: ConceptListProps) {
    const localize = useLocalize();
    const sortedConcepts = useMemo(
        () =>
            [...concepts].sort((a, b) =>
                a.concept_name.localeCompare(b.concept_name, undefined, {
                    sensitivity: 'base',
                })
            ),
        [concepts]
    );

    if (isLoading) {
        return (
            <p className="p-md text-secondary bv-text-font-sm-regular">
                {localize('concepts.loadingConcepts')}
            </p>
        );
    }

    if (!concepts.length) {
        return (
            <p className="p-md text-secondary bv-text-font-sm-regular">
                {emptyLabel}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-xs overflow-x-hidden">
            {sortedConcepts.map((concept) => {
                const isSelected =
                    selectedConcept?.concept_name === concept.concept_name;

                return (
                    <div
                        key={concept.concept_name}
                        className={`hover:bg-brand-primary/10 rounded-sm border border-transparent py-xs text-left transition hover:cursor-pointer hover:bg-brand-primary ${
                            isSelected
                                ? 'bg-brand-primary font-semibold text-brand-primary'
                                : 'text-primary'
                        }`}
                    >
                        <button
                            key={concept.concept_name}
                            type="button"
                            className="mx-sm flex w-full items-center py-sm"
                            onClick={() =>
                                onSelectConcept(concept, conceptType)
                            }
                        >
                            <div className="bv-text-font-sm-regular">
                                {concept.concept_name_pretty ||
                                    concept.concept_name}
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
