import { TextField } from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { FormActions } from './FormActions';
import type { SemanticRelation, WarehouseTable } from './semanticModel';
import { warehouseValue } from './semanticModel';

const identifier = /^[a-z_][a-z0-9_]*$/;

type RoleFormProps = {
    table?: WarehouseTable;
    relation?: SemanticRelation;
    relations: SemanticRelation[];
    onSubmit: (body: Record<string, unknown>) => void;
    onCancel: () => void;
    onDelete?: () => void;
    pending: boolean;
};

export function RoleForm({
    table,
    relation,
    relations,
    onSubmit,
    onCancel,
    onDelete,
    pending,
}: RoleFormProps) {
    const [name, setName] = useState(
        relation?.relationName ?? (table ? warehouseValue(table.name) : '')
    );
    const physicalTable =
        relation?.physicalTable ?? (table ? warehouseValue(table.name) : '');
    const physicalSchema =
        relation?.physicalSchema ??
        (table ? warehouseValue(table.schema) : null);
    const duplicate = relations.some(
        (item) =>
            item.relationName === name &&
            item.relationName !== relation?.relationName
    );
    const nameError = !identifier.test(name)
        ? 'Use lowercase letters, digits, and underscores.'
        : duplicate
          ? 'A semantic role with this name already exists.'
          : undefined;
    const invalid = Boolean(nameError);
    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (
        event
    ) => {
        event.preventDefault();
        if (!invalid)
            onSubmit({
                relationName: name,
                physicalTable,
                physicalSchema,
                predicate: relation?.predicate ?? null,
            });
    };

    const handleNameChange: NonNullable<
        ComponentProps<typeof TextField>['onChange']
    > = (event) => setName(event.target.value);

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <h3 className="font-semibold">
                {relation ? 'Edit role' : 'Create role'}
            </h3>
            <TextField
                name="relationName"
                label="Role alias"
                value={name}
                onChange={handleNameChange}
                error={invalid}
                supportingText={
                    nameError ??
                    'Lowercase letters, digits, and underscores. This is the name used in concept expressions.'
                }
            />
            <div className="rounded bg-secondary p-3 text-sm">
                <div className="font-medium">Physical mapping</div>
                <div>
                    {physicalSchema ? `${physicalSchema}.` : ''}
                    {physicalTable}
                </div>
            </div>
            <FormActions
                onCancel={onCancel}
                onDelete={onDelete}
                pending={pending}
                submitLabel={relation ? 'Save role' : 'Create role'}
            />
        </form>
    );
}
