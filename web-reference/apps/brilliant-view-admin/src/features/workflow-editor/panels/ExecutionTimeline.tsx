import { useEffect, useMemo, useState } from 'react';
import { buildTimeline } from '../model/timeline';
import type { ObservedRun, SessionJobEvent } from '../model/timeline';
import { TimelineRow } from './TimelineRow';

type ExecutionTimelineProps = {
    events: SessionJobEvent[];
    selectedRun: string;
    onSelectRun: (run: string) => void;
};
export function ExecutionTimeline({
    events,
    selectedRun,
    onSelectRun,
}: ExecutionTimelineProps) {
    const runs = useMemo(() => buildTimeline(events), [events]);
    const [now, setNow] = useState(Date.now());
    const run =
        selectedRun === 'latest'
            ? runs.at(0)
            : (runs.find((item) => item.id === selectedRun) ?? runs.at(0));
    const running = run?.spans.some((span) => span.status === 'running');
    useEffect(() => {
        setNow(Date.now());
        if (!running) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [running, events]);
    const origin = run?.firstEventAt ?? now;
    const last = Math.max(
        origin + 1,
        ...(run?.spans.map(
            (span) =>
                span.endedAt ??
                (span.status === 'running' ? now : (span.startedAt ?? origin))
        ) ?? [])
    );
    const renderRun = (item: ObservedRun) => (
        <option key={item.id} value={item.id}>
            {item.runId
                ? `${new Date(item.firstEventAt).toLocaleString()} · ${item.runId.slice(0, 8)}`
                : 'Events without a run ID'}
        </option>
    );
    const rows = run?.spans.map((span) => (
        <TimelineRow
            key={span.id}
            span={span}
            origin={origin}
            range={last - origin}
            now={now}
        />
    ));
    return (
        <div
            id="execution-timeline"
            className="we-timeline"
            aria-label="Execution timeline"
        >
            <p className="we-muted">
                Observed runs from this session (latest 200 events). Durations
                are approximate; events missed before opening or during
                disconnection cannot be recovered.
            </p>
            {!run ? (
                <p>No worker events received yet.</p>
            ) : (
                <>
                    <label className="we-timeline-run">
                        Run{' '}
                        <select
                            aria-label="Timeline run"
                            value={selectedRun === 'latest' ? 'latest' : run.id}
                            onChange={(event) =>
                                onSelectRun(event.target.value)
                            }
                        >
                            <option value="latest">Latest observed run</option>
                            {runs.map(renderRun)}
                        </select>
                    </label>
                    <p className="we-muted" title={run.runId}>
                        {run.runId
                            ? `Run ${run.runId}`
                            : 'Run ID unavailable; durations cannot be paired reliably.'}
                    </p>
                    <div className="we-timeline-chart">
                        <div className="we-timeline-axis">
                            <span>{new Date(origin).toLocaleTimeString()}</span>
                            <span>{new Date(last).toLocaleTimeString()}</span>
                        </div>
                        {rows}
                    </div>
                </>
            )}
        </div>
    );
}
