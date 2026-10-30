import { describe, expect, it } from 'vitest';
import { validateDocument } from '../model/validation';
import { convertLegacy } from './convert';

const credentialId = '93fe49fc-bbed-48ea-afd2-dc2ce17025b8';
describe('legacy conversion', () => {
    it('preserves explicit empty GraphQL paths from execution configuration through conversion and parsing', () => {
        const document = convertLegacy(undefined, {
            jobs: [
                {
                    jobId: 'fetch',
                    worker: 'GraphqlFetcher',
                    config: {
                        url: 'https://example.com/graphql',
                        query: '{ edges { node { id } } }',
                        pagingStrategy: {
                            entityPath: [],
                            pageInfoPath: [],
                            edgesPath: [],
                        },
                    },
                },
            ],
        });
        expect(document.jobs[0].config.pagingStrategy).toEqual({
            entityPath: [],
            pageInfoPath: [],
            edgesPath: [],
        });
        expect(validateDocument(document)).toEqual([]);
    });
    it('preserves executable authentication and headers over stale shared-resource values', () => {
        const runtimeAuth = { type: 'BearerHeader', credentialId };
        const document = convertLegacy(
            {
                nodes: [
                    {
                        id: 'fetch',
                        type: 'JsonFetcher',
                        position: { x: 0, y: 0 },
                    },
                    {
                        id: 'credential',
                        type: 'CredentialProvider',
                        position: { x: 0, y: 0 },
                    },
                ],
                edges: [{ source: 'credential', target: 'fetch' }],
                nodeConfigs: {
                    fetch: {},
                    credential: {
                        authentication: {
                            type: 'BasicHeader',
                            credentialId: 'old-credential',
                        },
                        headers: { Authorization: 'old-header' },
                    },
                },
            },
            {
                jobs: [
                    {
                        jobId: 'fetch',
                        worker: 'JsonFetcher',
                        config: {
                            url: 'https://example.com',
                            authentication: runtimeAuth,
                            headers: { 'X-Source': 'runtime' },
                        },
                    },
                ],
            }
        );
        expect(document.jobs[0].config.authentication).toEqual(runtimeAuth);
        expect(document.jobs[0].config.headers).toEqual({
            'X-Source': 'runtime',
        });
    });
    it('retains explicit runtime overrides when old UI values differ', () => {
        const layout = {
            nodes: [
                {
                    id: 'fetch',
                    type: 'JsonFetcher',
                    position: { x: 0, y: 0 },
                },
            ],
            edges: [],
            nodeConfigs: {
                fetch: {
                    url: 'https://example.com/old',
                },
            },
        };
        const document = convertLegacy(layout, {
            jobs: [
                {
                    jobId: 'fetch',
                    worker: 'JsonFetcher',
                    dependencies: [],
                    config: {
                        url: 'https://example.com/current',
                    },
                },
            ],
        });
        expect(document.jobs[0].config.url).toBe('https://example.com/current');
    });
    it('copies connected authentication and databases into each worker without resource dependencies', () => {
        const layout = {
            nodes: [
                'fetch-a',
                'fetch-b',
                'ingest',
                'credential',
                'database',
            ].map((id, index) => ({
                id,
                type:
                    index < 2
                        ? 'JsonFetcher'
                        : index === 2
                          ? 'IngestJob'
                          : index === 3
                            ? 'CredentialProvider'
                            : 'DatabaseConfigProvider',
                position: { x: index * 100, y: 0 },
                data: { label: id },
            })),
            edges: [
                { source: 'credential', target: 'fetch-a', type: 'resource' },
                { source: 'credential', target: 'fetch-b', type: 'resource' },
                { source: 'database', target: 'ingest', type: 'resource' },
                { source: 'fetch-a', target: 'ingest' },
                { source: 'fetch-b', target: 'ingest' },
            ],
            nodeConfigs: {
                'fetch-a': {
                    url: 'https://example.com/a',
                    headers: [{ key: 'Accept', value: 'application/json' }],
                    pagingStrategy: 'offset',
                    offsetPaging: {
                        fromOffsetParam: 'offset',
                        pageSizeParam: 'limit',
                        pageSize: 100,
                        stop: { type: 'whenEmptyRootArray' },
                    },
                    chunkingStrategy: { chunkSize: 1, chunkUnit: 'month' },
                },
                'fetch-b': {
                    url: 'https://example.com/b',
                    pagingStrategy: 'none',
                },
                ingest: {
                    entity: 'sales',
                    databaseConfig: { type: 'brilliantview' },
                },
                credential: {
                    authentication: { type: 'BearerHeader', credentialId },
                    headers: [{ key: 'X-Tenant', value: 'tenant' }],
                },
                database: {
                    type: 'postgres',
                    credentialId,
                    host: 'db.example.com',
                    username: 'worker',
                },
            },
        };
        const document = convertLegacy(layout);
        expect(document.jobs.map((item) => item.id)).toEqual([
            'fetch-a',
            'fetch-b',
            'ingest',
        ]);
        expect(document.jobs[0].config).toMatchObject({
            authentication: { credentialId },
            headers: { Accept: 'application/json', 'X-Tenant': 'tenant' },
            pagingStrategy: { type: 'offset', pageSize: 100 },
            chunkStrategy: { chunkSize: 1 },
        });
        expect(document.jobs[1].config.authentication).toEqual(
            document.jobs[0].config.authentication
        );
        expect(document.jobs[2]).toMatchObject({
            dependencies: ['fetch-a', 'fetch-b'],
            config: { databaseConfig: { type: 'postgres', credentialId } },
        });
        expect(layout.nodeConfigs.ingest.databaseConfig.type).toBe(
            'brilliantview'
        );
    });

    it('preserves unknown execution fields and workers even without layout entries', () => {
        const document = convertLegacy(
            {},
            {
                jobs: [
                    {
                        jobId: 'future',
                        worker: 'FutureWorker',
                        config: { future: { enabled: true } },
                        payload: { custom: 'payload' },
                        dependencies: [],
                    },
                ],
            }
        );
        expect(document.jobs[0]).toMatchObject({
            type: 'FutureWorker',
            config: { future: { enabled: true } },
            execution: { payload: { custom: 'payload' } },
        });
        expect(validateDocument(document)[0].message).toContain(
            'Unsupported worker'
        );
    });

    it('expands reusable templates and refuses missing configuration instead of discarding it', () => {
        const layout = {
            nodes: [{ id: 'a', type: 'JsonFetcher', position: { x: 0, y: 0 } }],
            edges: [],
            nodeConfigs: { a: { credentialTemplateId: 'template' } },
            reusableConfigs: [
                {
                    id: 'template',
                    type: 'credential',
                    config: {
                        authentication: { type: 'BasicHeader', credentialId },
                    },
                },
            ],
        };
        expect(convertLegacy(layout).jobs[0].config).toEqual({
            authentication: { type: 'BasicHeader', credentialId },
        });
        expect(() => convertLegacy({ ...layout, reusableConfigs: [] })).toThrow(
            'Missing shared configuration'
        );
        expect(() => convertLegacy({ nodes: [] })).toThrow();
    });
    it('preserves legacy unset semantics for full ingestion, loader fields, paging defaults and optional lists', () => {
        const configs = {
            ingest: {
                type: 'IngestJob',
                config: {
                    entity: 'sales',
                    ingestType: 'full',
                    dateColumn: 'stale_date',
                    databaseConfig: {
                        type: 'postgres',
                        host: 'db',
                        username: 'etl',
                        credentialId,
                        port: 0,
                        databaseName: '',
                        schema: '',
                    },
                },
            },
            load: {
                type: 'JsonLoader',
                config: {
                    dataProp: '',
                    nestedEntityKey: '',
                    dateKeyColumn: '',
                },
            },
            graphql: {
                type: 'GraphqlFetcher',
                config: {
                    url: 'https://example.com',
                    query: '{ items { id } }',
                    incrementalSettings: { fromParam: '', toParam: '' },
                    pagingStrategy: {
                        cursorVariable: '',
                        pageSizeVariable: '',
                        pageSize: 10,
                        entityPath: ['', ' data ', 'items'],
                        pageInfoPath: [''],
                        edgesPath: [],
                        hasNextPageField: '',
                        cursorField: '',
                    },
                },
            },
            sdmx: {
                type: 'SDMXLoader',
                config: {
                    identityColumns: ['', ' id ', ' '],
                    onlyIncludeKeys: [''],
                    excludeKeys: [],
                    rootJsonPath: '',
                    observationValueColumn: '',
                    inputFormat: '',
                    includeDatasetAttributes: null,
                    seriesKeyPrefix: '',
                },
            },
            fetch: {
                type: 'JsonFetcher',
                config: {
                    url: 'https://example.com',
                    chunkingStrategy: { chunkSize: 0, chunkUnit: 'day' },
                    fromParam: '',
                    toParam: '',
                    dateFormat: '',
                    headers: [{ key: 'X-Empty', value: '' }],
                },
            },
        };
        const layout = {
            nodes: Object.entries(configs).map(([id, worker]) => ({
                id,
                type: worker.type,
                position: { x: 0, y: 0 },
            })),
            edges: [],
            nodeConfigs: Object.fromEntries(
                Object.entries(configs).map(([id, worker]) => [
                    id,
                    worker.config,
                ])
            ),
        };
        const before = JSON.stringify(layout);
        const document = convertLegacy(layout);
        expect(document.jobs[0].config).not.toHaveProperty('dateColumn');
        expect(document.jobs[0].config.databaseConfig).toMatchObject({
            port: 5432,
        });
        expect(document.jobs[0].config.databaseConfig).toHaveProperty(
            'databaseName',
            ''
        );
        expect(document.jobs[0].config.databaseConfig).not.toHaveProperty(
            'schema'
        );
        expect(document.jobs[1].config).toEqual({});
        expect(document.jobs[2].config).not.toHaveProperty('dateFilter');
        expect(document.jobs[2].config.pagingStrategy).toMatchObject({
            entityPath: ['data', 'items'],
            cursorVariable: 'cursor',
            pageSizeVariable: 'first',
            hasNextPageField: 'hasNextPage',
            cursorField: 'cursor',
        });
        expect(document.jobs[2].config.pagingStrategy).not.toHaveProperty(
            'pageInfoPath'
        );
        expect(document.jobs[2].config.pagingStrategy).not.toHaveProperty(
            'edgesPath'
        );
        expect(document.jobs[3].config).toEqual({
            identityColumns: ['id'],
            observationValueColumn: 'value',
            inputFormat: 'auto',
            includeDatasetAttributes: true,
            seriesKeyPrefix: '',
        });
        expect(document.jobs[4].config).toMatchObject({
            chunkStrategy: null,
            headers: { 'X-Empty': '' },
        });
        for (const key of ['fromParam', 'toParam', 'dateFormat'])
            expect(document.jobs[4].config).not.toHaveProperty(key);
        expect(validateDocument(document)).toMatchObject([
            { jobId: 'ingest', path: 'databaseConfig.databaseName' },
        ]);
        expect(JSON.stringify(layout)).toBe(before);
    });
});
