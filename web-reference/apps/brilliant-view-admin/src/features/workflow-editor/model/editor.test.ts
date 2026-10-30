import { describe, expect, it } from 'vitest';
import { appendJobs, canConnect, renameJob, withDependencies } from './graph';
import { documentSchema, emptyDocument } from './schema';
import type { EditorJob } from './schema';
import { validateDocument } from './validation';

const job = (id: string, dependencies: string[] = []): EditorJob => ({
    id,
    name: id,
    type: 'JsonLoader',
    config: {},
    dependencies,
    position: { x: 0, y: 0 },
    execution: {},
});

describe('graph editing', () => {
    it('keeps Dim input slots synchronized and validates shared columns and disconnected mappings', () => {
        const sources = [
            {
                ...job('a'),
                config: {
                    identityColumns: ['a_id'],
                    onlyIncludeKeys: ['a_id', 'name'],
                },
            },
            {
                ...job('b'),
                config: {
                    identityColumns: ['b_id'],
                    onlyIncludeKeys: ['b_id', 'name'],
                },
            },
        ];
        let dim: EditorJob = {
            ...job('dim'),
            type: 'DimWorkerV2',
            config: {
                entity: 'employees',
                dataConfig: { inputs: [], merging: [], columnPriorities: [] },
            },
        };
        dim = withDependencies(dim, ['a', 'b']);
        expect(dim.config.dataConfig).toMatchObject({
            inputs: [
                { jobId: 'a', identityColumn: '' },
                { jobId: 'b', identityColumn: '' },
            ],
        });
        dim = {
            ...dim,
            config: {
                entity: 'employees',
                dataConfig: {
                    inputs: [
                        { jobId: 'a', identityColumn: 'a_id' },
                        { jobId: 'b', identityColumn: 'b_id' },
                    ],
                    merging: [],
                    columnPriorities: [],
                },
            },
        };
        expect(
            validateDocument({
                ...emptyDocument(),
                jobs: [...sources, dim],
            }).some((issue) => issue.message.includes('shared column "name"'))
        ).toBe(true);
        const data = dim.config.dataConfig as Record<string, unknown>;
        dim = {
            ...dim,
            config: {
                ...dim.config,
                dataConfig: {
                    ...data,
                    columnPriorities: [{ column: 'name', jobIds: ['a', 'b'] }],
                },
            },
        };
        expect(
            validateDocument({ ...emptyDocument(), jobs: [...sources, dim] })
        ).toEqual([]);
        const disconnected = withDependencies(dim, ['a']);
        expect(
            validateDocument({
                ...emptyDocument(),
                jobs: [...sources, disconnected],
            }).some((issue) =>
                issue.message.includes('distinct connected workers')
            )
        ).toBe(true);
    });
    it('supports fan-in and rejects cycles, duplicate edges and dangling connections', () => {
        const jobs = [job('a'), job('b'), job('c', ['a'])];
        expect(canConnect(jobs, 'b', 'c')).toBe(true);
        expect(canConnect(jobs, 'c', 'a')).toBe(false);
        expect(canConnect(jobs, 'a', 'c')).toBe(false);
        expect(canConnect(jobs, 'a', 'a')).toBe(false);
        expect(canConnect(jobs, 'missing', 'c')).toBe(false);
    });
    it.each(['source', 'Source-data_2'])(
        'renames job references to %s without rewriting literal strings in configuration',
        (nextId) => {
            const document = {
                ...emptyDocument(),
                jobs: [
                    job('a'),
                    {
                        ...job('dim', ['a']),
                        type: 'DimWorkerV2',
                        config: {
                            entity: 'a',
                            dataConfig: {
                                inputs: [{ jobId: 'a' }],
                                merging: [{ fromJobId: 'a', toJobId: 'b' }],
                                columnPriorities: [
                                    { column: 'name', jobIds: ['a', 'b'] },
                                ],
                            },
                        },
                    },
                ],
            };
            const renamed = renameJob(document, 'a', `  ${nextId}  `);
            expect(renamed.jobs[0]).toMatchObject({ id: nextId, name: nextId });
            expect(documentSchema.parse(renamed)).toEqual(renamed);
            expect(() => renameJob(renamed, 'dim', ` ${nextId} `)).toThrow(
                'already'
            );
            expect(() => renameJob(document, 'a', '   ')).toThrow('letters');
            expect(renamed.jobs[1]).toMatchObject({
                dependencies: [nextId],
                config: {
                    entity: 'a',
                    dataConfig: {
                        inputs: [{ jobId: nextId }],
                        columnPriorities: [
                            { column: 'name', jobIds: [nextId, 'b'] },
                        ],
                    },
                },
            });
            expect(() => renameJob(document, 'a', 'dim')).toThrow('already');
            expect(() => renameJob(document, 'a', 'bad/name')).toThrow(
                'letters'
            );
        }
    );
    it.each(['Source data', 'Source\tdata', 'Source\ndata'])(
        'rejects renaming a worker to %j without changing references',
        (nextId) => {
            const document = {
                ...emptyDocument(),
                jobs: [job('source'), job('target', ['source'])],
            };
            expect(() => renameJob(document, 'source', nextId)).toThrow(
                'Spaces are not allowed'
            );
            expect(document.jobs[0].id).toBe('source');
            expect(document.jobs[1].dependencies).toEqual(['source']);
        }
    );
    it.each(['Source data', 'Source\tdata', 'Source\ndata', ' source '])(
        'flags existing or imported worker names containing whitespace: %j',
        (id) => {
            const document = { ...emptyDocument(), jobs: [job(id)] };
            expect(documentSchema.safeParse(document).success).toBe(true);
            expect(validateDocument(document)).toContainEqual({
                jobId: id,
                path: 'id',
                message:
                    'Worker names cannot contain spaces or other whitespace.',
            });
            expect(
                validateDocument(renameJob(document, id, 'source-2'))
            ).toEqual([]);
        }
    );
    it('remaps pasted subgraphs and removes external execution dependencies', () => {
        const existing = { ...emptyDocument(), jobs: [job('a')] };
        const incoming = [
            job('a'),
            {
                ...job('dim', ['a', 'external']),
                type: 'DimWorkerV2',
                config: {
                    entity: 'employees',
                    dataConfig: {
                        inputs: [
                            { jobId: 'a', identityColumn: 'id' },
                            {
                                jobId: 'external',
                                identityColumn: 'external_id',
                            },
                        ],
                    },
                },
            },
        ];
        const merged = appendJobs(existing, incoming);
        expect(merged.jobs[1].id).toBe('a-2');
        expect(merged.jobs[2]).toMatchObject({
            dependencies: ['a-2'],
            config: {
                dataConfig: {
                    inputs: [{ jobId: 'a-2', identityColumn: 'id' }],
                },
            },
        });
        expect(validateDocument(merged)).toEqual([]);
        expect(incoming[1].dependencies).toEqual(['a', 'external']);
    });
    it('preserves literal reference-like keys in HTTP, GraphQL and unknown configurations during rename and paste', () => {
        const literal = {
            params: { jobId: 'a' },
            headers: { fromJobId: 'a' },
            graphqlVariables: { toJobId: 'a', jobIds: ['a'] },
            dataConfig: { inputs: [{ jobId: 'a' }] },
        };
        const document = {
            ...emptyDocument(),
            jobs: [
                job('a'),
                ...['JsonFetcher', 'GraphqlFetcher', 'FutureWorker'].map(
                    (type) => ({ ...job(type), type, config: literal })
                ),
                {
                    ...job('dim', ['a']),
                    type: 'DimWorkerV2',
                    config: { ...literal, entity: 'employees' },
                },
            ],
        };
        const renamed = renameJob(document, 'a', 'renamed');
        const pasted = appendJobs(document, document.jobs);
        for (const result of [
            renamed.jobs,
            pasted.jobs.slice(document.jobs.length),
        ]) {
            for (const item of result.slice(1, 4))
                expect(item.config).toBe(literal);
            expect(result[4].config.headers).toEqual(literal.headers);
            expect(result[4].config.graphqlVariables).toEqual(
                literal.graphqlVariables
            );
        }
        expect(renamed.jobs[4].config.dataConfig).toEqual({
            inputs: [{ jobId: 'renamed' }],
        });
        expect(pasted.jobs[9].config.dataConfig).toEqual({
            inputs: [{ jobId: 'a-2' }],
        });
    });
    it('reports every cyclic edge, self edge, duplicate and missing dependency without flagging downstream edges', () => {
        const document = {
            ...emptyDocument(),
            jobs: [
                job('a', ['b']),
                job('b', ['a']),
                job('downstream', ['a']),
                job('self', ['self']),
                job('duplicates', ['downstream', 'downstream']),
                job('missing', ['absent']),
            ],
        };
        const issues = validateDocument(document);
        expect(issues.map((issue) => issue.jobId)).toEqual([
            'a',
            'b',
            'self',
            'duplicates',
            'missing',
        ]);
        expect(issues.every((issue) => issue.path === 'dependencies')).toBe(
            true
        );
    });
});
