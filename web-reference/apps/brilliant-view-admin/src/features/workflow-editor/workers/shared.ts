import { z } from 'zod';

export const text = () => z.string().trim().min(1, 'Required');
export const optionalText = () => z.string().nullable().optional();
export const strings = () => z.array(text());
export const stringMap = () => z.record(z.string());
export const positiveInt = () => z.number().int().positive();
export const bounds = z
    .object({
        from: z.enum(['inclusive', 'exclusive']).default('inclusive'),
        to: z.enum(['inclusive', 'exclusive']).default('inclusive'),
    })
    .passthrough();
export const authentication = z
    .object({
        type: z.enum(['BasicHeader', 'BearerHeader', 'TokenHeader']),
        credentialId: z.string().uuid(),
    })
    .passthrough()
    .nullable()
    .optional();
const externalDatabase = {
    credentialId: z.string().uuid(),
    host: text(),
    username: text(),
    port: positiveInt().max(65535).optional(),
    databaseName: text(),
    schema: text().optional(),
    useSSL: z.boolean().default(true),
};
const brilliantViewDatabase = z
    .object({ type: z.literal('brilliantview') })
    .passthrough();
const postgresDatabase = z
    .object({ type: z.literal('postgres'), ...externalDatabase })
    .passthrough();
const mssqlDatabase = z
    .object({ type: z.literal('mssql'), ...externalDatabase })
    .passthrough();
export const database = z
    .discriminatedUnion('type', [
        brilliantViewDatabase,
        postgresDatabase,
        mssqlDatabase,
    ])
    .default({ type: 'brilliantview' });
const publishMssqlDatabase = mssqlDatabase.extend({
    trustServerCertificate: z.boolean().default(false),
});
export const sharedDatabase = z.discriminatedUnion('type', [
    postgresDatabase,
    publishMssqlDatabase,
]);
export const publishDatabase = z
    .discriminatedUnion('type', [
        brilliantViewDatabase,
        postgresDatabase,
        publishMssqlDatabase,
    ])
    .default({ type: 'brilliantview' });
export const relations = z
    .array(
        z
            .object({ toEntity: text(), fromColumn: text(), toColumn: text() })
            .passthrough()
    )
    .nullable()
    .optional();
export const loaderFields = {
    identityColumns: strings().nullable().optional(),
    excludeKeys: strings().nullable().optional(),
    onlyIncludeKeys: strings().nullable().optional(),
    coerceTypes: stringMap().nullable().optional(),
};
