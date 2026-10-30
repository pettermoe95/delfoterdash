import { isRecord } from '../../forms/schema';

/** Suggestions from configured columns; runtime-only columns remain valid input. */
export function configuredColumns(config: Record<string, unknown>): string[] {
    const list = (value: unknown): string[] =>
        Array.isArray(value)
            ? value.filter((item): item is string => typeof item === 'string')
            : [];
    const columns = [
        ...list(config.identityColumns),
        ...list(config.onlyIncludeKeys),
        ...Object.keys(isRecord(config.coerceTypes) ? config.coerceTypes : {}),
        ...Object.keys(
            isRecord(config.keysFromParent) ? config.keysFromParent : {}
        ),
        config.dateKeyColumn,
        config.observationValueColumn,
        config.observationTimeColumn,
        config.observationDimensionIdColumn,
    ].filter(
        (value): value is string => typeof value === 'string' && !!value.trim()
    );
    const excluded = new Set(list(config.excludeKeys));
    return [...new Set(columns)]
        .filter((column) => !excluded.has(column))
        .sort();
}
