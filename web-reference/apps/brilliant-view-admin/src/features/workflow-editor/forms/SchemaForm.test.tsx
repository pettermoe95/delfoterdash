// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { z } from 'zod';
import { required } from '../test/required';
import { jsonFetcher } from '../workers/fetch/json';
import { soapFetcher } from '../workers/fetch/soap';
import { workerByType } from '../workers/registry';
import { SchemaForm } from './SchemaForm';

it('uses explicit full-path metadata for selectors while leaving literal record entries editable', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const container = document.createElement('div');
    const root = createRoot(container);
    const field = (path: string) =>
        required(
            Array.from(
                container.querySelectorAll<HTMLElement>('[data-field-path]')
            ).find((item) => item.dataset.fieldPath === path)
        );
    const dim = required(workerByType('DimWorkerV2'));
    try {
        act(() => {
            root.render(
                <>
                    <SchemaForm
                        schema={jsonFetcher.schema}
                        value={{
                            url: '',
                            headers: { credentialId: 'literal' },
                            params: { jobId: 'literal' },
                            authentication: {
                                type: 'BearerHeader',
                                credentialId: 'missing',
                            },
                        }}
                        onChange={vi.fn()}
                        environment={{ hints: jsonFetcher.fields }}
                    />
                    <SchemaForm
                        schema={soapFetcher.schema}
                        value={{
                            requestBody: '',
                            credentialVariables: {
                                'session.token': { credentialId: 'missing' },
                            },
                            pagingStrategy: {
                                type: 'page',
                                subsequentRequest: { requestBody: '<xml />' },
                            },
                        }}
                        onChange={vi.fn()}
                        environment={{ hints: soapFetcher.fields }}
                    />
                    <SchemaForm
                        schema={dim.schema}
                        value={{
                            dataConfig: {
                                inputs: [
                                    { jobId: 'source', identityColumn: 'id' },
                                ],
                                columnPriorities: [
                                    { column: 'name', jobIds: ['source'] },
                                ],
                                scd2Columns: ['employee name'],
                            },
                        }}
                        onChange={vi.fn()}
                        environment={{
                            hints: dim.fields,
                            upstream: [{ id: 'source', name: 'Source' }],
                            columns: ['id'],
                        }}
                    />
                    <SchemaForm
                        schema={z.object({
                            external: z.record(z.string()),
                            customSource: z.string(),
                        })}
                        value={{
                            external: {
                                jobId: 'literal',
                                credentialId: 'literal',
                                query: 'literal',
                            },
                            customSource: 'source',
                        }}
                        onChange={vi.fn()}
                        environment={{
                            hints: { customSource: { reference: 'job' } },
                        }}
                    />
                </>
            );
        });
        for (const path of [
            'headers.credentialId',
            'params.jobId',
            'external.jobId',
            'external.credentialId',
            'external.query',
        ])
            expect(field(path).querySelector('input')?.value).toBe('literal');
        for (const path of [
            'authentication.credentialId',
            'credentialVariables.session.token.credentialId',
            'dataConfig.inputs.0.jobId',
            'dataConfig.columnPriorities.0.jobIds.0',
            'customSource',
        ])
            expect(field(path).querySelector('select')).not.toBeNull();
        expect(
            field('dataConfig.inputs.0.identityColumn')
                .querySelector('input')
                ?.getAttribute('list')
        ).toBeTruthy();
        const scd2Column = required(
            field('dataConfig.scd2Columns.0').querySelector('input')
        );
        expect(scd2Column.value).toBe('employee name');
        const scd2Suggestions = required(
            field('dataConfig.scd2Columns.0').querySelector('datalist')
        );
        expect(scd2Column.getAttribute('list')).toBe(scd2Suggestions.id);
        expect(scd2Suggestions.options[0].value).toBe('id');
        expect(
            field('pagingStrategy.subsequentRequest.requestBody').querySelector(
                'textarea'
            )?.value
        ).toBe('<xml />');
    } finally {
        act(() => {
            root.unmount();
        });
    }
});

it.each([false, true])(
    'preserves unknown fields when changing %s nested variants through the shared object renderer',
    (nested) => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const variant = z.discriminatedUnion('type', [
            z
                .object({
                    type: z.literal('first'),
                    shared: z.string(),
                    firstOnly: z.string(),
                })
                .passthrough(),
            z
                .object({
                    type: z.literal('second'),
                    shared: z.string(),
                    secondOnly: z.string().default('default'),
                })
                .passthrough(),
        ]);
        const value = {
            type: 'first',
            shared: 'keep',
            firstOnly: 'remove',
            extension: { enabled: true },
        };
        const change = vi.fn();
        const container = document.createElement('div');
        const root = createRoot(container);
        try {
            act(() => {
                root.render(
                    <SchemaForm
                        schema={nested ? z.object({ variant }) : variant}
                        value={nested ? { variant: value } : value}
                        onChange={change}
                    />
                );
            });
            const select = required(container.querySelector('select'));
            act(() => {
                select.value = 'second';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            const expected = {
                type: 'second',
                shared: 'keep',
                secondOnly: 'default',
                extension: { enabled: true },
            };
            expect(change).toHaveBeenLastCalledWith(
                nested ? { variant: expected } : expected
            );
        } finally {
            act(() => {
                root.unmount();
            });
        }
    }
);
