// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useCredentials, useDatabaseCredentials } from './credentials';

vi.mock('~/api/service', () => ({ apiService: { getData: vi.fn() } }));

it('filters database credentials without removing OAuth credentials from the shared authentication cache', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const credentials = [
        { id: 'api', name: 'Database password', flow_name: 'API Key' },
        { id: 'oauth', name: 'OAuth token', flow_name: 'Client credentials' },
        { id: 'basic', name: 'Basic authentication', flow_name: 'Basic' },
    ];
    const client = new QueryClient();
    client.setQueryData(['credentials', 'tenant'], credentials);
    function Probe() {
        const all = useCredentials('tenant');
        const database = useDatabaseCredentials('tenant');
        return (
            <>
                <div id="all">{all.data?.map((item) => item.id).join(',')}</div>
                <div id="database">
                    {database.data?.map((item) => item.id).join(',')}
                </div>
            </>
        );
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        act(() => {
            root.render(
                <QueryClientProvider client={client}>
                    <Probe />
                </QueryClientProvider>
            );
        });
        expect(container.querySelector('#database')?.textContent).toBe('api');
        expect(container.querySelector('#all')?.textContent).toBe(
            'api,oauth,basic'
        );
        expect(client.getQueryData(['credentials', 'tenant'])).toEqual(
            credentials
        );
    } finally {
        act(() => {
            root.unmount();
        });
        client.clear();
    }
});
