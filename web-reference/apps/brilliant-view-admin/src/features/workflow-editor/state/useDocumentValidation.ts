import { useRef } from 'react';
import type { WorkflowDocument } from '../model/schema';
import { validateDocument } from '../model/validation';
import type { ValidationIssue } from '../model/validation';

/** Positions do not affect configuration validation; dragging can reuse the existing result. */
export function useDocumentValidation(
    document: WorkflowDocument
): ValidationIssue[] {
    const cache = useRef<{
        document: WorkflowDocument;
        issues: ValidationIssue[];
    }>();
    const previous = cache.current?.document;
    const unchanged =
        previous?.version === document.version &&
        previous.incremental === document.incremental &&
        previous.scheduling === document.scheduling &&
        previous.databaseConnections === document.databaseConnections &&
        previous.jobs.length === document.jobs.length &&
        previous.jobs.every((job, index) => {
            const next = document.jobs[index];
            return (
                job.id === next.id &&
                job.type === next.type &&
                job.name === next.name &&
                job.config === next.config &&
                job.dependencies === next.dependencies &&
                job.databaseConnectionId === next.databaseConnectionId &&
                job.execution === next.execution &&
                Number.isFinite(job.position.x) &&
                Number.isFinite(job.position.y) &&
                Number.isFinite(next.position.x) &&
                Number.isFinite(next.position.y)
            );
        });
    if (!unchanged || !cache.current)
        cache.current = { document, issues: validateDocument(document) };
    return cache.current.issues;
}
