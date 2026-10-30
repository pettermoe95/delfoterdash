import { IconButton, TextField } from '@brilliant/bds-core';
import type { ChangeEvent } from 'react';

type RelationshipInValuesProps = {
    index: number;
    values: string[];
    onChange: (values: string[]) => void;
};

export function RelationshipInValues({
    index,
    values,
    onChange,
}: RelationshipInValuesProps) {
    const handleAddValue = () => onChange([...values, '']);

    const handleValueChange = (
        valueIndex: number,
        event: ChangeEvent<HTMLInputElement>
    ) =>
        onChange(
            values.map((value, current) =>
                current === valueIndex ? event.target.value : value
            )
        );

    const handleRemoveValue = (valueIndex: number) => {
        if (values.length <= 1) return;
        onChange(values.filter((_, current) => current !== valueIndex));
    };

    const addValueButton = (
        <IconButton
            asChild
            size="md"
            variant="outlined"
            color="gray"
            icon="bv:plus"
        >
            <button
                type="button"
                className="!w-8 !border-primary"
                aria-label="Add value"
                title="Add value"
                onClick={handleAddValue}
            />
        </IconButton>
    );
    return (
        <fieldset>
            <legend className="text-xs font-medium text-secondary">
                IN values
            </legend>
            <div className="space-y-2">
                {values.map((literal, valueIndex) => (
                    <div
                        key={valueIndex}
                        className="grid grid-cols-[minmax(0,1fr)_2rem_2rem] items-end gap-1"
                    >
                        <label>
                            <span className="sr-only">
                                Value {valueIndex + 1}
                            </span>
                            <TextField
                                name={`in-value-${index}-${valueIndex}`}
                                value={literal}
                                onChange={(event) =>
                                    handleValueChange(valueIndex, event)
                                }
                            />
                        </label>
                        <IconButton
                            asChild
                            size="md"
                            variant="outlined"
                            color="gray"
                            icon="mdi:minus"
                            disabled={values.length <= 1}
                        >
                            <button
                                type="button"
                                className="!w-8 !border-primary"
                                aria-label={`Remove value ${valueIndex + 1}`}
                                title="Remove value"
                                onClick={() => handleRemoveValue(valueIndex)}
                            />
                        </IconButton>
                        {valueIndex === values.length - 1 ? (
                            addValueButton
                        ) : (
                            <span aria-hidden="true" />
                        )}
                    </div>
                ))}
                {values.length === 0 && (
                    <div className="flex justify-end">{addValueButton}</div>
                )}
            </div>
        </fieldset>
    );
}
