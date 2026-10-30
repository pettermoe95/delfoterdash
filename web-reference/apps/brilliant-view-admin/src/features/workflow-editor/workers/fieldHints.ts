import type { FieldHint, WorkerDefinition } from './types';

/** Hints match complete paths; * matches one array item or record entry. */
export function getFieldHint(
    fields: WorkerDefinition['fields'],
    path: string | string[]
): FieldHint | undefined {
    const segments = typeof path === 'string' ? path.split('.') : path;
    return Object.entries(fields ?? {}).find(([pattern]) => {
        const parts = pattern.split('.');
        return (
            parts.length === segments.length &&
            parts.every(
                (part, index) => part === '*' || part === segments[index]
            )
        );
    })?.[1];
}

export const authenticationHints = {
    authentication: { section: 'Authentication' },
    'authentication.credentialId': { control: 'credential' },
} satisfies Record<string, FieldHint>;

export const databaseHints = {
    'databaseConfig.credentialId': { control: 'credential' },
} satisfies Record<string, FieldHint>;

export const loaderHints = {
    identityColumns: { ordered: true },
    'identityColumns.*': { control: 'column' },
    'onlyIncludeKeys.*': { control: 'column' },
    'excludeKeys.*': { control: 'column' },
} satisfies Record<string, FieldHint>;

export const relationHints = {
    'relations.*.fromColumn': { control: 'column' },
    'relations.*.toColumn': { control: 'column' },
} satisfies Record<string, FieldHint>;
