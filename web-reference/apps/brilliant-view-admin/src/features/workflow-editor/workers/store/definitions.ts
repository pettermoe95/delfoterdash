import { z } from 'zod';
import { databaseHints } from '../fieldHints';
import { database, optionalText, publishDatabase, text } from '../shared';
import type { WorkerDefinition } from '../types';

export const ingestSchema = z
    .object({
        entity: text(),
        ingestType: z.enum(['full', 'incremental']).default('full'),
        dateColumn: optionalText(),
        databaseConfig: database,
    })
    .passthrough()
    .superRefine((config, context) => {
        if (config.ingestType === 'incremental' && !config.dateColumn?.trim())
            context.addIssue({
                code: 'custom',
                path: ['dateColumn'],
                message: 'A date column is required for incremental ingestion.',
            });
    })
    .transform((config) => {
        if (config.ingestType === 'incremental') return config;
        const { dateColumn: _dateColumn, ...fullLoad } = config;
        return fullLoad;
    });
const publishFields = {
    entity: text(),
    publishType: z.enum(['full', 'incremental']).default('full'),
    dateColumn: optionalText(),
    databaseConfig: publishDatabase,
};
export const publishSchema = z
    .discriminatedUnion('type', [
        z
            .object({
                type: z.literal('dim'),
                ...publishFields,
                idColumn: text(),
            })
            .passthrough(),
        z
            .object({
                type: z.literal('fact'),
                ...publishFields,
                idColumn: text().nullable().optional(),
            })
            .passthrough(),
    ])
    .superRefine((config, context) => {
        if (config.publishType === 'incremental' && !config.dateColumn?.trim())
            context.addIssue({
                code: 'custom',
                path: ['dateColumn'],
                message:
                    'A date column is required for incremental publication.',
            });
    });
export const vaultSchema = z
    .object({ entity: text(), identity: text() })
    .passthrough();
export type IngestConfig = z.infer<typeof ingestSchema>;
export type PublishConfig = z.infer<typeof publishSchema>;
export const storeWorkers: WorkerDefinition[] = [
    {
        type: 'IngestJob',
        worker: 'IngestWorker',
        name: 'Ingest (Legacy)',
        category: 'Store',
        description:
            'Ingest data into Brilliant View, PostgreSQL or SQL Server.',
        schema: ingestSchema,
        fields: {
            ...databaseHints,
            databaseConfig: { section: 'Database', control: 'database' },
        },
    },
    {
        type: 'PublishWorker',
        worker: 'PublishWorker',
        name: 'Publish',
        category: 'Store',
        description: 'Publish dimensions and facts to a target database.',
        schema: publishSchema,
        fields: {
            ...databaseHints,
            databaseConfig: { section: 'Database', control: 'database' },
        },
    },
    {
        type: 'VaultJob',
        worker: 'VaultWorker',
        name: 'Vault (Legacy)',
        category: 'Model',
        description: 'Store an entity using the legacy vault worker.',
        schema: vaultSchema,
        fields: { identity: { control: 'column' } },
    },
];
