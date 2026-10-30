import { z } from 'zod';
import type { WorkerDefinition } from '../types';

// Column names are literal: preserve whitespace while rejecting blank names.
const columnName = () =>
    z.string().refine((value) => value.trim().length > 0, 'Required');

export const transformOperationSchema = z
    .discriminatedUnion('type', [
        z
            .object({
                type: z.literal('renameColumn'),
                originalName: columnName(),
                newName: columnName(),
            })
            .passthrough(),
        z
            .object({
                type: z.literal('trimColumn'),
                columnName: columnName(),
                direction: z.enum(['left', 'right', 'both']).default('both'),
            })
            .passthrough(),
        z
            .object({
                type: z.literal('changeCasing'),
                columnName: columnName(),
                casing: z.enum(['UPPER', 'lower']),
            })
            .passthrough(),
        z
            .object({
                type: z.literal('addStaticValue'),
                columnName: columnName(),
                valueType: z.enum(['text', 'integer', 'decimal', 'date']),
                value: z.string(),
            })
            .passthrough(),
    ])
    .superRefine((operation, context) => {
        if (operation.type !== 'addStaticValue') return;
        const { valueType, value } = operation;
        let message: string | undefined;
        if (
            valueType === 'integer' &&
            (value !== value.trim() ||
                !/^[+-]?\d+$/.test(value) ||
                Number(value) < -2147483648 ||
                Number(value) > 2147483647)
        )
            message = 'Enter a 32-bit integer (-2147483648 to 2147483647).';
        if (
            valueType === 'decimal' &&
            (value !== value.trim() ||
                !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value))
        )
            message = 'Enter a valid decimal.';
        if (
            valueType === 'date' &&
            (value !== value.trim() ||
                !z.string().date().safeParse(value).success)
        )
            message = 'Enter a valid date in YYYY-MM-DD format.';
        if (message)
            context.addIssue({ code: 'custom', path: ['value'], message });
    });

export const transformSchema = z
    .object({ operations: z.array(transformOperationSchema) })
    .passthrough();

export type TransformConfig = z.infer<typeof transformSchema>;

export const transformWorker: WorkerDefinition = {
    type: 'TransformWorker',
    worker: 'TransformWorker',
    name: 'Transform',
    category: 'Model',
    description: 'Rename, trim, change casing and add columns to parquet data.',
    schema: transformSchema,
    validate: (_job, upstream) => {
        if (upstream.length) return [];
        return [
            {
                path: 'dependencies',
                message:
                    'Connect an upstream worker that produces parquet data.',
            },
        ];
    },
    fields: {
        operations: {
            ordered: true,
            help: 'Operations run in order. Later operations can use columns renamed or added above. Connect an input that produces parquet data.',
        },
        'operations.*.originalName': {
            label: 'Original column',
            control: 'column',
        },
        'operations.*.newName': { label: 'New column name' },
        'operations.*.columnName': { label: 'Column name' },
        'operations.*.value': {
            help: 'Enter the value as text, including integers and decimals. Dates use YYYY-MM-DD.',
        },
    },
};
