import { useId } from 'react';
import { z } from 'zod';
import { getFieldHint } from '../workers/fieldHints';
import { Field } from './Field';
import type { FormEnvironment } from './Field';
import { fieldLabel, isRecord, unwrap } from './schema';
import { VariantSelect } from './VariantSelect';

type ObjectFieldsProps = {
    schema: z.ZodTypeAny;
    object: z.ZodObject<z.ZodRawShape>;
    value: unknown;
    onChange: (value: unknown) => void;
    environment: FormEnvironment;
    pathPrefix?: string;
    hintPrefix?: string;
    section?: string;
    exclude?: string[];
};

/** Render object properties consistently at the root and inside nested fields. */
export function ObjectFields({
    schema,
    object,
    value,
    onChange,
    environment,
    pathPrefix = '',
    hintPrefix = pathPrefix,
    section,
    exclude = [],
}: ObjectFieldsProps) {
    const id = useId();
    const record = isRecord(value) ? value : {};
    const base = unwrap(schema);
    const pathFor = (key: string) =>
        pathPrefix ? `${pathPrefix}.${key}` : key;
    const changeProperty = (key: string, next: unknown) => {
        const updated = { ...record };
        if (next === undefined) delete updated[key];
        else updated[key] = next;
        onChange(updated);
    };
    const renderProperty = ([key, child]: [string, z.ZodTypeAny]) => (
        <Field
            key={key}
            schema={child}
            value={record[key]}
            path={pathFor(key)}
            hintPath={hintPrefix ? `${hintPrefix}.${key}` : key}
            onChange={(next) => changeProperty(key, next)}
            environment={environment}
        />
    );
    const properties = Object.entries(object.shape).filter(
        ([key]) =>
            !exclude.includes(key) &&
            (!section ||
                (getFieldHint(
                    environment.hints,
                    hintPrefix ? `${hintPrefix}.${key}` : key
                )?.section ?? 'Configuration') === section)
    );
    return (
        <>
            {base instanceof z.ZodDiscriminatedUnion &&
                (!section || section === 'Configuration') && (
                    <VariantSelect
                        id={`${id}-type`}
                        path={pathFor(base.discriminator as string)}
                        label={fieldLabel(base.discriminator as string)}
                        schema={base}
                        value={value}
                        onChange={onChange}
                    />
                )}
            {properties.map(renderProperty)}
        </>
    );
}
