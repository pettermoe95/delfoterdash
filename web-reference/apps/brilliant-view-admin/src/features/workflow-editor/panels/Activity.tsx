import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bv/ui';
import { jobStatuses } from '~/features/workflow-editor/api/jobUpdates';
import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';
import { useState } from 'react';
import { WorkerStatus } from '../canvas/WorkerStatus';
import { eventTime } from '../model/timeline';
import type { SessionJobEvent } from '../model/timeline';
import type { ActivityEntry } from '../state/useEditor';
import { ExecutionTimeline } from './ExecutionTimeline';

type ActivityProps = {
    entries: ActivityEntry[];
    events: SessionJobEvent[];
    onClose: () => void;
    height: number;
};
export function Activity({ entries, events, onClose, height }: ActivityProps) {
    const [selectedRun, setSelectedRun] = useState('latest');
    const activity = [
        ...entries.map((entry) => ({
            ...entry,
            update: undefined as JobUpdate | undefined,
        })),
        ...events.map((update) => ({
            id: update.id,
            time: new Date(eventTime(update)).toISOString(),
            message: update.message.payload.jobId,
            error: jobStatuses[update.message.name] === 'failure',
            update,
        })),
    ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
    const renderEntry = (entry: (typeof activity)[number]) => (
        <div
            key={entry.id}
            className={`we-activity-entry ${entry.error ? 'we-error' : ''}`}
        >
            <time dateTime={entry.time}>
                {new Date(entry.time).toLocaleTimeString()}
            </time>
            <span className="we-activity-message" title={entry.message}>
                {entry.message}
            </span>
            {entry.update && (
                <WorkerStatus update={entry.update} showIcon={false} />
            )}
        </div>
    );
    return (
        <section
            id="workflow-activity"
            className="we-activity"
            aria-label="Execution activity"
            style={{ height }}
        >
            <Tabs defaultValue="events">
                <div className="we-row">
                    <h2>Activity</h2>
                    <TabsList
                        className="we-activity-tabs"
                        aria-label="Activity view"
                    >
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>
                    <button type="button" onClick={onClose}>
                        Close activity
                    </button>
                </div>
                <TabsContent value="events">
                    <p className="we-muted">
                        Live worker updates and editor actions from this
                        session. Select a worker status to inspect its payload
                        and search logs.
                    </p>
                    <div role="log" aria-live="polite">
                        {activity.length ? (
                            activity.map(renderEntry)
                        ) : (
                            <p>No activity in this session.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="timeline">
                    <ExecutionTimeline
                        events={events}
                        selectedRun={selectedRun}
                        onSelectRun={setSelectedRun}
                    />
                </TabsContent>
            </Tabs>
        </section>
    );
}
