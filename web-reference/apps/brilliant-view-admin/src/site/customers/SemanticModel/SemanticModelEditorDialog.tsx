import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@brilliant/bds-core';
import type { Connection } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { RelationshipForm } from './RelationshipForm';
import { RoleForm } from './RoleForm';
import type {
    SemanticModelDeleteTarget,
    SemanticRelation,
    SemanticRelationship,
    WarehouseSchema,
    WarehouseTable,
} from './semanticModel';
import type { SemanticModelRequest } from './useSemanticModel';

export type SemanticModelEditorState = {
    createTable?: WarehouseTable;
    connection?: Connection;
    selectedRelation?: SemanticRelation;
    selectedRelationship?: SemanticRelationship;
    deleteTargets?: SemanticModelDeleteTarget[];
    error?: string;
    refreshError?: string;
};

type SemanticModelEditorDialogProps = {
    state: SemanticModelEditorState;
    tenantId: string;
    relations: SemanticRelation[];
    warehouse?: WarehouseSchema;
    pending: boolean;
    onCancel: () => void;
    onRequest: (request: SemanticModelRequest) => void;
    onCreateRole: (body: Record<string, unknown>) => void;
    onDelete: (targets: SemanticModelDeleteTarget[]) => void;
    onConfirmDelete: () => void;
    onRefresh: () => void;
};

