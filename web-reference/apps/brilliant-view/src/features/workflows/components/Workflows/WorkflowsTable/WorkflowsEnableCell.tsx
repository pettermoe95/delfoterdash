import { Toggle } from '@brilliant/bds-core';
import { CellContent } from '@bv/ui';
import type { CellContext } from '@tanstack/react-table';
import { PERMISSION, useAccount } from '~/features/auth';
import type { WorkflowListItem } from '~/features/workflows/api/types';
import { useUpdateWorkflow } from '~/features/workflows/hooks/useWorkflowMutations';

export function WorkflowEnableCell(
    cell: CellContext<WorkflowListItem, boolean>
) {
    const { hasPermission } = useAccount();
    const {
        mutate: updateWorkflow,
        isPending,
        variables,
    } = useUpdateWorkflow();
    const canManageWorkflows = hasPermission(PERMISSION.WORKFLOWS_MANAGE);
    const workflow = cell.row.original;

    return (
        <CellContent>
            <Toggle
                size="sm"
                checked={cell.getValue()}
                disabled={
                    !canManageWorkflows ||
                    (isPending &&
                        variables?.workflowId === workflow.workflow_id)
                }
                onCheckedChange={(checked) => {
                    updateWorkflow({
                        workflowId: workflow.workflow_id,
                        enabled: checked,
                    });
                }}
            />
        </CellContent>
    );
}
