import { z } from 'zod';
import { authenticationHints } from '../fieldHints';
import {
    authentication,
    bounds,
    optionalText,
    positiveInt,
    stringMap,
    text,
} from '../shared';
import type { WorkerDefinition } from '../types';

const stop = z.discriminatedUnion('type', [
    z.object({ type: z.literal('whenEmptyRootArray') }).passthrough(),
    z
        .object({ type: z.literal('whenEmptyResultProp'), resultProp: text() })
        .passthrough(),
    z
        .object({
            type: z.literal('totalCountWithCountProp'),
            totalCountProp: text(),
            countProp: text(),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('totalCountWithResultProp'),
            totalCountProp: text(),
            resultProp: text(),
        })
        .passthrough(),
]);
const paging = z.discriminatedUnion('type', [
    z
        .object({
            type: z.literal('link'),
            headerName: z.string().default('Link'),
            rel: z.string().default('next'),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('offset'),
            fromOffsetParam: text(),
            pageSizeParam: text(),
            pageSize: positiveInt(),
            stop,
        })
        .passthrough(),
    z
        .object({
            type: z.literal('page'),
            pageParam: text(),
            startPageNum: z.number().int().nonnegative().default(1),
            pageSize: z
                .object({ pageSizeProp: text(), pageSize: positiveInt() })
                .passthrough()
                .nullable()
                .optional(),
            resultSize: z.discriminatedUnion('type', [
                z
                    .object({
                        type: z.literal('resultSizeFromDataProp'),
                        dataProp: optionalText(),
                    })
                    .passthrough(),
                z
                    .object({
                        type: z.literal('resultSizeFromHeader'),
                        resultSizeHeader: text(),
                    })
                    .passthrough(),
            ]),
            totalCount: z.discriminatedUnion('type', [
                z
                    .object({
                        type: z.literal('totalCountFromHeader'),
                        totalCountHeader: text(),
                    })
                    .passthrough(),
                z
                    .object({
                        type: z.literal('totalCountFromDataProp'),
                        prop: text(),
                    })
                    .passthrough(),
            ]),
        })
        .passthrough(),
]);
export const jsonFetcherSchema = z
    .object({
        url: z.string().url(),
        method: z.enum(['GET', 'POST']).default('GET'),
        authentication,
        headers: stringMap().default({}),
        params: stringMap().default({}),
        pagingStrategy: paging.nullable().optional(),
        chunkStrategy: z
            .object({
                chunkSize: positiveInt(),
                chunkUnit: z.enum(['day', 'month']),
            })
            .passthrough()
            .nullable()
            .optional(),
        incrementalStrategy: z
            .discriminatedUnion('type', [
                z
                    .object({
                        type: z.literal('paramRange'),
                        fromParam: optionalText(),
                        toParam: optionalText(),
                        dateFormat: optionalText(),
                    })
                    .passthrough(),
                z
                    .object({
                        type: z.literal('queryTemplate'),
                        queryParams: z
                            .array(
                                z
                                    .object({
                                        paramName: text(),
                                        template: text(),
                                    })
                                    .passthrough()
                            )
                            .min(1),
                    })
                    .passthrough(),
            ])
            .nullable()
            .optional(),
        incrementalBounds: bounds.nullable().optional(),
        fromParam: optionalText(),
        toParam: optionalText(),
        dateFormat: optionalText(),
    })
    .passthrough()
    .superRefine((config, context) => {
        if (config.pagingStrategy && config.chunkStrategy)
            context.addIssue({
                code: 'custom',
                path: ['chunkStrategy'],
                message:
                    'Choose pagination or chunking; they cannot be combined.',
            });
        if (config.incrementalStrategy?.type !== 'queryTemplate') return;
        const names = new Set<string>();
        config.incrementalStrategy.queryParams.forEach((param, index) => {
            if (names.has(param.paramName))
                context.addIssue({
                    code: 'custom',
                    path: [
                        'incrementalStrategy',
                        'queryParams',
                        index,
                        'paramName',
                    ],
                    message: 'Query parameter names must be unique.',
                });
            names.add(param.paramName);
        });
    });
export type JsonFetcherConfig = z.infer<typeof jsonFetcherSchema>;
export const jsonFetcher: WorkerDefinition = {
    type: 'JsonFetcher',
    worker: 'JsonFetcher',
    name: 'JSON Fetcher',
    category: 'Fetch',
    description:
        'Fetch JSON over HTTP with authentication, pagination and incremental ranges.',
    schema: jsonFetcherSchema,
    onConfigChange: (config, previous) => {
        if (!previous)
            return {
                ...config,
                headers: { 'Content-Type': 'application/json' },
            };
        if (config.pagingStrategy && !previous.pagingStrategy)
            return { ...config, chunkStrategy: undefined };
        if (config.chunkStrategy && !previous.chunkStrategy)
            return { ...config, pagingStrategy: undefined };
        return config;
    },
    fields: {
        ...authenticationHints,
        pagingStrategy: { section: 'Pagination' },
        incrementalStrategy: { section: 'Incremental' },
        incrementalBounds: { section: 'Incremental' },
        chunkStrategy: { section: 'Incremental' },
        fromParam: { section: 'Incremental' },
        toParam: { section: 'Incremental' },
        dateFormat: { section: 'Incremental' },
    },
};
