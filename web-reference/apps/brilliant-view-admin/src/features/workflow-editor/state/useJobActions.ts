import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { initialValue } from '../forms/schema';
import type { DatabaseConnection } from '../model/databaseSchema';
import { appendJobs, renameJob, withDependencies } from '../model/graph';
import { validateImportedConnections } from '../model/importConnections';
import { arrangeDocument } from '../model/layout';
import type { EditorJob, WorkflowDocument } from '../model/schema';
import { workerByType } from '../workers/registry';
import type { WorkerDefinition } from '../workers/types';

type JobActionsOptions = {
    document: WorkflowDocument;
    edit: (
        update: (document: WorkflowDocument) => WorkflowDocument,
        group?: string
    ) => void;
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
};
export function useJobActions({
    document,
    edit,
    setSelectedIds,
}: JobActionsOptions) {
    const [insertion, setInsertion] = useState<Set<string>>();
    const pastedAfter = useRef<Set<string>>();
    useEffect(() => {
        const previousIds = pastedAfter.current;
        if (!previousIds) return;
        pastedAfter.current = undefined;
        setSelectedIds(
            document.jobs
                .filter((job) => !previousIds.has(job.id))
                .map((job) => job.id)
        );
    }, [document.jobs, setSelectedIds]);
    const renameWorker = useCallback(
        (id: string, name: string): string | undefined => {
            try {
                const renamed = renameJob(document, id, name);
                edit(() => renamed);
                setSelectedIds([name.trim()]);
                return undefined;
            } catch (error) {
                return error instanceof Error
                    ? error.message
                    : 'Cannot rename this worker.';
            }
        },
        [document, edit, setSelectedIds]
    );
    const updateJob = useCallback(
        (id: string, update: (job: EditorJob) => EditorJob, group?: string) => {
            const applyUpdate = (job: EditorJob) => {
                if (job.id !== id) return job;
                const next = update(job);
                const onConfigChange = workerByType(next.type)?.onConfigChange;
                return next.config !== job.config && onConfigChange
                    ? {
                          ...next,
                          config: onConfigChange(next.config, job.config),
                      }
                    : next;
            };
            edit(
                (current) => ({
                    ...current,
                    jobs: current.jobs.map(applyUpdate),
                }),
                group
            );
        },
        [edit]
    );
    const addWorker = useCallback(
        (definition: WorkerDefinition, position: { x: number; y: number }) => {
            const id = `${definition.type}-${crypto.randomUUID().slice(0, 8)}`;
            const config = initialValue(definition.schema) as Record<
                string,
                unknown
            >;
            edit((current) => ({
                ...current,
                jobs: [
                    ...current.jobs,
                    {
                        id,
                        name: id,
                        type: definition.type,
                        config: definition.onConfigChange?.(config) ?? config,
                        position,
                        dependencies: [],
                        execution: {},
                    },
                ],
            }));
            setSelectedIds([id]);
        },
        [edit, setSelectedIds]
    );
    const removeElements = useCallback(
        (jobIds: string[], edgeIds: string[] = []) => {
            const removedJobs = new Set(jobIds);
            const removedEdges = new Set(edgeIds);
            edit((current) => ({
                ...current,
                jobs: current.jobs
                    .filter((job) => !removedJobs.has(job.id))
                    .map((job) =>
                        withDependencies(
                            job,
                            job.dependencies.filter(
                                (source) =>
                                    !removedJobs.has(source) &&
                                    !removedEdges.has(`${source}:${job.id}`)
                            )
                        )
                    ),
            }));
            setSelectedIds((current) =>
                current.filter((id) => !removedJobs.has(id))
            );
        },
        [edit, setSelectedIds]
    );
    const insertJobs = useCallback(
        (
            jobs: EditorJob[],
            connections?: DatabaseConnection[],
            center?: { x: number; y: number }
        ) => {
            // Reject missing references before dispatch, while applying to the latest draft.
            validateImportedConnections(jobs, connections);
            if (!jobs.length) return;
            pastedAfter.current = center
                ? new Set(document.jobs.map((job) => job.id))
                : undefined;
            // Record the existing IDs so the canvas can fit the final, collision-free imported IDs.
            setInsertion(
                center ? undefined : new Set(document.jobs.map((job) => job.id))
            );
            edit((current) => appendJobs(current, jobs, connections, center));
        },
        [document.jobs, edit]
    );
    const arrangeWorkers = () => {
        const arranged = arrangeDocument(document);
        edit(() => arranged);
    };
    return {
        renameWorker,
        updateJob,
        addWorker,
        removeElements,
        insertJobs,
        insertion,
        arrangeWorkers,
    };
}
