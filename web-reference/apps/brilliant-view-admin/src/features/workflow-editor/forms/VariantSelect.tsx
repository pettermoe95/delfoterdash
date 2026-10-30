import type { ChangeEvent } from 'react';
import type { z } from 'zod';
import { fieldLabel, isRecord, objectSchema, variantValue } from './schema';

type VariantSelectProps = {
    id: string;
    label: string;
    schema: z.ZodDiscriminatedUnion<
        string,
        z.ZodDiscriminatedUnionOption<string>[]
    >;
    value: unknown;
    onChange: (value: unknown) => void;
    path?: string;
};
export function VariantSelect({
    id,
    label,
    schema,
    value,
    onChange,
    path,
}: VariantSelectProps) {
    const record = isRecord(value) ? value : {};
    const selected = record[schema.discriminator];
    const variantName = (option: z.ZodObject<z.ZodRawShape>) =>
        (option.shape[schema.discriminator] as z.ZodLiteral<string>).value;
    const changeVariant = (event: ChangeEvent<HTMLSelectElement>) => {
        const option = schema.options.find(
            (item) => variantName(item) === event.target.value
        );
        const current = objectSchema(schema, value);
        if (option && current) onChange(variantValue(current, option, value));
    };
    const renderOption = (option: z.ZodObject<z.ZodRawShape>) => {
        const name = variantName(option);
        return (
            <option key={name} value={name}>
                {fieldLabel(name)}
            </option>
        );
    };
    return (
        <div className="we-field" data-field-path={path}>
            <label htmlFor={id}>{label}</label>
            <select
                id={id}
                value={typeof selected === 'string' ? selected : ''}
                onChange={changeVariant}
            >
                <option value="" disabled>
                    Select…
                </option>
                {schema.options.map(renderOption)}
            </select>
        </div>
    );
}
