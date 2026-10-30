import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';
import { expect, it } from 'vitest';
import { required } from '../test/required';
import {
    buildTimeline,
    eventTime,
    formatDuration,
    spanDuration,
} from './timeline';

function event(
    name: JobUpdate['message']['name'],
    jobId: string,
    time: number,
    runId?: string
): JobUpdate {
    return {
        receivedAt: time + 100,
        message: {
            name,
            workflowId: 'workflow',
            tenantId: 'tenant',
            occurredAt: new Date(time).toISOString(),
            payload: { jobId, ...(runId ? { runId } : {}) },
        },
    };
}
const start = (job: string, time: number, run?: string) =>
    event('WorkflowJobWasStarted', job, time, run);
const success = (job: string, time: number, run?: string) =>
    event('WorkflowJobCompletedSuccessfully', job, time, run);

it('pairs out-of-order events by run ID and job, keeping concurrent runs separate', () => {
    const runs = buildTimeline([
        success('fetch', 5000, 'one'),
        start('fetch', 1500, 'two'),
        start('fetch', 1000, 'one'),
        event('WorkflowJobFailed', 'fetch', 2500, 'two'),
        start('load', 2000, 'one'),
        success('load', 3500, 'one'),
    ]);
    const first = required(runs.find((run) => run.runId === 'one'));
    const second = required(runs.find((run) => run.runId === 'two'));
    expect(
        first.spans.map((span) => [
            span.jobId,
            span.status,
            spanDuration(span, 9000),
        ])
    ).toEqual([
        ['fetch', 'success', 4000],
        ['load', 'success', 1500],
    ]);
    expect(second.spans[0].status).toBe('failure');
    expect(spanDuration(second.spans[0], 9000)).toBe(1000);
});
it('shows unavailable durations for missing starts, missing run IDs and interrupted attempts', () => {
    const missing = buildTimeline([success('fetch', 5000, 'one')])[0].spans[0];
    expect(spanDuration(missing, 9000)).toBeUndefined();
    const unknown = buildTimeline([
        start('fetch', 1000),
        success('fetch', 5000),
    ])[0];
    expect(
        unknown.spans.every((span) => spanDuration(span, 9000) === undefined)
    ).toBe(true);
    const retried = buildTimeline([
        start('fetch', 1000, 'one'),
        start('fetch', 2000, 'one'),
        success('fetch', 4000, 'one'),
    ])[0];
    expect(retried.spans[0].status).toBe('incomplete');
    expect(spanDuration(retried.spans[1], 9000)).toBe(2000);
});
it('ignores duplicate events, estimates running time and falls back for invalid timestamps', () => {
    const started = start('fetch', 1000, 'one');
    const running = buildTimeline([started, started])[0];
    expect(running.spans).toHaveLength(1);
    expect(spanDuration(running.spans[0], 3500)).toBe(2500);
    expect(formatDuration(2500)).toBe('2.5 s');
    expect(formatDuration(61500)).toBe('1m 1s');
    expect(
        eventTime({
            ...started,
            message: { ...started.message, occurredAt: 'invalid' },
        })
    ).toBe(started.receivedAt);
    expect(buildTimeline([])).toEqual([]);
});
