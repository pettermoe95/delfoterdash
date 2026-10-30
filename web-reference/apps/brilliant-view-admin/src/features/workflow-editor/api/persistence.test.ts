import { describe, expect, it, vi } from 'vitest';
import { emptyDocument } from '../model/schema';
import { validateDocument } from '../model/validation';
import {
    buildRequest,
    configurationNeedsRepair,
    importDocument,
    loadDocument,
} from './persistence';
import type { WorkflowDetails } from './persistence';

vi.mock('~/api/service', () => ({ apiService: {} }));

const details: WorkflowDetails = {
    id: 'workflow',
    tenant_id: 'tenant',
    name: 'Workflow',
    enabled: false,
    configuration: '{}',
    layout: '{}',
    incremental_settings: '{"type":"fullLoad"}',
    scheduling_meta: '{"type":"specificTime","time":"12:00"}',
};
describe('workflow persistence', () => {
    it.each([undefined, [], ['name', 'department']])(
        'round-trips Dim V2 SCD2 columns (%j) in the layout and execution config',
        (scd2Columns) => {
            const document = {
                ...emptyDocument(),
                jobs: [
                    {
                        id: 'load',
                        name: 'Load',
                        type: 'JsonLoader',
                        config: {},
                        dependencies: [],
                        execution: {},
                        position: { x: 0, y: 0 },
                    },
                    {
                        id: 'dim',
                        name: 'Dim',
                        type: 'DimWorkerV2',
                        config: {
                            entity: 'employees',
                            dataConfig: {
                                inputs: [
                                    { jobId: 'load', identityColumn: 'id' },
                                ],
                                ...(scd2Columns === undefined
                                    ? {}
                                    : { scd2Columns }),
                            },
                        },
                        dependencies: ['load'],
                        execution: {},
                        position: { x: 200, y: 0 },
                    },
                ],
            };
            const request = buildRequest(document);
            const configuration = JSON.parse(request.configuration) as {
                jobs: unknown[];
            };
            expect(configuration.jobs[1]).toMatchObject({
                worker: 'DimWorkerV2',
                config: { dataConfig: { scd2Columns: scd2Columns ?? [] } },
            });
            expect(loadDocument({ ...details, ...request })).toEqual(document);
        }
    );
    it('omits unregistered workers from execution while preserving the editor layout', () => {
        const document = {
            ...emptyDocument(),
            jobs: ['UnknownWorker', 'JsonLoader'].map((type) => ({
                id: type,
                name: type,
                type,
                config: {},
                dependencies: [],
                position: { x: 0, y: 0 },
                execution: {},
            })),
        };
        const request = buildRequest(document);
        const configuration = JSON.parse(request.configuration) as {
            jobs: unknown[];
        };
        expect(configuration.jobs).toEqual([
            expect.objectContaining({
                jobId: 'JsonLoader',
                worker: 'JsonLoader',
            }),
        ]);
        expect(loadDocument({ ...details, ...request })).toEqual(document);
        const unknownOnly = JSON.parse(
            buildRequest({
                ...document,
                jobs: [document.jobs[0]],
            }).configuration
        ) as { jobs: unknown[] };
        expect(unknownOnly.jobs).toEqual([]);
    });
    it('opens a newly created workflow with the scheduler defaults', () => {
        expect(loadDocument(details)).toMatchObject({
            version: 2,
            jobs: [],
            scheduling: { type: 'specificTime', time: '12:00' },
        });
    });
    it('round-trips V2 drafts and converts legacy range field names', () => {
        const document = {
            ...emptyDocument(),
            scheduling: { type: 'interval' },
        };
        const request = buildRequest(
            document as ReturnType<typeof emptyDocument>
        );
        expect(JSON.parse(request.scheduling_meta)).toEqual(
            emptyDocument().scheduling
        );
        expect(loadDocument({ ...details, ...request })).toEqual(document);
        const legacy = loadDocument({
            ...details,
            incremental_settings:
                '{"type":"rollingWindow","unit":"year","amountForward":1,"amountBackward":2}',
        });
        expect(legacy.incremental).toEqual({
            type: 'rollingWindow',
            unit: 'year',
            amount_forward: 1,
            amount_backward: 2,
        });
    });
    it('serializes validated wire values, dependencies and preserved execution fields', () => {
        const document = {
            ...emptyDocument(),
            jobs: [
                {
                    id: 'publish',
                    name: 'Publish',
                    type: 'PublishWorker',
                    position: { x: 1, y: 2 },
                    dependencies: ['dim'],
                    execution: { payload: { dataPath: '/data.parquet' } },
                    config: {
                        type: 'dim',
                        entity: ' employees ',
                        idColumn: ' id ',
                        custom: { enabled: true },
                    },
                },
            ],
        };
        const request = buildRequest(document);
        const configuration = JSON.parse(request.configuration) as {
            jobs: unknown[];
        };
        expect(configuration.jobs[0]).toMatchObject({
            jobId: 'publish',
            worker: 'PublishWorker',
            dependencies: ['dim'],
            payload: { dataPath: '/data.parquet' },
            config: {
                entity: 'employees',
                idColumn: 'id',
                publishType: 'full',
                custom: { enabled: true },
            },
        });
        expect(importDocument(JSON.parse(request.layout))).toEqual(document);
    });
    it('rejects corrupt, duplicate-ID and unsupported-version documents', () => {
        expect(() => importDocument({ version: 3, jobs: [] })).toThrow();
        expect(() =>
            importDocument({ ...emptyDocument(), jobs: [{ id: 'a' }] })
        ).toThrow();
        const job = {
            id: 'a',
            name: 'a',
            type: 'JsonLoader',
            config: {},
            dependencies: [],
            position: { x: 0, y: 0 },
        };
        expect(() =>
            importDocument({ ...emptyDocument(), jobs: [job, job] })
        ).toThrow('Duplicate worker ID');
    });
    it('omits blank optional fields recursively while preserving meaningful empty strings and invalid required values', () => {
        const configs = [
            {
                type: 'IngestJob',
                config: { entity: 'sales', ingestType: 'full', dateColumn: '' },
            },
            {
                type: 'JsonLoader',
                config: {
                    dataProp: '',
                    nestedEntityKey: '',
                    dateKeyColumn: '',
                    future: '',
                    headers: { optional: '' },
                },
            },
            {
                type: 'JsonFetcher',
                config: {
                    url: 'https://example.com',
                    headers: { Accept: '' },
                    params: { q: '' },
                    incrementalStrategy: {
                        type: 'paramRange',
                        fromParam: '',
                        toParam: 'end',
                        dateFormat: '',
                    },
                    pagingStrategy: {
                        type: 'page',
                        pageParam: 'page',
                        resultSize: {
                            type: 'resultSizeFromDataProp',
                            dataProp: '',
                        },
                        totalCount: {
                            type: 'totalCountFromHeader',
                            totalCountHeader: 'X-Total',
                        },
                    },
                },
            },
            {
                type: 'SDMXLoader',
                config: {
                    rootJsonPath: '',
                    inputFormat: '',
                    observationValueColumn: '',
                    seriesKeyPrefix: '',
                    includeDatasetAttributes: null,
                    includeSeriesAttributes: false,
                },
            },
        ];
        const document = {
            ...emptyDocument(),
            jobs: configs.map(({ type, config }) => ({
                id: type,
                name: type,
                type,
                config,
                position: { x: 0, y: 0 },
                dependencies: [],
                execution: {},
            })),
        };
        expect(validateDocument(document)).toEqual([]);
        const request = buildRequest(document);
        const runtime = JSON.parse(request.configuration) as {
            jobs: { config: Record<string, unknown> }[];
        };
        expect(runtime.jobs[0].config).not.toHaveProperty('dateColumn');
        expect(runtime.jobs[1].config).toMatchObject({
            future: '',
            headers: { optional: '' },
        });
        for (const key of ['dataProp', 'nestedEntityKey', 'dateKeyColumn'])
            expect(runtime.jobs[1].config).not.toHaveProperty(key);
        expect(runtime.jobs[2].config).toMatchObject({
            headers: { Accept: '' },
            params: { q: '' },
            incrementalStrategy: { type: 'paramRange', toParam: 'end' },
            pagingStrategy: { resultSize: { type: 'resultSizeFromDataProp' } },
        });
        expect(runtime.jobs[2].config.incrementalStrategy).not.toHaveProperty(
            'fromParam'
        );
        expect(runtime.jobs[2].config.incrementalStrategy).not.toHaveProperty(
            'dateFormat'
        );
        expect(runtime.jobs[2].config.pagingStrategy).not.toHaveProperty(
            'resultSize.dataProp'
        );
        expect(runtime.jobs[3].config).toMatchObject({
            inputFormat: 'auto',
            observationValueColumn: 'value',
            seriesKeyPrefix: '',
            includeDatasetAttributes: true,
            includeSeriesAttributes: false,
        });
        expect(runtime.jobs[3].config).not.toHaveProperty('rootJsonPath');
        // Saving clears unset optional fields without changing the active draft or literals.
        expect(importDocument(JSON.parse(request.layout))).toEqual(
            importDocument(document)
        );
        expect(document.jobs[0].config).toHaveProperty('dateColumn', '');
        const invalid = {
            ...document,
            jobs: [
                {
                    ...document.jobs[0],
                    config: {
                        entity: '',
                        ingestType: 'incremental',
                        dateColumn: '',
                    },
                },
            ],
        };
        expect(validateDocument(invalid).map((issue) => issue.path)).toEqual(
            expect.arrayContaining(['entity', 'dateColumn'])
        );
    });
    it('repairs already converted documents and shared databases and identifies unsafe saved execution', () => {
        const document = {
            ...emptyDocument(),
            databaseConnections: [
                {
                    id: 'db',
                    name: 'Warehouse',
                    config: {
                        type: 'postgres',
                        host: 'db',
                        username: 'etl',
                        credentialId: '33333333-3333-4333-8333-333333333333',
                        databaseName: '',
                        schema: null,
                    },
                },
            ],
            jobs: [
                {
                    id: 'ingest',
                    name: 'Ingest',
                    type: 'IngestJob',
                    config: { entity: 'sales', dateColumn: '' },
                    databaseConnectionId: 'db',
                    dependencies: [],
                    position: { x: 0, y: 0 },
                    execution: {},
                },
            ],
        };
        const stored = {
            ...details,
            layout: JSON.stringify(document),
            configuration: JSON.stringify({
                jobs: [
                    {
                        jobId: 'ingest',
                        worker: 'IngestWorker',
                        config: { entity: 'sales', dateColumn: '' },
                    },
                ],
            }),
        };
        const loaded = loadDocument(stored);
        expect(loaded.jobs[0].config).not.toHaveProperty('dateColumn');
        expect(loaded.databaseConnections?.[0].config).toHaveProperty(
            'databaseName',
            ''
        );
        expect(validateDocument(loaded)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    connectionId: 'db',
                    path: 'databaseConfig.databaseName',
                }),
            ])
        );
        expect(loaded.databaseConnections?.[0].config).not.toHaveProperty(
            'schema'
        );
        expect(importDocument(document)).toEqual(loaded);
        expect(configurationNeedsRepair(stored.configuration)).toBe(true);
        const request = buildRequest(loaded);
        expect(configurationNeedsRepair(request.configuration)).toBe(false);
        expect(loadDocument({ ...stored, ...request })).toEqual(loaded);
    });
});
