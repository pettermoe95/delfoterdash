// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
    buildJobLogsUrl,
    jobStatuses,
    subscribeToWorkflowJobs,
} from './jobUpdates';
import type { JobUpdate } from './jobUpdates';

class FakeSocket {
    static OPEN = 1;
    static instances: FakeSocket[] = [];
    readyState = 0;
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null;
    onclose: (() => void) | null = null;
    sent: unknown[] = [];
    constructor(public url: URL) {
        FakeSocket.instances.push(this);
    }
    send(data: string) {
        this.sent.push(JSON.parse(data));
    }
    open() {
        this.readyState = 1;
        this.onopen?.();
    }
    receive(message: unknown) {
        this.onmessage?.({ data: JSON.stringify(message) });
    }
    close() {
        this.readyState = 3;
        this.onclose?.();
    }
}

const message = {
    name: 'WorkflowJobWasStarted' as const,
    workflowId: 'workflow',
    tenantId: 'tenant',
    occurredAt: '2026-10-16T10:00:00Z',
    payload: { jobId: 'Job "one" + two', runId: 'run', details: { rows: 10 } },
};
let stop: (() => void) | undefined;
beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T12:00:00Z'));
    FakeSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeSocket);
});
afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

async function subscribe(
    getToken = vi
        .fn<[], Promise<{ token: string }>>()
        .mockResolvedValue({ token: 'secret' })
) {
    const onUpdate = vi.fn<[JobUpdate], void>();
    const onError = vi.fn<[string | undefined], void>();
    stop = subscribeToWorkflowJobs({
        workflowId: 'workflow',
        tenantId: 'tenant',
        apiBaseUrl: 'https://dev.brilliantview.no/api',
        getToken,
        onUpdate,
        onError,
    });
    await vi.advanceTimersByTimeAsync(0);
    return {
        onUpdate,
        onError,
        getToken,
    };
}

function latestSocket() {
    const socket = FakeSocket.instances.at(-1);
    if (!socket) throw new Error('Expected a websocket connection');
    return socket;
}

test('subscribes with a token, accepts all three events and keeps the full payload and arrival time', async () => {
    const { onUpdate, onError } = await subscribe();
    const socket = latestSocket();
    expect(socket.url.pathname).toBe('/ws');
    expect(socket.url.protocol).toBe('wss:');
    expect(socket.url.searchParams.get('token')).toBe('secret');
    socket.open();
    expect(socket.sent).toEqual([
        { command: 'subscribe.workflow', workflowId: 'workflow' },
    ]);
    socket.receive({ type: 'subscribed.workflow', subscriptionKey: 'key' });
    expect(onError).toHaveBeenLastCalledWith(undefined);
    for (const name of Object.keys(jobStatuses))
        socket.receive({ ...message, name });
    expect(onUpdate).toHaveBeenCalledTimes(3);
    expect(onUpdate.mock.calls[0]?.[0]).toEqual({
        message,
        receivedAt: Date.now(),
    });
    stop?.();
    expect(socket.sent.at(-1)).toEqual({
        command: 'unsubscribe.workflow',
        subscriptionKey: 'key',
    });
});

test('ignores malformed, unrelated, and cross-tenant messages', async () => {
    const { onUpdate } = await subscribe();
    const socket = latestSocket();
    socket.receive({ ...message, workflowId: 'another' });
    socket.receive({ ...message, tenantId: 'another' });
    socket.receive({ ...message, name: 'unknown' });
    socket.receive({ ...message, payload: {} });
    socket.onmessage?.({ data: '{invalid' });
    expect(onUpdate).not.toHaveBeenCalled();
});

test('reconnects with a fresh token and resubscribes, then cancels retries on cleanup', async () => {
    const { getToken } = await subscribe();
    const socket = latestSocket();
    socket.open();
    socket.receive({ type: 'subscribed.workflow', subscriptionKey: 'old' });
    socket.close();
    await vi.advanceTimersByTimeAsync(1000);
    expect(getToken).toHaveBeenCalledTimes(2);
    const replacement = latestSocket();
    replacement.open();
    expect(replacement.sent[0]).toEqual({
        command: 'subscribe.workflow',
        workflowId: 'workflow',
    });
    replacement.close();
    stop?.();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(getToken).toHaveBeenCalledTimes(2);
});

test('does not create a socket after cleanup while token issuance is pending', async () => {
    let resolve!: (value: { token: string }) => void;
    await subscribe(
        vi.fn(
            () =>
                new Promise<{ token: string }>((done) => {
                    resolve = done;
                })
        )
    );
    stop?.();
    resolve({ token: 'late' });
    await Promise.resolve();
    expect(FakeSocket.instances).toHaveLength(0);
});

test('reports subscription errors without retrying permission failures', async () => {
    const { onError, getToken } = await subscribe();
    const socket = latestSocket();
    socket.open();
    socket.receive({ type: 'error', message: 'Forbidden' });
    expect(onError).toHaveBeenLastCalledWith(
        'Live job updates unavailable: Forbidden'
    );
    await vi.advanceTimersByTimeAsync(60_000);
    expect(getToken).toHaveBeenCalledTimes(1);
});

test.each([
    ['https://dev.brilliantview.no/api', 'victorialogs.dev.brilliantview.no'],
    ['https://test.brilliantview.no/api', 'victorialogs.test.brilliantview.no'],
    ['https://brilliantview.no/api', 'victorialogs.brilliantview.no'],
    ['http://localhost:4000/api', 'victorialogs.dev.brilliantview.no'],
])(
    'log links select the environment and end the two-minute window at arrival: %s',
    (apiBaseUrl, host) => {
        const update: JobUpdate = { message, receivedAt: Date.now() };
        const url = new URL(buildJobLogsUrl(apiBaseUrl, update));
        const params = new URLSearchParams(url.hash.slice(3));
        expect(url.hostname).toBe(host);
        expect(params.get('query')).toBe(JSON.stringify(message.payload.jobId));
        expect(params.get('g0.range_input')).toBe('2m');
        expect(params.get('g0.end_input')).toBe('2026-10-16T12:00:00.000');
        expect(params.get('g0.relative_time')).toBe('none');
    }
);

test.each([
    ['2026-07-16T14:00:00+02:00', '2026-07-16T12:00:00.000'],
    ['2026-01-16T13:00:00+01:00', '2026-01-16T12:00:00.000'],
    ['2026-10-25T02:30:00+02:00', '2026-10-25T00:30:00.000'],
    ['2026-10-25T02:30:00+01:00', '2026-10-25T01:30:00.000'],
])(
    'log links encode UTC wall time for arrival at %s',
    (arrival, expectedEnd) => {
        const receivedAt = Date.parse(arrival);
        const url = new URL(
            buildJobLogsUrl('https://dev.brilliantview.no/api', {
                message,
                receivedAt,
            })
        );
        const params = new URLSearchParams(url.hash.slice(3));
        expect(params.get('g0.end_input')).toBe(expectedEnd);
        expect(params.get('g0.range_input')).toBe('2m');
        // VMUI interprets the suffix-free value as UTC, regardless of browser zone.
        expect(Date.parse(`${params.get('g0.end_input')}Z`)).toBe(receivedAt);
    }
);
