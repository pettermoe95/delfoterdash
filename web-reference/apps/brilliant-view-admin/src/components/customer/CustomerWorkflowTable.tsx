import { Button } from '@brilliant/bds-core';
import { CellContent, DataTable, formatLocalDateTime } from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import type { WorkflowInfo } from '~/hooks/workflow.ts';
import { useMemo } from 'react';
import { WorkflowActionColumn } from './WorkflowActionsColumn';

type CustomerWorkflowTableProps = {
    workflows: WorkflowInfo[];
    onCreateWorkflow: () => void;
    onClickWorkflow: (workflow: WorkflowInfo) => void;
    onOpenNameDialog: (workflow: WorkflowInfo) => void;
    onToggleEnabled: (workflow: WorkflowInfo) => void;
    onOpenDeleteDialog: (workflow: WorkflowInfo) => void;
    isTogglePending: (workflowId: string) => boolean;
};

export default function CustomerWorkflowTable({
    workflows,
    onCreateWorkflow,
    onClickWorkflow,
    onOpenNameDialog,
    onToggleEnabled,
    onOpenDeleteDialog,
    isTogglePending,
}: CustomerWorkflowTableProps) {
    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<WorkflowInfo>();
        return [
            columnHelper.accessor('name', {
                header: 'Workflow Name',
                maxSize: 200,
            }),
            columnHelper.accessor('enabled', {
                header: 'Enabled',
                cell: (cell) => (
                    <CellContent>{cell.getValue() ? 'Yes' : 'No'}</CellContent>
                ),
            }),
            columnHelper.accessor('lastStart', {
                header: 'Last run',
                cell: (cell) => {
                    const when = cell.getValue();
                    return (
                        <CellContent>
                            {when == null ? 'never' : formatLocalDateTime(when)}
                        </CellContent>
                    );
                },
            }),
            columnHelper.display({
                id: 'actions',
                maxSize: 60,
                header: () => (
                    <div className="relative w-full">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <Button size="sm" onClick={onCreateWorkflow}>
                                New workflow
                            </Button>
                        </div>
                    </div>
                ),
                cell: (cell) => {
                    const workflow = cell.row.original;
                    return (
                        <WorkflowActionColumn
                            workflow={workflow}
                            onOpenNameDialog={onOpenNameDialog}
                            onToggleEnabled={onToggleEnabled}
                            onOpenDeleteDialog={onOpenDeleteDialog}
                            isTogglePending={isTogglePending(workflow.id)}
                        />
                    );
                },
            }),
        ];
    }, [
        isTogglePending,
        onCreateWorkflow,
        onOpenDeleteDialog,
        onOpenNameDialog,
        onToggleEnabled,
    ]);

    return (
        <div className="h-full min-h-0">
            <DataTable
                data={workflows}
                columns={columns}
                sortable
                stickyHeader
                defaultSorting={{ id: 'name', desc: false }}
                rowConfig={{
                    onClick: (row) => onClickWorkflow(row.original),
                }}
            />
        </div>
    );
}
