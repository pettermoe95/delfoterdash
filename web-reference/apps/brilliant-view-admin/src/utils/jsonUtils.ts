import { asRecord } from './typeGuards';

export function isJsonObject(value: unknown): boolean {
    return asRecord(value) !== undefined;
}

export function parseJsonObject(
    json: string
): Record<string, unknown> | undefined {
    try {
        return asRecord(JSON.parse(json) as unknown);
    } catch {
        return undefined;
    }
}
