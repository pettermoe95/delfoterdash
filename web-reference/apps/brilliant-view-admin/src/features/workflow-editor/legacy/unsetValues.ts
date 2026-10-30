import { isRecord } from '../forms/schema';

/** Legacy serializers omitted inactive settings and filtered optional path/list rows. */
export function normalizeLegacyUnsetValues(
    type: string,
    config: Record<string, unknown>,
    executionConfig?: Record<string, unknown>
) {
    if (type === 'IngestJob' && config.ingestType !== 'incremental')
        delete config.dateColumn;
    const database = config.databaseConfig;
    if (
        isRecord(database) &&
        (database.type === 'postgres' || database.type === 'mssql') &&
        (typeof database.port !== 'number' ||
            !Number.isInteger(database.port) ||
            database.port <= 0)
    )
        config.databaseConfig = {
            ...database,
            port: database.type === 'postgres' ? 5432 : 1433,
        };
    const listContainer =
        type === 'GraphqlFetcher' && isRecord(config.pagingStrategy)
            ? { ...config.pagingStrategy }
            : type === 'SDMXLoader'
              ? config
              : undefined;
    if (type === 'GraphqlFetcher' && listContainer)
        config.pagingStrategy = listContainer;
    if (listContainer) {
        const fields =
            type === 'GraphqlFetcher'
                ? ['entityPath', 'pageInfoPath', 'edgesPath']
                : ['identityColumns', 'excludeKeys', 'onlyIncludeKeys'];
        for (const key of fields) {
            const value = listContainer[key];
            if (!Array.isArray(value)) continue;
            // Empty UI rows used defaults; an explicit saved execution path selects the current object.
            if (
                type === 'GraphqlFetcher' &&
                value.length === 0 &&
                isRecord(executionConfig?.pagingStrategy) &&
                Array.isArray(executionConfig.pagingStrategy[key]) &&
                executionConfig.pagingStrategy[key].length === 0
            )
                continue;
            const strings = value.filter(
                (entry): entry is string => typeof entry === 'string'
            );
            if (strings.length !== value.length) continue;
            const filtered = strings
                .map((entry) => entry.trim())
                .filter(Boolean);
            if (filtered.length) listContainer[key] = filtered;
            else delete listContainer[key];
        }
    }
    return config;
}
