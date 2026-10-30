import { z } from 'zod';

export function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
    if (
        schema instanceof z.ZodOptional ||
        schema instanceof z.ZodNullable ||
        schema instanceof z.ZodDefault
    )
        return unwrap(schema._def.innerType as z.ZodTypeAny);
    if (schema instanceof z.ZodEffects)
        return unwrap(schema.innerType() as z.ZodTypeAny);
    return schema;
}

export function isScalarSchema(schema: z.ZodTypeAny): boolean {
    const base = unwrap(schema);
    if (base instanceof z.ZodUnion)
        return (base.options as z.ZodTypeAny[]).every(isScalarSchema);
    return (
        base instanceof z.ZodString ||
        base instanceof z.ZodNumber ||
        base instanceof z.ZodBoolean ||
        base instanceof z.ZodEnum ||
        base instanceof z.ZodLiteral ||
        base instanceof z.ZodNull
    );
}

// Drafts may be incomplete. Defaults initialize controls; only validation uses parse().
export function initialValue(schema: z.ZodTypeAny): unknown {
    if (schema instanceof z.ZodDefault) return schema._def.defaultValue();
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable)
        return undefined;
    const base = unwrap(schema);
    if (base instanceof z.ZodObject)
        return Object.fromEntries(
            Object.entries(base.shape as z.ZodRawShape)
                .map(([key, field]) => [key, initialValue(field)])
                .filter(([, value]) => value !== undefined)
        );
    if (base instanceof z.ZodDiscriminatedUnion || base instanceof z.ZodUnion)
        return initialValue((base.options as z.ZodTypeAny[])[0]);
    if (base instanceof z.ZodEnum) return (base.options as string[])[0];
    if (base instanceof z.ZodLiteral) return base.value;
    if (base instanceof z.ZodArray) return [];
    if (base instanceof z.ZodRecord) return {};
    if (base instanceof z.ZodBoolean) return false;
    if (base instanceof z.ZodNumber) return 0;
    if (base instanceof z.ZodNull) return null;
    return '';
}
export function configuredValue(schema: z.ZodTypeAny): unknown {
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable)
        return configuredValue(schema._def.innerType as z.ZodTypeAny);
    return initialValue(schema);
}

export function objectSchema(
    schema: z.ZodTypeAny,
    value: unknown
): z.ZodObject<z.ZodRawShape> | undefined {
    const base = unwrap(schema);
    if (base instanceof z.ZodObject) return base as z.ZodObject<z.ZodRawShape>;
    if (base instanceof z.ZodDiscriminatedUnion) {
        const union = base as z.ZodDiscriminatedUnion<
            string,
            z.ZodDiscriminatedUnionOption<string>[]
        >;
        const discriminator = isRecord(value)
            ? value[union.discriminator]
            : undefined;
        return (
            union.options.find(
                (option) =>
                    option.shape[union.discriminator].safeParse(discriminator)
                        .success
            ) ?? union.options[0]
        );
    }
    return undefined;
}
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Keep common draft fields and unknown extensions when a configuration changes variant. */
export function variantValue(
    previous: z.ZodObject<z.ZodRawShape>,
    next: z.ZodObject<z.ZodRawShape>,
    value: unknown
): Record<string, unknown> {
    const retained = isRecord(value) ? { ...value } : {};
    for (const key of Object.keys(previous.shape))
        if (!(key in next.shape)) delete retained[key];
    const result = {
        ...(initialValue(next) as Record<string, unknown>),
        ...retained,
    };
    for (const [key, field] of Object.entries(next.shape)) {
        const base = unwrap(field);
        if (base instanceof z.ZodLiteral) result[key] = base.value;
    }
    return result;
}
export const fieldLabel = (key: string) =>
    key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/^./, (char) => char.toUpperCase());
