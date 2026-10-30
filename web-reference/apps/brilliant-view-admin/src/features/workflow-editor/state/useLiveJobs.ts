import { apiService } from '~/api/service';
import { env } from '~/config/env';
import { subscribeToWorkflowJobs } from '~/features/workflow-editor/api/jobUpdates';
import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';
import { useCallback, useEffect, useState } from 'react';
import { eventTime } from '../model/timeline';
import type { SessionJobEvent } from '../model/timeline';

function isOlderUpdate(previous: JobUpdate, next: JobUpdate) {
    const difference = eventTime(next) - eventTime(previous);
    if (difference !== 0) return difference < 0;
    return (
        previous.message.payload.runId === next.message.payload.runId &&
        previous.message.name !== 'WorkflowJobWasStarted' &&
        next.message.name === 'WorkflowJobWasStarted'
    );
}

export function useLiveJobs(workflowId: string, tenantId: string) {
    const [updates, setUpdates] = useState<
        Record<string, JobUpdate | undefined>
    >({});
    const [events, setEvents] = useState<SessionJobEvent[]>([]);
    const [error, setError] = useState<string>();
    const [attempt, setAttempt] = useState(0);
    const clear = useCallback(() => setUpdates({}), []);
    const retry = useCallback(() => {
        setError(undefined);
        setAttempt((value) => value + 1);
    }, []);

    useEffect(() => {
        setUpdates({});
        setEvents([]);
        setError(undefined);
    }, [workflowId, tenantId]);

    useEffect(() => {
        if (!workflowId || !tenantId) return;
        return subscribeToWorkflowJobs({
            workflowId,
            tenantId,
            apiBaseUrl: env.apiBaseUrl,
            getToken: () => apiService.getData<{ token: string }>('/ws/token'),
            onUpdate: (update) => {
                const event = {
                    ...update,
                    id:
                        typeof update.message.eventId === 'string'
                            ? update.message.eventId
                            : crypto.randomUUID(),
                };
                setUpdates((previous) => {
                    const jobId = update.message.payload.jobId;
                    const current = previous[jobId];
                    return current && isOlderUpdate(current, update)
                        ? previous
                        : { ...previous, [jobId]: update };
                });
                setEvents((previous) =>
                    previous.some((entry) => entry.id === event.id)
                        ? previous
                        : [...previous.slice(-199), event]
                );
            },
            onError: setError,
        });
    }, [workflowId, tenantId, attempt]);

    return { updates, events, error, retry, clear };
}
