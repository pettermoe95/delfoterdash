import { useState } from 'react';
import type { Condition, EditableCondition } from './relationshipPredicate';
import {
    conditionPredicate,
    defaultBetweenBounds,
    predicateFormState,
    referencedRelations,
    validateCondition,
} from './relationshipPredicate';
import type { Predicate } from './semanticModel';

export function useRelationshipPredicate({
    source,
    target,
    sourceColumns,
    targetColumns,
    existingPredicate,
}: {
    source: string;
    target: string;
    sourceColumns: string[];
    targetColumns: string[];
    existingPredicate?: Predicate;
}) {
    const defaultCondition: EditableCondition = {
        kind: 'editable',
        leftRelation: 'source',
        leftColumn: sourceColumns[0] ?? '',
        rightKind: 'column',
        rightValue: targetColumns[0] ?? '',
        literalType: 'TEXT',
        operator: 'eq',
        values: [''],
        ...defaultBetweenBounds(targetColumns),
    };
    const [initialPredicate] = useState(() =>
        predicateFormState(existingPredicate, defaultCondition, source, target)
    );
    const [logic, setLogic] = useState(initialPredicate.logic);
    const [negate, setNegate] = useState(initialPredicate.negate);
    const [predicateChanged, setPredicateChanged] = useState(false);
    const [conditions, setConditions] = useState<Condition[]>(
        initialPredicate.conditions
    );
    const updateCondition = (
        index: number,
        value: Partial<EditableCondition>
    ) => {
        setPredicateChanged(true);
        setConditions((all) =>
            all.map((condition, current) =>
                current === index && condition.kind === 'editable'
                    ? { ...condition, ...value }
                    : condition
            )
        );
    };
    const getPredicate = (): Predicate => {
        if (existingPredicate && !predicateChanged) return existingPredicate;
        const predicates = conditions.map((condition) =>
            conditionPredicate(condition, source, target)
        );
        const joined: Predicate =
            predicates.length === 1
                ? predicates[0]
                : { type: logic, predicates };
        return negate ? { type: 'not', predicate: joined } : joined;
    };
    const addCondition = () => {
        setPredicateChanged(true);
        setConditions((all) => [...all, defaultCondition]);
    };
    const removeCondition = (index: number) => {
        setPredicateChanged(true);
        setConditions((all) => all.filter((_, current) => current !== index));
    };
    const changeLogic = (value: 'and' | 'or') => {
        setPredicateChanged(true);
        setLogic(value);
    };
    const changeNegate = (value: boolean) => {
        setPredicateChanged(true);
        setNegate(value);
    };
    const conditionErrors = conditions.map((condition) =>
        validateCondition(condition, sourceColumns, targetColumns)
    );
    const invalidIndex = conditionErrors.findIndex(
        (errors) => Object.keys(errors).length > 0
    );
    const relations = referencedRelations(getPredicate());
    const validationError =
        invalidIndex >= 0
            ? `Condition ${invalidIndex + 1}: ${Object.values(conditionErrors[invalidIndex])[0]}`
            : !relations.includes(source) || !relations.includes(target)
              ? `The predicate must reference both ${source} and ${target}. Keep a column-to-column join condition alongside role filters.`
              : undefined;

    return {
        conditions,
        conditionErrors,
        logic,
        negate,
        updateCondition,
        addCondition,
        removeCondition,
        changeLogic,
        changeNegate,
        getPredicate,
        validationError,
        invalid: Boolean(validationError),
    };
}
