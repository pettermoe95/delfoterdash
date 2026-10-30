import { isRecord } from '../../forms/schema';

export function syncDimInputs(
    config: Record<string, unknown>,
    dependencies: string[]
): Record<string, unknown> {
    const data = isRecord(config.dataConfig) ? config.dataConfig : {};
    const inputs = Array.isArray(data.inputs)
        ? data.inputs.filter(isRecord)
        : [];
    return {
        ...config,
        dataConfig: {
            ...data,
            inputs: dependencies.map(
                (jobId) =>
                    inputs.find((input) => input.jobId === jobId) ?? {
                        jobId,
                        identityColumn:
                            dependencies.length === 1 &&
                            typeof config.identity === 'string'
                                ? config.identity
                                : '',
                    }
            ),
            merging: data.merging ?? [],
            columnPriorities: data.columnPriorities ?? [],
        },
    };
}
