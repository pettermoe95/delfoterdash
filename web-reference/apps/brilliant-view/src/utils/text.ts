export function toText(value: unknown, fallback = ''): string {
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : fallback;
}
