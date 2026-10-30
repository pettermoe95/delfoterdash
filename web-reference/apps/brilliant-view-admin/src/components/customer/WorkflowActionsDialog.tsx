import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
} from '@brilliant/bds-core';
import { useQueryClient } from '@tanstack/react-query';
import { useRenameWorkflow } from '~/hooks/useRenameWorkflow';
import type { WorkflowInfo } from '~/hooks/workflow.ts';
import { useCreateWorkflow, useDeleteWorkflow } from '~/hooks/workflow.ts';
import { WorkflowNameDialog } from './WorkflowNameDialog';

export type WorkflowDialogAction =
    | { kind: 'create' }
    | { kind: 'rename'; workflow: WorkflowInfo }
    | { kind: 'delete'; workflow: WorkflowInfo };

interface WorkflowActionsDialogProps {
    tenantId: string;
    action: WorkflowDialogAction | null;
    onClose: () => void;
    onEditWorkflow: (workflowId: string) => void;
}

export function WorkflowActionsDialog({
    tenantId,
    action,
    onClose,
    onEditWorkflow,
}: WorkflowActionsDialogProps) {
    const queryClient = useQueryClient();
    const createWorkflow = useCreateWorkflow();
    const renameWorkflow = useRenameWorkflow();
    const deleteWorkflow = useDeleteWorkflow();

    const handleWorkflowNameSubmit = (name: string) => {
        if (action?.kind === 'create') {
            createWorkflow.mutate(
                { tenantId, name },
                {
                    onSuccess: (response) => {
                        onClose();
                        invalidateWorkflowList();
                        onEditWorkflow(response.workflow_id);
                    },
                }
            );
        } else if (action?.kind === 'rename') {
            renameWorkflow.mutate(
                { workflowId: action.workflow.id, name },
                {
                    onSuccess: () => {
                        onClose();
                        invalidateWorkflowList();
                    },
                }
            );
        }
    };

    const invalidateWorkflowList = () => {
        void queryClient.invalidateQueries({
            queryKey: ['workflows', tenantId] as const,
        });
    };

    const deleteSelectedWorkflow = () => {
        if (action?.kind !== 'delete') return;
        deleteWorkflow.mutate(action.workflow.id, {
            onSuccess: () => {
                onClose();
                invalidateWorkflowList();
            },
        });
    };

    return (
        <>
            <WorkflowNameDialog
                mode={action?.kind === 'rename' ? 'edit' : 'create'}
                isDialogOpen={
                    action?.kind === 'create' || action?.kind === 'rename'
                }
                setIsDialogOpen={(open) => {
                    if (!open) onClose();
                }}
                isPending={
                    action?.kind === 'create'
                        ? createWorkflow.isPending
                        : renameWorkflow.isPending
                }
                initialName={
                    action?.kind === 'rename' ? action.workflow.name : ''
                }
                onSubmit={handleWorkflowNameSubmit}
            />
            <AlertDialog
                open={action?.kind === 'delete'}
                onOpenChange={(open) => {
                    if (!open && !deleteWorkflow.isPending) {
                        onClose();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete &ldquo;
                            {action?.kind === 'delete'
                                ? action.workflow.name
                                : ''}
                            &rdquo;? If the workflow is currently running, it
                            will be killed mid-run.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteWorkflow.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            color="error"
                            size="sm"
                            disabled={deleteWorkflow.isPending}
                            onClick={deleteSelectedWorkflow}
                        >
                            Delete workflow
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
