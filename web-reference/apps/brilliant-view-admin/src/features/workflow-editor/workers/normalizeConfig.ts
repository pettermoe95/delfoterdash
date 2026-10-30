import { z } from 'zod';
import { initialValue, isRecord, objectSchema, unwrap } from '../forms/schema';

/** Blank optional fields mean unset; literal strings in maps and required fields stay intact. */
export function normalizeConfig(schema: z.ZodTypeAny, value: unknown): unknown {
    const base = unwrap(schema);
    const blank = typeof value === 'string' && !value.trim();
    if (
        (blank || (value === null && !schema.isNullable())) &&
        (base instanceof z.ZodString || base instanceof z.ZodEnum)
    ) {
        if (schema.isOptional()) return initialValue(schema);
        if (schema.isNullable()) return null;
    }
    if (
        value === null &&
        schema instanceof z.ZodDefault &&
        !schema.isNullable()
    )
        return initialValue(schema);
    const object = objectSchema(schema, value);
    if (object && isRecord(value))
        return Object.fromEntries(
            Object.entries(value).flatMap(([key, entry]) => {
                const field = Object.hasOwn(object.shape, key)
                    ? object.shape[key]
                    : undefined;
                const next = field ? normalizeConfig(field, entry) : entry;
                return next === undefined ? [] : [[key, next]];
            })
        );
    if (base instanceof z.ZodArray && Array.isArray(value))
        return value.map((entry: unknown) =>
            normalizeConfig(base.element as z.ZodTypeAny, entry)
        );
    if (base instanceof z.ZodRecord && isRecord(value))
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [
                key,
                normalizeConfig(base.valueSchema as z.ZodTypeAny, entry),
            ])
        );
    return value;
}
