import { jobStatuses } from '~/features/workflow-editor/api/jobUpdates';
import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';

export type SessionJobEvent = JobUpdate & { id: string };
export type JobSpan = {
    id: string;
    jobId: string;
    startedAt?: number;
    endedAt?: number;
    status: 'running' | 'success' | 'failure' | 'incomplete';
    update: JobUpdate;
};
export type ObservedRun = {
    id: string;
    runId?: string;
    firstEventAt: number;
    spans: JobSpan[];
};

export function eventTime(event: JobUpdate) {
    const occurredAt = Date.parse(event.message.occurredAt);
    return Number.isFinite(occurredAt) ? occurredAt : event.receivedAt;
}

/** Group only observed events; never infer that every worker in a run has completed. */
export function buildTimeline(events: JobUpdate[]): ObservedRun[] {
    const runs = new Map<string, ObservedRun>();
    const ordered = [...events].sort(
        (a, b) =>
            eventTime(a) - eventTime(b) ||
            Number(b.message.name === 'WorkflowJobWasStarted') -
                Number(a.message.name === 'WorkflowJobWasStarted')
    );
    for (const event of ordered) {
        const rawRunId = event.message.payload.runId;
        const runId =
            typeof rawRunId === 'string' && rawRunId.trim()
                ? rawRunId
                : undefined;
        const key = runId ? `run:${runId}` : 'unassigned';
        const time = eventTime(event);
        const run: ObservedRun = runs.get(key) ?? {
            id: key,
            runId,
            firstEventAt: time,
            spans: [],
        };
        runs.set(key, run);
        const jobId = event.message.payload.jobId;
        const status = jobStatuses[event.message.name];
        const previous = [...run.spans]
            .reverse()
            .find((span) => span.jobId === jobId);
        if (status === 'running') {
            if (previous?.startedAt === time && previous.status === 'running')
                continue;
            if (previous?.status === 'running') previous.status = 'incomplete';
            run.spans.push({
                id: `${key}:${jobId}:${run.spans.length}`,
                jobId,
                startedAt: time,
                status,
                update: event,
            });
        } else {
            if (previous?.endedAt === time && previous.status === status)
                continue;
            // Without a run ID, concurrent executions cannot be paired safely.
            if (
                runId &&
                previous?.status === 'running' &&
                previous.startedAt !== undefined
            ) {
                previous.endedAt = time;
                previous.status = status;
                previous.update = event;
            } else {
                if (previous?.status === 'running')
                    previous.status = 'incomplete';
                run.spans.push({
                    id: `${key}:${jobId}:${run.spans.length}`,
                    jobId,
                    endedAt: time,
                    status,
                    update: event,
                });
            }
        }
    }
    return [...runs.values()].sort((a, b) => b.firstEventAt - a.firstEventAt);
}

export function formatDuration(milliseconds: number): string {
    const seconds = Math.max(0, milliseconds) / 1000;
    if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
    if (seconds < 60) return `${seconds.toFixed(1)} s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${Math.floor(seconds % 60)}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function spanDuration(span: JobSpan, now: number): number | undefined {
    if (span.startedAt === undefined || span.status === 'incomplete')
        return undefined;
    return Math.max(0, (span.endedAt ?? now) - span.startedAt);
}
