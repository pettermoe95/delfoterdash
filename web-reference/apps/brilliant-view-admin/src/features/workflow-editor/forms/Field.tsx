import type { FocusEvent } from 'react';
import { useId, useState } from 'react';
import { z } from 'zod';
import { getFieldHint } from '../workers/fieldHints';
import type { FieldHint } from '../workers/types';
import { CollectionField } from './CollectionField';
import { ObjectFields } from './ObjectFields';
import { ScalarField } from './ScalarField';
import {
    configuredValue,
    fieldLabel,
    initialValue,
    objectSchema,
    unwrap,
} from './schema';
import { UnionField } from './UnionField';

export type FormEnvironment = {
    hints?: Partial<Record<string, FieldHint>>;
    credentials?: { id: string; name: string; flow_name: string }[];
    upstream?: { id: string; name: string }[];
    columns?: string[];
    errors?: { path: string; message: string }[];
};
type FieldProps = {
    schema: z.ZodTypeAny;
    value: unknown;
    path: string;
    hintPath?: string;
    label?: string;
    showClear?: boolean;
    onChange: (value: unknown) => void;
    environment: FormEnvironment;
};
export function Field({
    schema,
    value,
    path,
    hintPath = path,
    label,
    showClear = true,
    onChange,
    environment,
}: FieldProps) {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const base = unwrap(schema);
    const fieldKey = path.split('.').at(-1) ?? '';
    const hint = getFieldHint(environment.hints, hintPath);
    const title = label ?? hint?.label ?? fieldLabel(fieldKey);
    const error = environment.errors
        ?.filter((issue) => issue.path === path)
        .map((issue) => issue.message)
        .join(' ');
    // A null union variant is a value, not an unconfigured optional field.
    const optional =
        schema.isOptional() ||
        (!(base instanceof z.ZodUnion) && schema.isNullable());
    const renderChild = (
        child: z.ZodTypeAny,
        entry: unknown,
        key: string,
        change: (value: unknown) => void
    ) => (
        <Field
            schema={child}
            value={entry}
            label={
                objectSchema(child, entry)
                    ? ''
                    : base instanceof z.ZodArray
                      ? 'Value'
                      : undefined
            }
            path={`${path}.${key}`}
            hintPath={`${hintPath}.*`}
            showClear={false}
            onChange={change}
            environment={environment}
        />
    );
    const object = objectSchema(schema, value);
    const explicitNull =
        value === null &&
        (base instanceof z.ZodUnion || base instanceof z.ZodNull) &&
        base.safeParse(null).success;
    if (base instanceof z.ZodLiteral) return null;
    if (optional && value == null && !explicitNull && !focused)
        return (
            <div className="we-field" data-field-path={path}>
                <div className="we-row">
                    <span>
                        {title} <small>Optional</small>
                    </span>
                    <button
                        type="button"
                        onClick={() =>
                            onChange(
                                configuredValue(schema) ?? initialValue(base)
                            )
                        }
                    >
                        Configure
                    </button>
                </div>
                {hint?.help && <small>{hint.help}</small>}
            </div>
        );
    let control;
    if (object) {
        control = (
            <div className="we-object">
                <ObjectFields
                    schema={schema}
                    object={object}
                    value={value}
                    onChange={onChange}
                    environment={environment}
                    pathPrefix={path}
                    hintPrefix={hintPath}
                />
            </div>
        );
    } else if (base instanceof z.ZodArray || base instanceof z.ZodRecord) {
        control = (
            <CollectionField
                schema={base}
                value={value}
                ordered={hint?.ordered}
                onChange={onChange}
                render={renderChild}
            />
        );
    } else if (base instanceof z.ZodUnion) {
        const renderOption = (option: z.ZodTypeAny) => (
            <Field
                schema={option}
                value={value}
                path={path}
                hintPath={hintPath}
                label="Value"
                showClear={showClear}
                onChange={onChange}
                environment={environment}
            />
        );
        control = (
            <UnionField
                schema={base}
                value={value}
                label={title}
                onChange={onChange}
                render={renderOption}
            />
        );
    } else
        control = (
            <ScalarField
                id={id}
                base={base}
                value={value}
                hint={hint}
                onChange={onChange}
                environment={environment}
            />
        );
    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (event.target.id !== id) return;
        setFocused(false);
        if (
            optional &&
            (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement) &&
            event.target.type !== 'checkbox' &&
            event.target.value === ''
        )
            onChange(undefined);
    };
    return (
        <div
            className={
                base instanceof z.ZodBoolean
                    ? 'we-field we-field-checkbox'
                    : 'we-field'
            }
            data-field-path={path}
            onFocusCapture={(event) => {
                if (event.target.id === id) setFocused(true);
            }}
            onBlurCapture={handleBlur}
        >
            {title && (
                <div className="we-row">
                    <label htmlFor={id}>{title}</label>
                    {optional && showClear && (
                        <button
                            type="button"
                            className="we-subtle"
                            onClick={() => {
                                setFocused(false);
                                onChange(undefined);
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}
            {control}
            {hint?.help && <small>{hint.help}</small>}
            {error && (
                <small role="alert" className="we-error">
                    {error}
                </small>
            )}
        </div>
    );
}
