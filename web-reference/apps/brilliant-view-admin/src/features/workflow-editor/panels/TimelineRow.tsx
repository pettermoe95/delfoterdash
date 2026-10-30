import { WorkerStatus } from '../canvas/WorkerStatus';
import { formatDuration, spanDuration } from '../model/timeline';
import type { JobSpan } from '../model/timeline';

type TimelineRowProps = {
    span: JobSpan;
    origin: number;
    range: number;
    now: number;
};
export function TimelineRow({ span, origin, range, now }: TimelineRowProps) {
    const start = span.startedAt ?? span.endedAt ?? origin;
    const end = span.endedAt ?? (span.status === 'running' ? now : start);
    const left = Math.min(99, Math.max(0, ((start - origin) / range) * 100));
    const width = Math.min(
        100 - left,
        Math.max(1, ((end - start) / range) * 100)
    );
    const duration = spanDuration(span, now);
    const startText =
        span.startedAt === undefined
            ? 'Start not received'
            : new Date(span.startedAt).toLocaleTimeString();
    const endText =
        span.endedAt === undefined
            ? span.status === 'running'
                ? 'Running'
                : 'Completion not received'
            : new Date(span.endedAt).toLocaleTimeString();
    const durationText =
        duration === undefined
            ? 'Duration unavailable'
            : `≈ ${formatDuration(duration)}${span.status === 'running' ? ' elapsed' : ''}`;
    return (
        <div
            className="we-timeline-row"
            data-status={span.status}
            data-job-id={span.jobId}
        >
            <span className="we-timeline-job" title={span.jobId}>
                {span.jobId}
            </span>
            <div
                className="we-timeline-track"
                title={`${startText} → ${endText}`}
            >
                <span
                    className="we-timeline-bar"
                    style={{ left: `${left}%`, width: `${width}%` }}
                />
            </div>
            <div className="we-timeline-state">
                {span.status === 'incomplete' ? (
                    <span>Completion not received</span>
                ) : (
                    <WorkerStatus update={span.update} showIcon={false} />
                )}
            </div>
            <span
                className="we-timeline-duration"
                title={`${startText} → ${endText}`}
            >
                {durationText}
            </span>
            <span className="we-timeline-times">
                {startText} → {endText}
            </span>
        </div>
    );
}
