import type { WorkflowListItem, WorkflowListItemResponse } from '../api/types';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export function formatDuration(durationMs: number | null): string {
    if (durationMs == null) return '-';
    if (durationMs < 1000) return `${durationMs}ms`;

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export function formatDate(date: Date | null): string {
    if (!date) return '-';
    return dateTimeFormatter.format(date);
}

function toDate(value: number | null | undefined): Date | null {
    if (value == null) return null;
    if (value <= 0) return null;
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatSchedule(
    schedule: WorkflowListItemResponse['schedule'],
    localize: (key: string, args?: Record<string, string | number>) => string
): string {
    if (!schedule) return '-';

    switch (schedule.schedule_type) {
        case 'interval': {
            if (schedule.interval_seconds == null) return '-';
            const seconds = schedule.interval_seconds;
            if (seconds % 3600 === 0) {
                const hours = seconds / 3600;
                return localize('workflows.workflowTable.scheduleEveryHours', {
                    n: hours,
                });
            }
            if (seconds % 60 === 0) {
                const minutes = seconds / 60;
                return localize(
                    'workflows.workflowTable.scheduleEveryMinutes',
                    {
                        n: minutes,
                    }
                );
            }
            return localize('workflows.workflowTable.scheduleEverySeconds', {
                n: seconds,
            });
        }
        case 'specific_time':
            return schedule.specific_time
                ? localize('workflows.workflowTable.scheduleAtTime', {
                      time: schedule.specific_time,
                  })
                : '-';
        default:
            return '-';
    }
}

export function formatIntervalAnchor(
    anchor: string | null,
    localize: (key: string, args?: Record<string, string | number>) => string
): string {
    if (!anchor) return '-';
    switch (anchor) {
        case 'completed':
            return localize('workflows.workflowTable.scheduleAnchorCompleted');
        case 'started':
            return localize('workflows.workflowTable.scheduleAnchorStarted');
        default:
            return anchor;
    }
}

export function getScheduleSortValue(
    schedule: WorkflowListItemResponse['schedule']
): string {
    if (!schedule) return '2:';

    switch (schedule.schedule_type) {
        case 'interval':
            return `0:${schedule.interval_seconds}`;
        case 'specific_time':
            return `1:${schedule.specific_time}`;
        default:
            return '2:';
    }
}

export function mapWorkflow(item: WorkflowListItemResponse): WorkflowListItem {
    return {
        workflow_id: item.workflow_id,
        name: item.name,
        enabled: item.enabled,
        schedule: item.schedule,
        intervalAnchor: item.schedule?.interval_anchor ?? null,
        lastSuccessfulRunAt: toDate(item.last_successful_run?.completed_at),
        lastSuccessfulRunDurationMs:
            item.last_successful_run?.duration_ms ?? null,
        failedRunsSinceLastSuccess: item.failed_runs_after_last_success,
    };
}
