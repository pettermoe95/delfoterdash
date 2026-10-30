import { describe, expect, it } from 'vitest';
import { initialValue } from '../forms/schema';
import { required } from '../test/required';
import { graphqlSchema } from './fetch/graphql';
import { jsonFetcher } from './fetch/json';
import { jsonLoaderSchema } from './load/definitions';
import { dimV2Schema } from './model/definitions';
import { workers } from './registry';
import { ingestSchema } from './store/definitions';

const configs: Record<string, unknown> = {
    JsonFetcher: {
        url: 'https://example.com',
        pagingStrategy: {
            type: 'offset',
            fromOffsetParam: 'offset',
            pageSizeParam: 'limit',
            pageSize: 100,
            stop: { type: 'whenEmptyRootArray' },
        },
    },
    GraphqlFetcher: {
        url: 'https://example.com/graphql',
        query: '{ data { id } }',
        pagingStrategy: { pageSize: 100, entityPath: ['data', 'items'] },
        graphqlVariables: { active: true, page: 1, cursor: null },
    },
    SoapFetcher: {
        url: 'https://example.com/soap',
        requestBody: '<Envelope />',
        pagingStrategy: {
            type: 'pageWithCookie',
            itemsXPath: '//items',
            cookieXPath: '//cookie',
            stop: { type: 'hasMore', xpath: '//hasMore' },
        },
    },
    JsonLoader: {
        identityColumns: ['id'],
        coerceTypes: { amount: 'decimal(38,4)' },
    },
    SDMXLoader: { inputFormat: 'xml' },
    TransformWorker: {
        operations: [
            {
                type: 'renameColumn',
                originalName: 'employee_name',
                newName: 'name',
            },
            { type: 'trimColumn', columnName: 'name', direction: 'both' },
            { type: 'changeCasing', columnName: 'name', casing: 'UPPER' },
            {
                type: 'addStaticValue',
                columnName: 'source',
                valueType: 'text',
                value: 'HR',
            },
        ],
    },
    DimWorkerV2: {
        entity: 'employees',
        dataConfig: {
            inputs: [{ jobId: 'load', identityColumn: 'id' }],
            scd2Columns: ['name', 'department'],
        },
    },
    DimJob: {
        entity: 'employees',
        relations: [
            {
                toEntity: 'department',
                fromColumn: 'department_id',
                toColumn: 'id',
            },
        ],
    },
    FactJob: { entity: 'sales', dateKeyCol: 'day' },
    IngestJob: {
        entity: 'sales',
        ingestType: 'full',
        databaseConfig: { type: 'brilliantview' },
    },
    PublishWorker: {
        type: 'dim',
        entity: 'employees',
        idColumn: 'dbId',
        publishType: 'full',
    },
    VaultJob: { entity: 'employees', identity: 'id' },
};
describe('worker contracts', () => {
    it('defaults SCD2 columns for older Dim V2 configs and rejects blank column names', () => {
        const config = {
            entity: 'employees',
            dataConfig: { inputs: [{ jobId: 'load', identityColumn: 'id' }] },
        };
        expect(dimV2Schema.parse(config).dataConfig.scd2Columns).toEqual([]);
        for (const scd2Columns of [[''], ['   '], [42]]) {
            const result = dimV2Schema.safeParse({
                ...config,
                dataConfig: { ...config.dataConfig, scd2Columns },
            });
            expect(result.success).toBe(false);
        }
    });
    it('supports root GraphQL paths and omits unused JSON Loader controls without losing saved fields', () => {
        expect(
            graphqlSchema.parse({
                ...(configs.GraphqlFetcher as object),
                pagingStrategy: {
                    entityPath: [],
                    pageInfoPath: [],
                    edgesPath: [],
                },
            }).pagingStrategy
        ).toMatchObject({ entityPath: [], pageInfoPath: [], edgesPath: [] });
        expect(jsonLoaderSchema.shape).not.toHaveProperty('outputPath');
        expect(jsonLoaderSchema.shape).not.toHaveProperty('sourceEntity');
        expect(
            jsonLoaderSchema.parse({
                outputPath: '/legacy',
                sourceEntity: 'legacy',
            })
        ).toMatchObject({ outputPath: '/legacy', sourceEntity: 'legacy' });
    });
    it('omits the Ingest date column for full loads and still requires it for incremental loads', () => {
        const config = { entity: 'sales', dateColumn: 'created_at' };
        expect(ingestSchema.parse(config)).not.toHaveProperty('dateColumn');
        expect(
            ingestSchema.parse({ ...config, ingestType: 'incremental' })
        ).toHaveProperty('dateColumn', 'created_at');
        expect(
            ingestSchema.safeParse({
                entity: 'sales',
                ingestType: 'incremental',
            }).success
        ).toBe(false);
    });
    it('rejects duplicate query parameter names at the duplicate field', () => {
        const queryParams = [
            { paramName: 'date', template: '{from}' },
            { paramName: ' date ', template: '{to}' },
        ];
        const config = {
            url: 'https://example.com',
            incrementalStrategy: { type: 'queryTemplate', queryParams },
        };
        const result = jsonFetcher.schema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    path: [
                        'incrementalStrategy',
                        'queryParams',
                        1,
                        'paramName',
                    ],
                })
            );
        expect(
            jsonFetcher.schema.safeParse({
                ...config,
                incrementalStrategy: {
                    ...config.incrementalStrategy,
                    queryParams: [
                        queryParams[0],
                        { ...queryParams[1], paramName: 'end' },
                    ],
                },
            }).success
        ).toBe(true);
    });
    it('switches between pagination and chunking and rejects saved configurations with both', () => {
        const chunked = {
            url: 'https://example.com',
            chunkStrategy: { chunkSize: 1, chunkUnit: 'day' },
        };
        const pagingStrategy = { type: 'link' };
        const both = { ...chunked, pagingStrategy };
        expect(jsonFetcher.schema.safeParse(both).success).toBe(false);
        const paged = required(jsonFetcher.onConfigChange)(both, chunked);
        expect(paged.chunkStrategy).toBeUndefined();
        expect(jsonFetcher.schema.safeParse(paged).success).toBe(true);
        const switched = required(jsonFetcher.onConfigChange)(
            { ...paged, chunkStrategy: chunked.chunkStrategy },
            paged
        );
        expect(switched.pagingStrategy).toBeUndefined();
        expect(jsonFetcher.schema.safeParse(switched).success).toBe(true);
    });
    it('allows only GET and POST for JSON Fetcher and defaults to GET', () => {
        const config = { url: 'https://example.com' };
        expect(jsonFetcher.schema.parse(config)).toMatchObject({
            method: 'GET',
        });
        for (const method of ['GET', 'POST'])
            expect(
                jsonFetcher.schema.safeParse({ ...config, method }).success
            ).toBe(true);
        for (const method of ['PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
            expect(
                jsonFetcher.schema.safeParse({ ...config, method }).success
            ).toBe(false);
    });
    it('initializes JSON Content-Type on creation and preserves later header edits or removal', () => {
        const initial = initialValue(jsonFetcher.schema) as Record<
            string,
            unknown
        >;
        const created = required(jsonFetcher.onConfigChange)(initial);
        expect(created.headers).toEqual({ 'Content-Type': 'application/json' });
        const custom = {
            ...created,
            headers: { 'Content-Type': 'application/custom+json' },
        };
        expect(required(jsonFetcher.onConfigChange)(custom, created)).toBe(
            custom
        );
        const removed = { ...created, headers: {} };
        expect(required(jsonFetcher.onConfigChange)(removed, created)).toBe(
            removed
        );
    });
    it.each(workers)(
        '$name supports its wire configuration and preserves future fields',
        (worker) => {
            const config = configs[worker.type];
            expect(config).toBeDefined();
            const parsed = worker.schema.parse({
                ...(config as object),
                futureField: { enabled: true },
            });
            expect(parsed).toMatchObject({ futureField: { enabled: true } });
        }
    );
    it('validates paging sizes, authentication IDs, database ports and publish identities', () => {
        const schema = (type: string) =>
            required(workers.find((worker) => worker.type === type)).schema;
        expect(
            schema('JsonFetcher').safeParse({ url: 'invalid' }).success
        ).toBe(false);
        expect(
            schema('JsonFetcher').safeParse({
                url: 'https://example.com',
                authentication: {
                    type: 'BearerHeader',
                    credentialId: 'bad-id',
                },
            }).success
        ).toBe(false);
        expect(
            schema('GraphqlFetcher').safeParse({
                ...(configs.GraphqlFetcher as object),
                pagingStrategy: { pageSize: 0, entityPath: ['data'] },
            }).success
        ).toBe(false);
        expect(
            schema('IngestJob').safeParse({
                entity: 'sales',
                ingestType: 'full',
                databaseConfig: {
                    type: 'postgres',
                    host: 'db',
                    username: 'worker',
                    credentialId: '93fe49fc-bbed-48ea-afd2-dc2ce17025b8',
                    port: -1,
                },
            }).success
        ).toBe(false);
        expect(
            schema('PublishWorker').safeParse({
                type: 'dim',
                entity: 'employees',
                idColumn: '',
            }).success
        ).toBe(false);
    });
});
