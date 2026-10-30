import { expect, it, vi } from 'vitest';
import { buildRequest, importDocument } from '../api/persistence';
import { createHistory, historyReducer } from '../state/history';
import { required } from '../test/required';
import { sharedDatabase } from '../workers/shared';
import {
    bindDatabase,
    createDatabaseConnection,
    deleteDatabaseConnection,
    detachDatabase,
    promoteDatabase,
    resolvedConfig,
} from './databaseConnections';
import { appendJobs } from './graph';
import { documentSchema, emptyDocument } from './schema';
import type { EditorJob, WorkflowDocument } from './schema';
import { validateDocument } from './validation';

vi.mock('~/api/service', () => ({ apiService: {} }));

const database = {
    type: 'postgres',
    host: 'warehouse',
    username: 'worker',
    databaseName: 'analytics',
    credentialId: '33333333-3333-4333-8333-333333333333',
    futureField: { enabled: true },
};
const job = (id: string, type = 'IngestJob'): EditorJob => ({
    id,
    name: id,
    type,
    config: {
        entity: 'employees',
        databaseConfig: database,
        ...(type === 'PublishWorker' ? { type: 'dim', idColumn: 'id' } : {}),
    },
    dependencies: [],
    position: { x: 0, y: 0 },
    execution: {},
});
const sharedDocument = (): WorkflowDocument => ({
    ...emptyDocument(),
    databaseConnections: [
        { id: 'warehouse', name: 'Warehouse', config: database },
    ],
    jobs: [
        bindDatabase(job('ingest'), 'warehouse'),
        bindDatabase(job('publish', 'PublishWorker'), 'warehouse'),
    ],
});

it('creates external shared connections while keeping Brilliant View available inline', () => {
    const connection = createDatabaseConnection(emptyDocument(), 'Warehouse');
    expect(connection.config).toMatchObject({ type: 'postgres', useSSL: true });
    expect(sharedDatabase.safeParse(database).success).toBe(true);
    expect(
        sharedDatabase.safeParse({ ...database, type: 'mssql' }).success
    ).toBe(true);
    expect(sharedDatabase.safeParse({ type: 'brilliantview' }).success).toBe(
        false
    );
    const inline = {
        ...emptyDocument(),
        jobs: [
            {
                ...job('ingest'),
                config: {
                    entity: 'employees',
                    databaseConfig: { type: 'brilliantview' },
                },
            },
        ],
    };
    expect(validateDocument(inline)).toEqual([]);
    expect(() => promoteDatabase(inline, 'ingest')).toThrow(
        'Select PostgreSQL or SQL Server'
    );
});

it('round-trips connection references and expands current settings into every runtime worker', () => {
    const document = sharedDocument();
    const request = buildRequest(document);
    expect(importDocument(JSON.parse(request.layout))).toEqual(document);
    const runtime = JSON.parse(request.configuration) as {
        databaseConnections?: unknown;
        jobs: {
            databaseConnectionId?: unknown;
            config: { databaseConfig: unknown };
        }[];
    };
    expect(runtime.databaseConnections).toBeUndefined();
    for (const worker of runtime.jobs) {
        expect(worker.databaseConnectionId).toBeUndefined();
        expect(worker.config.databaseConfig).toMatchObject(database);
    }
    const edited = {
        ...document,
        databaseConnections: [
            {
                ...required(document.databaseConnections)[0],
                config: { ...database, host: 'new-host' },
            },
        ],
    };
    const editedRuntime = JSON.parse(
        buildRequest(edited).configuration
    ) as typeof runtime;
    for (const worker of editedRuntime.jobs)
        expect(worker.config.databaseConfig).toMatchObject({
            host: 'new-host',
        });
    expect(
        documentSchema.parse(emptyDocument()).databaseConnections
    ).toBeUndefined();
});

