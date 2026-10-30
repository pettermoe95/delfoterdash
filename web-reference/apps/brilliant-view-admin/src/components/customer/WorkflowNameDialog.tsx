import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    TextField,
} from '@brilliant/bds-core';
import { useState } from 'react';

export type WorkflowDialogMode = 'create' | 'edit';

interface WorkflowNameDialogProps {
    mode: WorkflowDialogMode;
    isDialogOpen: boolean;
    setIsDialogOpen: (isDialogOpen: boolean) => void;
    isPending: boolean;
    initialName?: string;
    onSubmit: (trimmedWorkflowName: string) => void;
}

export function WorkflowNameDialog({
    mode = 'edit',
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    initialName,
    onSubmit,
}: WorkflowNameDialogProps) {
    const createMode = mode === 'create';

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {isDialogOpen && (
                <WorkflowNameForm
                    createMode={createMode}
                    initialName={initialName}
                    isPending={isPending}
                    onCancel={() => setIsDialogOpen(false)}
                    onSubmit={onSubmit}
                />
            )}
        </Dialog>
    );
}

type WorkflowNameFormProps = Pick<
    WorkflowNameDialogProps,
    'initialName' | 'isPending' | 'onSubmit'
> & {
    createMode: boolean;
    onCancel: () => void;
};

function WorkflowNameForm({
    createMode,
    initialName,
    isPending,
    onCancel,
    onSubmit,
}: WorkflowNameFormProps) {
    const [workflowName, setWorkflowName] = useState(
        initialName?.trim() || 'New workflow'
    );
    const trimmedWorkflowName = workflowName.trim();
    const canCreateWorkflow = trimmedWorkflowName.length > 0 && !isPending;

    return (
        <DialogContent className="w-[calc(90vw-32px)] max-w-[520px]">
            <DialogHeader>
                <DialogTitle>
                    {createMode ? 'Create new workflow' : 'Edit workflow name'}
                </DialogTitle>
            </DialogHeader>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!canCreateWorkflow) return;
                    onSubmit(trimmedWorkflowName);
                }}
            >
                <TextField
                    name="workflowName"
                    label="Workflow name"
                    placeholder="Name of workflow"
                    size="sm"
                    autoComplete="off"
                    value={workflowName}
                    onChange={(event) => setWorkflowName(event.target.value)}
                />
                <DialogFooter>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            color="gray"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            type="submit"
                            disabled={!canCreateWorkflow}
                            isLoading={isPending}
                        >
                            {createMode ? 'Create' : 'Save'}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
