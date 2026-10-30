// @vitest-environment jsdom
import type {
    JobUpdate,
    subscribeToWorkflowJobs,
} from '~/features/workflow-editor/api/jobUpdates';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { required } from '../test/required';
import { useLiveJobs } from './useLiveJobs';

const { subscribe, stop } = vi.hoisted(() => ({
    subscribe: vi.fn<
        Parameters<typeof subscribeToWorkflowJobs>,
        ReturnType<typeof subscribeToWorkflowJobs>
    >(),
    stop: vi.fn(),
}));
vi.mock('~/features/workflow-editor/api/jobUpdates', () => ({
    subscribeToWorkflowJobs: subscribe,
}));
let root: Root;
let container: HTMLDivElement;
let live: ReturnType<typeof useLiveJobs>;
type ProbeProps = { workflowId?: string; tenantId?: string };
function Probe({ workflowId = 'workflow', tenantId = 'tenant' }: ProbeProps) {
    live = useLiveJobs(workflowId, tenantId);
    return null;
}
const update: JobUpdate = {
    message: {
        name: 'WorkflowJobWasStarted',
        workflowId: 'workflow',
        tenantId: 'tenant',
        occurredAt: '2026-10-22T10:00:00Z',
        payload: { jobId: 'fetch', detail: 'Full payload' },
    },
    receivedAt: Date.parse('2026-10-22T10:00:01Z'),
};
function receive(event = update) {
    act(() => {
        required(subscribe.mock.calls.at(-1))[0].onUpdate(event);
    });
}
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    subscribe.mockReset().mockReturnValue(stop);
    stop.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});
afterEach(() => {
    act(() => {
        root.unmount();
    });
    container.remove();
});

it('waits for tenant loading, tracks latest states, and retains activity when starting another run', () => {
    act(() => {
        root.render(<Probe tenantId="" />);
    });
    expect(subscribe).not.toHaveBeenCalled();
    act(() => {
        root.render(<Probe />);
    });
    expect(subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ workflowId: 'workflow', tenantId: 'tenant' })
    );
    receive();
    receive({
        ...update,
        message: {
            ...update.message,
            name: 'WorkflowJobCompletedSuccessfully',
        },
    });
    expect(live.updates.fetch?.message.name).toBe(
        'WorkflowJobCompletedSuccessfully'
    );
    expect(live.events).toHaveLength(2);
    act(() => {
        live.clear();
    });
    expect(live.updates).toEqual({});
    expect(live.events).toHaveLength(2);
    receive({
        ...update,
        message: { ...update.message, name: 'WorkflowJobFailed' },
    });
    expect(live.updates.fetch?.message.name).toBe('WorkflowJobFailed');
    expect(subscribe).toHaveBeenCalledTimes(1);
});

it('retries errors without losing statuses, and resets state and unsubscribes on workflow changes', () => {
    act(() => {
        root.render(<Probe />);
    });
    receive();
    act(() => {
        required(subscribe.mock.calls.at(-1))[0].onError('Subscription denied');
    });
    expect(live.error).toBe('Subscription denied');
    act(() => {
        live.retry();
    });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(live.error).toBeUndefined();
    expect(live.updates.fetch).toEqual(update);
    act(() => {
        root.render(<Probe workflowId="another" />);
    });
    expect(stop).toHaveBeenCalledTimes(2);
    expect(live.updates).toEqual({});
    expect(live.events).toEqual([]);
    act(() => {
        root.render(null);
    });
    expect(stop).toHaveBeenCalledTimes(3);
});

it('keeps completed status for delayed starts and older runs while retaining all events', () => {
    act(() => root.render(<Probe />));
    const completion: JobUpdate = {
        ...update,
        message: {
            ...update.message,
            name: 'WorkflowJobCompletedSuccessfully',
            occurredAt: '2026-10-22T10:00:02Z',
            payload: { jobId: 'fetch', runId: 'run-1' },
        },
    };
    receive(completion);
    receive({
        ...update,
        message: {
            ...update.message,
            payload: { jobId: 'fetch', runId: 'run-1' },
        },
    });
    receive({
        ...completion,
        message: { ...completion.message, name: 'WorkflowJobWasStarted' },
    });
    expect(live.updates.fetch).toEqual(completion);
    const nextRun: JobUpdate = {
        ...update,
        message: {
            ...update.message,
            occurredAt: '2026-10-22T10:01:00Z',
            payload: { jobId: 'fetch', runId: 'run-2' },
        },
    };
    receive(nextRun);
    receive(completion);
    expect(live.updates.fetch).toEqual(nextRun);
    expect(live.events).toHaveLength(5);
});

it('bounds session history while preserving the latest worker update', () => {
    act(() => {
        root.render(<Probe />);
    });
    for (let index = 0; index < 205; index++)
        receive({ ...update, receivedAt: index });
    expect(live.events).toHaveLength(200);
    expect(live.events[0].receivedAt).toBe(5);
    expect(live.updates.fetch?.receivedAt).toBe(204);
    expect(new Set(live.events.map((event) => event.id)).size).toBe(200);
});
