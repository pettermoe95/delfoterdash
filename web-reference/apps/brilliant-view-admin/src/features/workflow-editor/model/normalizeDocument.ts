import { normalizeConfig } from '../workers/normalizeConfig';
import { workerByType } from '../workers/registry';
import { sharedDatabase } from '../workers/shared';
import type { WorkflowDocument } from './schema';

/** Repair unset values in converted workflows without parsing or rejecting incomplete drafts. */
export function normalizeDocument(
    document: WorkflowDocument
): WorkflowDocument {
    return {
        ...document,
        jobs: document.jobs.map((job) => {
            const definition = workerByType(job.type);
            return definition
                ? {
                      ...job,
                      config: normalizeConfig(
                          definition.schema,
                          job.config
                      ) as typeof job.config,
                  }
                : job;
        }),
        ...(document.databaseConnections && {
            databaseConnections: document.databaseConnections.map(
                (connection) => ({
                    ...connection,
                    config: normalizeConfig(
                        sharedDatabase,
                        connection.config
                    ) as typeof connection.config,
                })
            ),
        }),
    };
}
