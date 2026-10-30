import { useQueryClient } from '@tanstack/react-query';
import CustomerWorkflowTable from '~/components/customer/CustomerWorkflowTable.tsx';
import type { WorkflowDialogAction } from '~/components/customer/WorkflowActionsDialog';
import { WorkflowActionsDialog } from '~/components/customer/WorkflowActionsDialog';
import type { WorkflowInfo } from '~/hooks/workflow.ts';
import { useDisableWorkflow, useEnableWorkflow } from '~/hooks/workflow.ts';
import { APP_ROUTES } from '~/routes/routes';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

interface CustomerWorkflowsProps {
    tenantId: string;
    workflows: WorkflowInfo[];
}

export function CustomerWorkflows({
    tenantId,
    workflows,
}: CustomerWorkflowsProps) {
    const navigate = useNavigate();
    const openWorkflowEditor = (workflowId: string) => {
        navigate(generatePath(APP_ROUTES.workflow_editor, { workflowId }));
    };
    const queryClient = useQueryClient();
    const enableWorkflow = useEnableWorkflow();
    const disableWorkflow = useDisableWorkflow();
    const [dialogAction, setDialogAction] =
        useState<WorkflowDialogAction | null>(null);

    const invalidateWorkflowList = () => {
        void queryClient.invalidateQueries({
            queryKey: ['workflows', tenantId] as const,
        });
    };

    const toggleWorkflowEnabled = (workflow: WorkflowInfo) => {
        const mutation = workflow.enabled ? disableWorkflow : enableWorkflow;
        mutation.mutate(workflow.id, {
            onSuccess: invalidateWorkflowList,
        });
    };

    const isActiveWorkflowTogglePending = (workflowId: string) =>
        (enableWorkflow.isPending && enableWorkflow.variables === workflowId) ||
        (disableWorkflow.isPending && disableWorkflow.variables === workflowId);

    return (
        <>
            <WorkflowActionsDialog
                tenantId={tenantId}
                action={dialogAction}
                onClose={() => setDialogAction(null)}
                onEditWorkflow={openWorkflowEditor}
            />
            <CustomerWorkflowTable
                workflows={workflows}
                onCreateWorkflow={() => setDialogAction({ kind: 'create' })}
                onToggleEnabled={toggleWorkflowEnabled}
                isTogglePending={isActiveWorkflowTogglePending}
                onOpenDeleteDialog={(workflow) =>
                    setDialogAction({ kind: 'delete', workflow })
                }
                onOpenNameDialog={(workflow) =>
                    setDialogAction({ kind: 'rename', workflow })
                }
                onClickWorkflow={(workflow) => openWorkflowEditor(workflow.id)}
            />
        </>
    );
}
