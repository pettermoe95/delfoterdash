import type { KeyValuePair } from '@bv/api';

export type CredentialFormSeed = {
    flowId: string;
    name?: string;
    configuration?: Record<string, string>;
};

export type CredentialPairState = {
    configurationPairs: KeyValuePair[];
    secretPairs: KeyValuePair[];
};

export function buildKeyValuePairs(
    record?: Record<string, string> | null
): KeyValuePair[] {
    const entries = Object.entries(record ?? {});
    return entries.map(([key, value]) => ({ key, value }));
}

export function pairsToRecord(pairs: KeyValuePair[]): Record<string, string> {
    return Object.fromEntries(
        pairs
            .map((pair) => ({
                key: pair.key.trim(),
                value: pair.value,
            }))
            .filter((pair) => pair.key.length > 0)
            .map((pair) => [pair.key, pair.value])
    );
}