it('promotes existing settings in one undo step, protects used connections, and detaches an independent copy', () => {
    const document = { ...emptyDocument(), jobs: [job('ingest')] };
    const promoted = promoteDatabase(document, 'ingest');
    const connection = required(promoted.databaseConnections)[0];
    expect(connection.config).toEqual(database);
    expect(promoted.jobs[0].config.databaseConfig).toBeUndefined();
    const history = historyReducer(createHistory(document), {
        type: 'edit',
        update: () => promoted,
    });
    expect(historyReducer(history, { type: 'undo' }).present).toEqual(document);
    expect(() => deleteDatabaseConnection(promoted, connection.id)).toThrow(
        'Detach or reassign'
    );
    const detached = detachDatabase(promoted, promoted.jobs[0]);
    expect(detached.databaseConnectionId).toBeUndefined();
    expect(detached.config.databaseConfig).toEqual(database);
    const edited = {
        ...promoted,
        jobs: [detached],
        databaseConnections: [
            { ...connection, config: { ...database, host: 'changed' } },
        ],
    };
    expect(resolvedConfig(edited, detached).databaseConfig).toEqual(database);
    expect(
        deleteDatabaseConnection(edited, connection.id).databaseConnections
    ).toEqual([]);
});

it('reports missing connections and invalid shared drafts without silently using the built-in database', () => {
    const document = sharedDocument();
    const missing = { ...document, databaseConnections: [] };
    expect(validateDocument(missing)).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                jobId: 'ingest',
                path: 'databaseConfig',
            }),
        ])
    );
    expect(() => buildRequest(missing)).toThrow(
        'connection for ingest is missing'
    );
    const invalid = {
        ...document,
        databaseConnections: [
            { id: 'warehouse', name: '', config: { ...database, host: '' } },
        ],
    };
    const issues = validateDocument(invalid);
    expect(issues).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                connectionId: 'warehouse',
                path: 'name',
            }),
            expect.objectContaining({
                jobId: 'publish',
                connectionId: 'warehouse',
                path: 'databaseConfig.host',
            }),
        ])
    );
    expect(importDocument(JSON.parse(buildRequest(invalid).layout))).toEqual(
        invalid
    );
    expect(() =>
        documentSchema.parse({
            ...document,
            databaseConnections: [
                ...required(document.databaseConnections),
                ...required(document.databaseConnections),
            ],
        })
    ).toThrow('Duplicate database connection ID');
    const duplicates = {
        ...document,
        databaseConnections: [
            ...required(document.databaseConnections),
            { id: 'other', name: ' warehouse ', config: database },
        ],
    };
    expect(validateDocument(duplicates)).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ connectionId: 'other', path: 'name' }),
        ])
    );
});

it('copies referenced connections, reuses identical ones and remaps collisions during import', () => {
    const source = sharedDocument();
    const copied = appendJobs(source, source.jobs, source.databaseConnections);
    expect(copied.databaseConnections).toHaveLength(1);
    expect(copied.jobs[2].databaseConnectionId).toBe('warehouse');
    const target = {
        ...emptyDocument(),
        databaseConnections: [
            {
                id: 'warehouse',
                name: 'Warehouse',
                config: { ...database, host: 'other' },
            },
        ],
    };
    const imported = appendJobs(target, source.jobs, [
        ...required(source.databaseConnections),
        { id: 'unused', name: 'Unused', config: {} },
    ]);
    expect(imported.databaseConnections).toHaveLength(2);
    expect(required(imported.databaseConnections)[1].name).toBe('Warehouse 2');
    expect(imported.jobs[0].databaseConnectionId).not.toBe('warehouse');
    expect(imported.jobs[1].databaseConnectionId).toBe(
        imported.jobs[0].databaseConnectionId
    );
    expect(resolvedConfig(imported, imported.jobs[0]).databaseConfig).toEqual(
        database
    );
    expect(() => appendJobs(target, source.jobs)).toThrow(
        'missing database connection'
    );
});
