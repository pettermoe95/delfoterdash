// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { buildRequest } from '../api/persistence';
import { emptyDocument } from '../model/schema';
import { useEditor } from './useEditor';

const { getData, postData, invalidateQueries, displayToast } = vi.hoisted(
    () => ({
        getData: vi.fn(),
        postData: vi.fn<[url: string, body: unknown], Promise<unknown>>(),
        invalidateQueries: vi.fn(),
        displayToast: vi.fn(),
    })
);
vi.mock('~/api/service', () => ({ apiService: { getData, postData } }));
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({ invalidateQueries }),
}));
vi.mock('@bv/ui', () => ({ useToastContext: () => ({ displayToast }) }));
vi.mock('./useLiveJobs', () => ({
    useLiveJobs: () => ({ updates: {}, events: [], clear: vi.fn() }),
}));
let editor: ReturnType<typeof useEditor>;
function Probe() {
    editor = useEditor('workflow');
    return null;
}

it('retries an initial load failure without leaving the editor or saving anything', async () => {
    vi.clearAllMocks();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const details = {
        id: 'workflow',
        tenant_id: 'tenant',
        name: 'Recovered workflow',
        enabled: false,
        layout: JSON.stringify(emptyDocument()),
        configuration: '{}',
        incremental_settings: '{}',
        scheduling_meta: '{}',
    };
    let completeRetry: (value: typeof details) => void = () => {
        throw new Error('Retry has not started.');
    };
    getData
        .mockRejectedValueOnce(new Error('Temporary load failure'))
        .mockImplementationOnce(
            () =>
                new Promise<typeof details>((resolve) => {
                    completeRetry = resolve;
                })
        );
    const root = createRoot(window.document.createElement('div'));
    try {
        await act(async () => {
            root.render(<Probe />);
            await Promise.resolve();
        });
        expect(editor.loadError).toBe('Temporary load failure');
        act(() => {
            editor.retryLoad();
        });
        expect(editor.loading).toBe(true);
        expect(editor.loadError).toBe('');
        await act(async () => {
            completeRetry(details);
            await Promise.resolve();
        });
        expect(editor.loading).toBe(false);
        expect(editor.loadError).toBe('');
        expect(editor.name).toBe('Recovered workflow');
        expect(editor.dirty).toBe(false);
        expect(getData).toHaveBeenCalledTimes(2);
        expect(getData).toHaveBeenNthCalledWith(
            1,
            '/v1/admin/workflows/workflow'
        );
        expect(getData).toHaveBeenNthCalledWith(
            2,
            '/v1/admin/workflows/workflow'
        );
        expect(postData).not.toHaveBeenCalled();
    } finally {
        act(() => {
            root.unmount();
        });
    }
});

it('refreshes workflow-list data after a save partially succeeds and keeps the draft retryable', async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const document = {
        ...emptyDocument(),
        jobs: [
            {
                id: 'load',
                name: 'load',
                type: 'JsonLoader',
                config: {},
                dependencies: [],
                execution: {},
                position: { x: 0, y: 0 },
            },
        ],
    };
    getData.mockResolvedValue({
        id: 'workflow',
        tenant_id: 'tenant',
        name: 'Workflow',
        enabled: true,
        layout: JSON.stringify(document),
        configuration: '{}',
        incremental_settings: '{}',
        scheduling_meta: '{}',
    });
    postData.mockImplementation((url) => {
        if (url.endsWith('/disable')) return Promise.resolve({});
        return Promise.reject(new Error('Save failed'));
    });
    const container = window.document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () => {
            root.render(<Probe />);
            await Promise.resolve();
        });
        expect(editor.loading).toBe(false);
        act(() => {
            editor.setEnabled(false);
            editor.updateJob('load', (job) => ({
                ...job,
                config: { onlyIncludeKeys: ['id'] },
            }));
        });
        await act(async () => {
            expect(await editor.save()).toBe(false);
        });
        expect(postData.mock.calls.map(([url]) => url)).toEqual([
            '/v1/admin/workflows/workflow/disable',
            '/v1/admin/workflows/workflow',
        ]);
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['workflows', 'tenant'],
        });
        expect(editor.dirty).toBe(true);
        expect(editor.busy).toBe(false);
        expect(displayToast).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error', text: 'Save failed' })
        );
    } finally {
        act(() => {
            root.unmount();
        });
    }
});

it('marks previously converted blanks as unsaved and requires their repair before triggering saved execution', async () => {
    vi.clearAllMocks();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const document = {
        ...emptyDocument(),
        jobs: [
            {
                id: 'ingest',
                name: 'Ingest',
                type: 'IngestJob',
                config: { entity: 'sales', dateColumn: '' },
                dependencies: [],
                execution: {},
                position: { x: 0, y: 0 },
            },
        ],
    };
    const details = {
        id: 'workflow',
        tenant_id: 'tenant',
        name: 'Workflow',
        enabled: false,
        layout: JSON.stringify(document),
        configuration: JSON.stringify({
            jobs: [
                {
                    jobId: 'ingest',
                    worker: 'IngestWorker',
                    config: document.jobs[0].config,
                },
            ],
        }),
        incremental_settings: '{}',
        scheduling_meta: '{}',
    };
    getData.mockResolvedValue(details);
    postData.mockResolvedValue({});
    const root = createRoot(window.document.createElement('div'));
    try {
        await act(async () => {
            root.render(<Probe />);
            await Promise.resolve();
        });
        expect(editor.loading).toBe(false);
        expect(editor.document.jobs[0].config).not.toHaveProperty('dateColumn');
        expect(editor.dirty).toBe(true);
        await act(async () => {
            expect(await editor.run(false)).toBe(false);
        });
        expect(postData).not.toHaveBeenCalled();
        await act(async () => {
            expect(await editor.save()).toBe(true);
        });
        expect(editor.dirty).toBe(false);
        getData.mockResolvedValue({
            ...details,
            ...buildRequest(editor.document),
        });
        await act(async () => {
            expect(await editor.run(false)).toBe(true);
        });
        expect(postData).toHaveBeenLastCalledWith(
            '/v1/admin/workflows/workflow/trigger',
            {}
        );
    } finally {
        act(() => {
            root.unmount();
        });
    }
});
