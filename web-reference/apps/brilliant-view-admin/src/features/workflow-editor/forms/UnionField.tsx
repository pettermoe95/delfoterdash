import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import type { z } from 'zod';
import { initialValue, unwrap } from './schema';

type UnionFieldProps = {
    schema: z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>;
    value: unknown;
    label: string;
    onChange: (value: unknown) => void;
    render: (schema: z.ZodTypeAny) => ReactNode;
};
export function UnionField({
    schema,
    value,
    label,
    onChange,
    render,
}: UnionFieldProps) {
    const matching = schema.options.findIndex(
        (option) => option.safeParse(value).success
    );
    const [index, setIndex] = useState(Math.max(0, matching));
    useEffect(() => {
        // An empty numeric draft has no matching variant. Keep the user's chosen type.
        if (matching >= 0) setIndex(matching);
    }, [matching]);
    const chooseType = (event: ChangeEvent<HTMLSelectElement>) => {
        const selected = Number(event.target.value);
        setIndex(selected);
        onChange(initialValue(schema.options[selected]));
    };
    return (
        <div className="we-union">
            <select
                aria-label={`${label} value type`}
                value={index}
                onChange={chooseType}
            >
                {schema.options.map((option, i) => (
                    <option key={i} value={i}>
                        {(
                            unwrap(option)._def as { typeName: string }
                        ).typeName.replace('Zod', '')}
                    </option>
                ))}
            </select>
            {render(schema.options[index])}
        </div>
    );
}
