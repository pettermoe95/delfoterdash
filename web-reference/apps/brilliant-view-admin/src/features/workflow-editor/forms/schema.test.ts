import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { required } from '../test/required';
import { database } from '../workers/shared';
import {
    configuredValue,
    initialValue,
    objectSchema,
    variantValue,
} from './schema';

describe('schema form values', () => {
    it('uses configured defaults when enabling optional controls', () => {
        expect(configuredValue(z.boolean().default(true).optional())).toBe(
            true
        );
        expect(configuredValue(z.number().default(100).nullable())).toBe(100);
        expect(
            initialValue(
                z.object({
                    required: z.string(),
                    optional: z.string().optional(),
                    tls: z.boolean().default(true),
                })
            )
        ).toEqual({ required: '', tls: true });
    });
    it('preserves common database settings and future fields when switching variants', () => {
        const value = {
            type: 'postgres',
            credentialId: 'credential',
            host: 'db.example.com',
            username: 'worker',
            databaseName: 'analytics',
            useSSL: true,
            custom: 'extension',
        };
        const switched = variantValue(
            required(objectSchema(database, value)),
            required(objectSchema(database, { type: 'mssql' })),
            value
        );
        expect(switched).toEqual({ ...value, type: 'mssql' });
        expect(
            variantValue(
                required(objectSchema(database, switched)),
                required(objectSchema(database, { type: 'brilliantview' })),
                switched
            )
        ).toEqual({ type: 'brilliantview', custom: 'extension' });
    });
});
