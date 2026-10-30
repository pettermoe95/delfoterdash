import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon,
    IconButton,
} from '@brilliant/bds-core';
import { CellContent } from '@bv/ui';
import type { WorkflowInfo } from '~/hooks/workflow';
import { APP_ROUTES } from '~/routes/routes';
import { generatePath, useNavigate } from 'react-router-dom';

interface WorkflowActionColumnProps {
    workflow: WorkflowInfo;
    onOpenNameDialog: (workflow: WorkflowInfo) => void;
    onToggleEnabled: (workflow: WorkflowInfo) => void;
    onOpenDeleteDialog: (workflow: WorkflowInfo) => void;
    isTogglePending: boolean;
}

export function WorkflowActionColumn({
    workflow,
    onOpenNameDialog,
    onToggleEnabled,
    onOpenDeleteDialog,
    isTogglePending,
}: WorkflowActionColumnProps) {
    const navigate = useNavigate();
    const openWorkflowEditor = () =>
        navigate(
            generatePath(APP_ROUTES.workflow_editor, {
                workflowId: workflow.id,
            })
        );
    return (
        <CellContent className="mr-md flex justify-end">
            <div onClick={(event) => event.stopPropagation()}>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <IconButton
                            icon="bv:dots-horizontal"
                            variant="ghost"
                            size="xs"
                            aria-label="Workflow actions"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={openWorkflowEditor}>
                            <Icon icon="bv:pen" />
                            <span>Open workflow editor</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onOpenNameDialog(workflow)}
                        >
                            <Icon icon="bv:pen" />
                            <span>Edit workflow name</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onToggleEnabled(workflow)}
                            disabled={isTogglePending}
                        >
                            <Icon icon="bv:check" />
                            <span>
                                {workflow.enabled
                                    ? 'Disable workflow'
                                    : 'Enable workflow'}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onOpenDeleteDialog(workflow)}
                        >
                            <Icon
                                icon="bv:trash"
                                className="h-4 w-4 text-fg-error-primary"
                            />
                            <span className="text-error-primary">
                                Delete workflow
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CellContent>
    );
}
