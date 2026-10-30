import { SingleSelect, TextField } from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import { literalTypes } from './semanticModel';
import type { LiteralOperand } from './semanticModel';

type RelationshipLiteralInputProps = {
    name: string;
    literal: LiteralOperand;
    onChange: (literal: LiteralOperand) => void;
};

export function RelationshipLiteralInput({
    name,
    literal,
    onChange,
}: RelationshipLiteralInputProps) {
    const handleValueChange: NonNullable<
        ComponentProps<typeof TextField>['onChange']
    > = (event) => onChange({ ...literal, value: event.target.value });

    const handleTypeChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) =>
        onChange({
            ...literal,
            literal_type: value as LiteralOperand['literal_type'],
        });

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2">
            <label className="text-xs font-medium text-secondary">
                Literal
                <TextField
                    name={name}
                    value={literal.value}
                    onChange={handleValueChange}
                />
            </label>
            <label className="text-xs font-medium text-secondary">
                Type
                <SingleSelect
                    value={literal.literal_type}
                    onChange={handleTypeChange}
                    options={[...literalTypes]}
                />
            </label>
        </div>
    );
}
