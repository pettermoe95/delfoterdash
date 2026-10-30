import { isRecord } from '../forms/schema';

function mapValue(value: unknown): unknown {
    if (!Array.isArray(value)) return value;
    return Object.fromEntries(
        value.filter(isRecord).map((pair) => [String(pair.key), pair.value])
    );
}

/** Translate UI-only legacy fields into the worker's wire contract. */
export function convertConfig(
    type: string,
    input: Record<string, unknown>
): Record<string, unknown> {
    const config = { ...input };
    delete config.credentialTemplateId;
    delete config.ingestorConfigTemplateId;
    for (const key of [
        'headers',
        'params',
        'graphqlVariables',
        'keysFromParent',
        'coerceTypes',
        'seriesFilter',
    ]) {
        if (key in config) config[key] = mapValue(config[key]);
    }
    if (type === 'JsonFetcher') {
        if (typeof config.pagingStrategy === 'string') {
            const strategy = config.pagingStrategy;
            const paging =
                strategy === 'offset'
                    ? config.offsetPaging
                    : strategy === 'page'
                      ? config.pagePaging
                      : config.linkPagination;
            config.pagingStrategy =
                strategy === 'none'
                    ? null
                    : { ...(isRecord(paging) ? paging : {}), type: strategy };
        }
        if (config.chunkingStrategy && config.chunkStrategy === undefined) {
            const chunk = config.chunkingStrategy;
            config.chunkStrategy =
                isRecord(chunk) &&
                typeof chunk.chunkSize === 'number' &&
                Number.isInteger(chunk.chunkSize) &&
                chunk.chunkSize > 0 &&
                (chunk.chunkUnit === 'day' || chunk.chunkUnit === 'month')
                    ? chunk
                    : null;
        }
        if (
            config.incrementalStrategy === undefined &&
            (config.fromParam || config.toParam || config.dateFormat)
        )
            config.incrementalStrategy = {
                type: 'paramRange',
                fromParam: config.fromParam,
                toParam: config.toParam,
                dateFormat: config.dateFormat,
            };
        for (const key of [
            'offsetPaging',
            'pagePaging',
            'linkPagination',
            'chunkingStrategy',
        ])
            delete config[key];
    }
    if (type === 'GraphqlFetcher') {
        if (
            isRecord(config.incrementalSettings) &&
            config.dateFilter === undefined
        ) {
            const { fromParam, toParam } = config.incrementalSettings;
            if (fromParam && toParam)
                config.dateFilter = config.incrementalSettings;
        }
        delete config.incrementalSettings;
    }
    return config;
}

export function mergeResource(
    base: Record<string, unknown>,
    resource: Record<string, unknown>
): Record<string, unknown> {
    const merged = { ...base };
    for (const [key, value] of Object.entries(resource)) {
        merged[key] =
            key !== 'databaseConfig' && isRecord(value) && isRecord(merged[key])
                ? { ...merged[key], ...value }
                : value;
    }
    return merged;
}
