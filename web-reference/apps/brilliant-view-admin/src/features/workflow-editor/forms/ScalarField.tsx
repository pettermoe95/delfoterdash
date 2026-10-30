import type { ChangeEvent } from 'react';
import { z } from 'zod';
import type { FieldHint } from '../workers/types';
import type { FormEnvironment } from './Field';
import { ReferenceSelect } from './ReferenceSelect';
import { fieldLabel } from './schema';

type ScalarFieldProps = {
    id: string;
    base: z.ZodTypeAny;
    value: unknown;
    hint?: FieldHint;
    onChange: (value: unknown) => void;
    environment: FormEnvironment;
};
export function ScalarField({
    id,
    base,
    value,
    hint,
    onChange,
    environment,
}: ScalarFieldProps) {
    let control;
    const changeValue = (event: ChangeEvent<HTMLInputElement>) =>
        onChange(
            base instanceof z.ZodNumber
                ? event.target.value === ''
                    ? undefined
                    : Number(event.target.value)
                : event.target.value
        );
    if (base instanceof z.ZodNull) control = <small>null</small>;
    else if (base instanceof z.ZodBoolean)
        control = (
            <input
                id={id}
                type="checkbox"
                checked={value === true}
                onChange={(event) => onChange(event.target.checked)}
            />
        );
    else if (base instanceof z.ZodEnum)
        control = (
            <select
                id={id}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="" disabled>
                    Select…
                </option>
                {(base.options as string[]).map((option) => (
                    <option key={option} value={option}>
                        {fieldLabel(option)}
                    </option>
                ))}
            </select>
        );
    else if (hint?.control === 'credential')
        control = (
            <ReferenceSelect
                id={id}
                value={value}
                onChange={onChange}
                placeholder="Select credential…"
                missingLabel="unavailable"
                options={(environment.credentials ?? []).map((item) => ({
                    id: item.id,
                    name: `${item.name} · ${item.flow_name}`,
                }))}
            />
        );
    else if (hint?.reference === 'job')
        control = (
            <ReferenceSelect
                id={id}
                value={value}
                onChange={onChange}
                placeholder="Select connected worker…"
                missingLabel="disconnected"
                options={environment.upstream ?? []}
            />
        );
    else if (hint?.control === 'code')
        control = (
            <textarea
                id={id}
                rows={8}
                spellCheck={false}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    else
        control = (
            <>
                <input
                    id={id}
                    type={base instanceof z.ZodNumber ? 'number' : 'text'}
                    step="any"
                    list={
                        hint?.control === 'column' &&
                        environment.columns?.length
                            ? `${id}-columns`
                            : undefined
                    }
                    value={
                        typeof value === 'string' || typeof value === 'number'
                            ? value
                            : ''
                    }
                    onChange={changeValue}
                />
                {hint?.control === 'column' && environment.columns?.length ? (
                    <datalist id={`${id}-columns`}>
                        {environment.columns.map((column) => (
                            <option key={column} value={column} />
                        ))}
                    </datalist>
                ) : null}
            </>
        );
    return control;
}
