import { z } from 'zod';
import { authenticationHints } from '../fieldHints';
import {
    authentication,
    bounds,
    positiveInt,
    stringMap,
    strings,
    text,
} from '../shared';
import type { WorkerDefinition } from '../types';

export const graphqlSchema = z
    .object({
        url: z.string().url(),
        query: text(),
        authentication,
        headers: stringMap().default({}),
        graphqlVariables: z
            .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
            .default({}),
        pagingStrategy: z
            .object({
                cursorVariable: z.string().default('cursor'),
                pageSizeVariable: z.string().default('first'),
                pageSize: positiveInt().default(100),
                entityPath: strings(),
                pageInfoPath: strings().default(['pageInfo']),
                hasNextPageField: z.string().default('hasNextPage'),
                edgesPath: strings().default(['edges']),
                cursorField: z.string().default('cursor'),
            })
            .passthrough(),
        dateFilter: z
            .object({ fromParam: text(), toParam: text() })
            .passthrough()
            .nullable()
            .optional(),
        incrementalBounds: bounds.nullable().optional(),
    })
    .passthrough();
export type GraphqlConfig = z.infer<typeof graphqlSchema>;
export const graphqlFetcher: WorkerDefinition = {
    type: 'GraphqlFetcher',
    worker: 'GraphqlFetcher',
    name: 'GraphQL Fetcher',
    category: 'Fetch',
    description: 'Fetch a GraphQL connection with cursor pagination.',
    schema: graphqlSchema,
    fields: {
        query: { control: 'code' },
        ...authenticationHints,
        pagingStrategy: { section: 'Pagination' },
        'pagingStrategy.entityPath': { ordered: true },
        'pagingStrategy.pageInfoPath': { ordered: true },
        'pagingStrategy.edgesPath': { ordered: true },
        dateFilter: { section: 'Incremental' },
        incrementalBounds: { section: 'Incremental' },
    },
};