export function SemanticModelEditorDialog({
    state,
    tenantId,
    relations,
    warehouse,
    pending,
    onCancel,
    onRequest,
    onCreateRole,
    onDelete,
    onConfirmDelete,
    onRefresh,
}: SemanticModelEditorDialogProps) {
    const {
        createTable,
        connection,
        selectedRelation,
        selectedRelationship,
        deleteTargets,
        error,
        refreshError,
    } = state;
    const singleDeleteTarget =
        deleteTargets?.length === 1 ? deleteTargets[0] : undefined;
    const deleteTitle = singleDeleteTarget
        ? `Delete ${singleDeleteTarget.kind === 'role' ? 'role' : 'relationship'} "${singleDeleteTarget.kind === 'role' ? singleDeleteTarget.value.relationName : singleDeleteTarget.value.relationshipName}"?`
        : `Delete ${deleteTargets?.length ?? 0} elements?`;

    const closeDialog = () => {
        if (!pending) onCancel();
    };
    const handleOpenChange: NonNullable<
        ComponentProps<typeof Dialog>['onOpenChange']
    > = (open) => !open && closeDialog();

    const handleEscapeKeyDown: NonNullable<
        ComponentProps<typeof DialogContent>['onEscapeKeyDown']
    > = (event) => {
        if (pending) event.preventDefault();
    };

    const handleInteractOutside: NonNullable<
        ComponentProps<typeof DialogContent>['onInteractOutside']
    > = (event) => {
        if (pending) event.preventDefault();
    };

    const handleCreateRelationship: NonNullable<
        ComponentProps<typeof RelationshipForm>['onSubmit']
    > = (body) =>
        onRequest({
            method: 'post',
            suffix: '/relationships',
            body,
        });

    const handleDeleteRelation = () => {
        if (!selectedRelation) return;
        onDelete([{ kind: 'role', value: selectedRelation }]);
    };

    const handleSaveRelation: NonNullable<
        ComponentProps<typeof RoleForm>['onSubmit']
    > = (body) => {
        if (!selectedRelation) return;
        onRequest({
            method: 'patch',
            suffix: `/relations/${encodeURIComponent(selectedRelation.relationName)}`,
            body,
        });
    };

    const handleDeleteRelationship = () => {
        if (!selectedRelationship) return;
        onDelete([{ kind: 'edge', value: selectedRelationship }]);
    };

    const handleSaveRelationship: NonNullable<
        ComponentProps<typeof RelationshipForm>['onSubmit']
    > = (body) => {
        if (!selectedRelationship) return;
        onRequest({
            method: 'patch',
            suffix: `/relationships/${encodeURIComponent(selectedRelationship.relationshipName)}`,
            body,
        });
    };

    return (
        <Dialog
            open={Boolean(
                createTable ||
                    connection ||
                    selectedRelation ||
                    selectedRelationship ||
                    deleteTargets?.length ||
                    refreshError
            )}
            onOpenChange={handleOpenChange}
        >
            <DialogContent
                className="w-[min(96vw,1100px)] !max-w-5xl"
                showCloseButton={!pending}
                onEscapeKeyDown={handleEscapeKeyDown}
                onInteractOutside={handleInteractOutside}
            >
                <DialogHeader>
                    <DialogTitle className="break-words">
                        {refreshError
                            ? 'Could not refresh semantic model'
                            : deleteTargets?.length
                              ? deleteTitle
                              : createTable
                                ? 'Create semantic role'
                                : connection
                                  ? 'Create relationship'
                                  : selectedRelation
                                    ? 'Edit semantic role'
                                    : 'Edit relationship'}
                    </DialogTitle>
                </DialogHeader>
                {(error || refreshError) && (
                    <div
                        role="alert"
                        className="whitespace-pre-line rounded bg-error-primary p-3 text-sm text-error-primary"
                    >
                        {error || refreshError}
                    </div>
                )}
                {refreshError ? (
                    <>
                        <p className="text-sm text-tertiary">
                            Your changes were saved, but the graph could not be
                            refreshed. Retry refreshing to see the latest state.
                        </p>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="ghost"
                                color="gray"
                                disabled={pending}
                                onClick={closeDialog}
                            >
                                Close
                            </Button>
                            <Button disabled={pending} onClick={onRefresh}>
                                Retry refresh
                            </Button>
                        </div>
                    </>
                ) : deleteTargets?.length ? (
                    <>
                        <p className="text-sm text-tertiary">
                            The following items will be deleted. This cannot be
                            undone.
                        </p>
                        <ul className="max-h-64 list-disc space-y-1 overflow-y-auto pl-5 text-sm">
                            {deleteTargets.map((target) => (
                                <li
                                    key={
                                        target.kind === 'role'
                                            ? `role:${target.value.relationName}`
                                            : `edge:${target.value.relationshipName}`
                                    }
                                    className="break-words"
                                >
                                    {target.kind === 'role'
                                        ? `Role "${target.value.relationName}"`
                                        : `Relationship "${target.value.relationshipName}" (${target.value.sourceRelation} → ${target.value.targetRelation})`}
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="ghost"
                                color="gray"
                                disabled={pending}
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="error"
                                disabled={pending}
                                onClick={onConfirmDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </>
                ) : createTable ? (
                    <RoleForm
                        table={createTable}
                        relations={relations}
                        onCancel={closeDialog}
                        onSubmit={onCreateRole}
                        pending={pending}
                    />
                ) : connection ? (
                    <RelationshipForm
                        source={connection.source}
                        target={connection.target}
                        tenantId={tenantId}
                        relations={relations}
                        warehouse={warehouse}
                        onCancel={closeDialog}
                        onSubmit={handleCreateRelationship}
                        pending={pending}
                    />
                ) : selectedRelation ? (
                    <RoleForm
                        relation={selectedRelation}
                        relations={relations}
                        onCancel={closeDialog}
                        onDelete={handleDeleteRelation}
                        onSubmit={handleSaveRelation}
                        pending={pending}
                    />
                ) : selectedRelationship ? (
                    <RelationshipForm
                        source={selectedRelationship.sourceRelation}
                        target={selectedRelationship.targetRelation}
                        tenantId={tenantId}
                        relationship={selectedRelationship}
                        relations={relations}
                        warehouse={warehouse}
                        onCancel={closeDialog}
                        onDelete={handleDeleteRelationship}
                        onSubmit={handleSaveRelationship}
                        pending={pending}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
