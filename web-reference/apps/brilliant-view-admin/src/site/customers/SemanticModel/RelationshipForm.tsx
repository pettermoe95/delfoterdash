import { TextField } from '@brilliant/bds-core';
import { FormActions } from '~/site/customers/SemanticModel/FormActions.tsx';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { RelationshipJoinSettings } from './RelationshipJoinSettings';
import { RelationshipPredicateEditor } from './RelationshipPredicateEditor';
import type {
    SemanticRelation,
    SemanticRelationship,
    WarehouseSchema,
} from './semanticModel';
import { relationColumns } from './semanticModel';
import { useRelationshipPredicate } from './useRelationshipPredicate';

const identifier = /^[a-z_][a-z0-9_]*$/;

type RelationshipFormProps = {
    source: string;
    target: string;
    tenantId: string;
    relationship?: SemanticRelationship;
    relations: SemanticRelation[];
    warehouse?: WarehouseSchema;
    onSubmit: (body: Record<string, unknown>) => void;
    onCancel: () => void;
    onDelete?: () => void;
    pending: boolean;
};

export function RelationshipForm({
    source,
    target,
    tenantId,
    relationship,
    relations,
    warehouse,
    onSubmit,
    onCancel,
    onDelete,
    pending,
}: RelationshipFormProps) {
    const [name, setName] = useState(
        relationship?.relationshipName ?? `${source}_to_${target}`
    );
    const [maximumTargetMatches, setMaximumTargetMatches] = useState<
        'ONE' | 'MANY'
    >(relationship?.maximumTargetMatches ?? 'ONE');
    const [requiredness, setRequiredness] = useState<'REQUIRED' | 'OPTIONAL'>(
        relationship?.requiredness ?? 'OPTIONAL'
    );
    const sourceColumns = relationColumns(
        relations.find((item) => item.relationName === source),
        warehouse,
        tenantId
    ).map((column) => column.name);
    const targetColumns = relationColumns(
        relations.find((item) => item.relationName === target),
        warehouse,
        tenantId
    ).map((column) => column.name);
    const predicateForm = useRelationshipPredicate({
        source,
        target,
        sourceColumns,
        targetColumns,
        existingPredicate: relationship?.predicate,
    });
    const invalid = !identifier.test(name) || predicateForm.invalid;
    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (
        event
    ) => {
        event.preventDefault();
        if (!invalid)
            onSubmit({
                relationshipName: name,
                sourceRelation: source,
                targetRelation: target,
                predicate: predicateForm.getPredicate(),
                maximumTargetMatches,
                requiredness,
                joinType: requiredness === 'REQUIRED' ? 'INNER' : 'LEFT',
            });
    };

    const handleNameChange: NonNullable<
        ComponentProps<typeof TextField>['onChange']
    > = (event) => setName(event.target.value);

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <h3 className="font-semibold">
                {relationship ? 'Edit relationship' : 'Create relationship'}
            </h3>
            <div className="rounded bg-brand-primary p-3 text-sm">
                <b>{source}</b> → <b>{target}</b>
                <br />
                <span className="text-tertiary">
                    Direction is locked here and is the only direction the
                    planner may traverse.
                </span>
            </div>
            <TextField
                name="relationshipName"
                label="Relationship name"
                value={name}
                onChange={handleNameChange}
                error={!identifier.test(name)}
            />
            <RelationshipPredicateEditor
                source={source}
                target={target}
                sourceColumns={sourceColumns}
                targetColumns={targetColumns}
                form={predicateForm}
            />
            <RelationshipJoinSettings
                source={source}
                target={target}
                maximumTargetMatches={maximumTargetMatches}
                requiredness={requiredness}
                onMaximumTargetMatchesChange={setMaximumTargetMatches}
                onRequirednessChange={setRequiredness}
            />
            <FormActions
                onCancel={onCancel}
                onDelete={onDelete}
                pending={pending}
                submitLabel={
                    relationship ? 'Save relationship' : 'Create relationship'
                }
            />
        </form>
    );
}
