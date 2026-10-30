import { apiService } from '~/api/service';
import { z } from 'zod';
import { isRecord } from '../forms/schema';
import { convertLegacy } from '../legacy/convert';
import { resolvedConfig } from '../model/databaseConnections';
import { normalizeDocument } from '../model/normalizeDocument';
import {
    documentSchema,
    emptyDocument,
    incrementalSchema,
    schedulingSchema,
} from '../model/schema';
import type { WorkflowDocument } from '../model/schema';
import { normalizeConfig } from '../workers/normalizeConfig';
import { typeForWorker, workerByType } from '../workers/registry';

export const detailsSchema = z.object({
    id: z.string(),
    tenant_id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    configuration: z.string(),
    layout: z.string(),
    incremental_settings: z.string(),
    scheduling_meta: z.string(),
    last_start: z.number().nullable().optional(),
});
export type WorkflowDetails = z.infer<typeof detailsSchema>;
const parseOptional = (value: string) =>
    value.trim() ? (JSON.parse(value) as unknown) : undefined;

export function importDocument(value: unknown): WorkflowDocument {
    if (isRecord(value) && 'version' in value)
        return normalizeDocument(documentSchema.parse(value));
    return documentSchema.parse(convertLegacy(value));
}

/** Saved execution can still contain blanks from an earlier V2 conversion. */
export function configurationNeedsRepair(configuration: string): boolean {
    const parsed = parseOptional(configuration);
    if (!isRecord(parsed) || !Array.isArray(parsed.jobs)) return false;
    return parsed.jobs.some((job: unknown) => {
        if (
            !isRecord(job) ||
            typeof job.worker !== 'string' ||
            !isRecord(job.config)
        )
            return false;
        const definition = workerByType(typeForWorker(job.worker));
        return (
            definition !== undefined &&
            JSON.stringify(normalizeConfig(definition.schema, job.config)) !==
                JSON.stringify(job.config)
        );
    });
}
export function loadDocument(details: WorkflowDetails): WorkflowDocument {
    const layout = parseOptional(details.layout);
    if (isRecord(layout) && 'version' in layout)
        return normalizeDocument(documentSchema.parse(layout));
    const document = convertLegacy(
        layout,
        parseOptional(details.configuration)
    );
    const defaults = emptyDocument();
    const incremental = parseOptional(details.incremental_settings);
    const scheduling = parseOptional(details.scheduling_meta);
    if (
        isRecord(scheduling) &&
        scheduling.type === 'specificTime' &&
        typeof scheduling.time === 'string' &&
        /^\d:[0-5]\d$/.test(scheduling.time)
    )
        scheduling.time = `0${scheduling.time}`;
    if (isRecord(incremental) && incremental.type === 'rollingWindow') {
        incremental.amount_forward ??= incremental.amountForward;
        incremental.amount_backward ??= incremental.amountBackward;
    }
    return documentSchema.parse({
        ...document,
        incremental: incrementalSchema.parse(
            incremental ?? defaults.incremental
        ),
        scheduling: schedulingSchema.parse(scheduling ?? defaults.scheduling),
    });
}

export function buildRequest(document: WorkflowDocument) {
    // The API decodes these settings even for drafts. Keep incomplete values in
    // layout while sending valid defaults; incomplete workflows cannot be enabled.
    const scheduling = schedulingSchema.safeParse(document.scheduling);
    const incremental = incrementalSchema.safeParse(document.incremental);
    return {
        configuration: JSON.stringify({
            jobs: document.jobs.flatMap((job) => {
                const definition = workerByType(job.type);
                if (!definition) return [];
                const resolved = resolvedConfig(document, job);
                const config = normalizeConfig(definition.schema, resolved);
                const validated = definition.schema.safeParse(config);
                return [
                    {
                        ...job.execution,
                        jobId: job.id,
                        worker: definition.worker,
                        config: validated.success ? validated.data : config,
                        dependencies: job.dependencies,
                    },
                ];
            }),
        }),
        layout: JSON.stringify(normalizeDocument(document)),
        incremental_settings: JSON.stringify(
            incremental.success ? incremental.data : emptyDocument().incremental
        ),
        scheduling_meta: JSON.stringify(
            scheduling.success ? scheduling.data : emptyDocument().scheduling
        ),
    };
}
export async function fetchWorkflow(id: string) {
    return detailsSchema.parse(
        await apiService.getData(`/v1/admin/workflows/${id}`)
    );
}
export async function persistWorkflow(id: string, document: WorkflowDocument) {
    await apiService.postData(
        `/v1/admin/workflows/${id}`,
        buildRequest(document)
    );
}
export function downloadDocument(name: string, document: WorkflowDocument) {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(document, null, 2)], {
            type: 'application/json',
        })
    );
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${name}.workflow.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}
