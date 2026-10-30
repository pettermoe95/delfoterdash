import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { JobUpdate } from '~/features/workflow-editor/api/jobUpdates';
import { memo } from 'react';
import { NodeName } from './NodeName';
import { WorkerStatus } from './WorkerStatus';

export type CanvasNode = Node<
    {
        worker: string;
        category: string;
        errors: number;
        update?: JobUpdate;
        disabled: boolean;
        onRename: (name: string) => string | undefined;
        onIssue: () => void;
    },
    'worker'
>;
export const WorkerNode = memo(function WorkerNode({
    id,
    data,
    selected,
}: NodeProps<CanvasNode>) {
    return (
        <div
            className={`we-node ${selected ? 'we-node-selected' : ''}`}
            data-category={data.category}
        >
            <Handle
                type="target"
                position={Position.Left}
                aria-label="Wait for upstream worker"
            />
            <small>{data.worker}</small>
            <NodeName
                id={id}
                disabled={data.disabled}
                onRename={data.onRename}
            />
            <div className="we-node-meta">
                <WorkerStatus update={data.update} />
                {data.errors > 0 && (
                    <button
                        type="button"
                        className="we-node-issues we-error nodrag nopan"
                        onClick={data.onIssue}
                    >
                        {data.errors} issue{data.errors === 1 ? '' : 's'}
                    </button>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Right}
                aria-label="Connect downstream worker"
            />
        </div>
    );
});
