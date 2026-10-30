/** Fail immediately when a test fixture or rendered element is missing. */
export function required<T>(value: T | null | undefined): T {
    if (value === null || value === undefined)
        throw new Error('Expected a test value to be present.');
    return value;
}
