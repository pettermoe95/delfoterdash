import { z } from 'zod';
import { authenticationHints } from '../fieldHints';
import {
    bounds,
    optionalText,
    positiveInt,
    stringMap,
    strings,
    text,
} from '../shared';
import type { WorkerDefinition } from '../types';
import { syncSoapHeaders } from './soapHeaders';

const xpath = { xpath: text() };
const stop = z.discriminatedUnion('type', [
    z.object({ type: z.literal('whenEmpty') }).passthrough(),
    z.object({ type: z.literal('hasMore'), ...xpath }).passthrough(),
    z.object({ type: z.literal('done'), ...xpath }).passthrough(),
    z
        .object({
            type: z.literal('status'),
            ...xpath,
            moreValues: strings().min(1),
            doneValues: strings().min(1),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('totalPages'),
            ...xpath,
            firstPageNum: z.number().int().default(1),
        })
        .passthrough(),
    z.object({ type: z.literal('totalRecords'), ...xpath }).passthrough(),
]);
const pageFields = {
    pageSizeParam: z.string().default('pageSize'),
    pageSize: positiveInt().default(100),
    itemsXPath: text(),
    stop: stop.default({ type: 'whenEmpty' }),
    namespaces: stringMap().default({}),
    maxPages: positiveInt().default(10000),
    subsequentRequest: z
        .object({ requestBody: optionalText(), soapAction: optionalText() })
        .passthrough()
        .nullable()
        .optional(),
};
const paging = z.discriminatedUnion('type', [
    z
        .object({
            type: z.literal('page'),
            ...pageFields,
            pageParam: z.string().default('page'),
            startPageNum: z.number().int().default(1),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('offset'),
            ...pageFields,
            fromOffsetParam: z.string().default('offset'),
            startOffset: z.number().int().nonnegative().default(0),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('cursor'),
            ...pageFields,
            cursorVariable: z.string().default('cursor'),
            initialCursor: z.string().default(''),
            nextCursorXPath: text(),
        })
        .passthrough(),
    z
        .object({
            type: z.literal('pageWithCookie'),
            ...pageFields,
            pageParam: z.string().default('page'),
            startPageNum: z.number().int().default(1),
            cookieVariable: z.string().default('cookie'),
            initialCookie: z.string().default(''),
            cookieXPath: text(),
        })
        .passthrough(),
]);
const authFields = { credentialId: z.string().uuid() };
export const soapSchema = z
    .object({
        url: z.string().url(),
        requestBody: text(),
        soapVersion: z.enum(['1.1', '1.2']).default('1.1'),
        soapAction: optionalText(),
        authentication: z
            .discriminatedUnion('type', [
                z
                    .object({ type: z.literal('BasicHeader'), ...authFields })
                    .passthrough(),
                z
                    .object({ type: z.literal('BearerHeader'), ...authFields })
                    .passthrough(),
                z
                    .object({ type: z.literal('TokenHeader'), ...authFields })
                    .passthrough(),
                z
                    .object({
                        type: z.literal('SessionCookie'),
                        ...authFields,
                        cookieName: z.string().default('ASP.NET_SessionId'),
                    })
                    .passthrough(),
            ])
            .nullable()
            .optional(),
        headers: stringMap().default({}),
        credentialVariables: z
            .record(z.object(authFields).passthrough())
            .default({}),
        fromParam: optionalText(),
        toParam: optionalText(),
        dateFormat: optionalText(),
        pagingStrategy: paging.nullable().optional(),
        incrementalBounds: bounds.nullable().optional(),
        responseExtraction: z
            .object({
                ...xpath,
                format: z.enum(['xml', 'embeddedXml', 'text']).default('xml'),
                namespaces: stringMap().default({}),
            })
            .passthrough()
            .nullable()
            .optional(),
    })
    .passthrough();
export type SoapConfig = z.infer<typeof soapSchema>;
export const soapFetcher: WorkerDefinition = {
    type: 'SoapFetcher',
    worker: 'SoapFetcher',
    name: 'SOAP Fetcher',
    category: 'Fetch',
    description:
        'Fetch SOAP XML with request templates, extraction and pagination.',
    schema: soapSchema,
    onConfigChange: syncSoapHeaders,
    fields: {
        requestBody: { control: 'code' },
        'pagingStrategy.subsequentRequest.requestBody': { control: 'code' },
        ...authenticationHints,
        credentialVariables: { section: 'Authentication' },
        'credentialVariables.*.credentialId': { control: 'credential' },
        pagingStrategy: { section: 'Pagination' },
        responseExtraction: { section: 'Response' },
        fromParam: { section: 'Incremental' },
        toParam: { section: 'Incremental' },
        dateFormat: { section: 'Incremental' },
        incrementalBounds: { section: 'Incremental' },
    },
};
