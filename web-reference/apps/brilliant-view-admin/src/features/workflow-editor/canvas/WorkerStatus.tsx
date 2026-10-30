import { env } from '~/config/env';
import {
    buildJobLogsUrl,
    jobStatuses,
} from '~/features/workflow-editor/api/jobUpdates';
import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';
import { useState } from 'react';
import { Dialog } from '../components/Dialog';

type WorkerStatusProps = { update?: JobUpdate; showIcon?: boolean };
const labels = { running: 'Running', success: 'Succeeded', failure: 'Failed' };

export function WorkerStatus({ update, showIcon = true }: WorkerStatusProps) {
    const [open, setOpen] = useState(false);
    if (!update) return <span className="we-status">No live updates yet</span>;
    const status = jobStatuses[update.message.name];
    return (
        <div
            className="nodrag nopan nowheel"
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onCopy={(event) => event.stopPropagation()}
            onPaste={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                className="we-worker-status"
                data-status={status}
                aria-label={`${update.message.payload.jobId}: ${labels[status]}. View latest update`}
                title={JSON.stringify(update.message.payload)}
                onClick={() => setOpen(true)}
            >
                {showIcon &&
                    (status === 'running' ? (
                        <span className="we-spinner" aria-hidden="true" />
                    ) : status === 'success' ? (
                        '✓'
                    ) : (
                        '×'
                    ))}
                {labels[status]}
            </button>
            {open && (
                <Dialog
                    title={`${labels[status]}: ${update.message.payload.jobId}`}
                    onClose={() => setOpen(false)}
                >
                    <p>
                        <time dateTime={update.message.occurredAt}>
                            {new Date(
                                update.message.occurredAt
                            ).toLocaleString()}
                        </time>
                    </p>
                    <a
                        href={buildJobLogsUrl(env.apiBaseUrl, update)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Search in VictoriaLogs
                    </a>
                    <pre>{JSON.stringify(update.message.payload, null, 2)}</pre>
                </Dialog>
            )}
        </div>
    );
}
