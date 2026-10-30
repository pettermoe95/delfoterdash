import { z } from 'zod';
import { isRecord } from '../forms/schema';
import { normalizeDocument } from '../model/normalizeDocument';
import { emptyDocument, positionSchema } from '../model/schema';
import type { WorkflowDocument } from '../model/schema';
import { syncDimInputs } from '../workers/model/inputs';
import { typeForWorker } from '../workers/registry';
import { convertConfig, mergeResource } from './config';
import { normalizeLegacyUnsetValues } from './unsetValues';

const legacySchema = z.object({
    nodes: z.array(
        z
            .object({
                id: z.string(),
                type: z.string(),
                position: positionSchema,
                data: z.record(z.unknown()).optional(),
            })
            .passthrough()
    ),
    edges: z.array(
        z
            .object({
                source: z.string(),
                target: z.string(),
                type: z.string().optional(),
            })
            .passthrough()
    ),
    nodeConfigs: z.record(z.unknown()),
    reusableConfigs: z
        .array(
            z
                .object({
                    id: z.string(),
                    type: z.string(),
                    config: z.record(z.unknown()),
                })
                .passthrough()
        )
        .optional(),
});
const runtimeSchema = z.object({
    jobs: z.array(
        z
            .object({
                jobId: z.string(),
                worker: z.string(),
                config: z.record(z.unknown()),
                dependencies: z.array(z.string()).default([]),
            })
            .passthrough()
    ),
});
const resources = new Set(['CredentialProvider', 'DatabaseConfigProvider']);

/** One-way conversion only. Delete this folder after all layouts/exports use version 2. */
export function convertLegacy(
    layout: unknown,
    configuration?: unknown
): WorkflowDocument {
    const runtime =
        configuration == null ||
        (isRecord(configuration) && Object.keys(configuration).length === 0)
            ? undefined
            : runtimeSchema.parse(configuration);
    const blank =
        layout == null ||
        (isRecord(layout) && Object.keys(layout).length === 0);
    const legacy = blank ? undefined : legacySchema.parse(layout);
    const nodes =
        legacy?.nodes ??
        runtime?.jobs.map((job, index) => ({
            id: job.jobId,
            type: typeForWorker(job.worker),
            data: {},
            position: { x: index * 280, y: 100 },
        })) ??
        [];
    const source = [...nodes];
    // Do not lose executable jobs merely because their old layout was incomplete.
    for (const job of runtime?.jobs ?? [])
        if (!source.some((node) => node.id === job.jobId))
            source.push({
                id: job.jobId,
                type: typeForWorker(job.worker),
                data: {},
                position: { x: source.length * 280, y: 100 },
            });
    const jobs = source
        .filter((node) => !resources.has(node.type))
        .map((node) => {
            const savedJob = runtime?.jobs.find((job) => job.jobId === node.id);
            const raw = legacy?.nodeConfigs[node.id];
            const original = isRecord(raw) ? raw : {};
            // Layout includes fields that the old serializer omitted; execution config wins when both exist.
            let config = convertConfig(node.type, {
                ...original,
                ...savedJob?.config,
            });
            for (const [reference, templateType] of [
                ['credentialTemplateId', 'credential'],
                ['ingestorConfigTemplateId', 'ingestorConfig'],
            ] as const) {
                const templateId = original[reference];
                if (!templateId) continue;
                const template = legacy?.reusableConfigs?.find(
                    (item) =>
                        item.id === templateId && item.type === templateType
                );
                if (!template)
                    throw new Error(
                        `Missing shared configuration ${typeof templateId === 'string' ? templateId : '(invalid ID)'} for ${node.id}.`
                    );
                config = mergeResource(
                    config,
                    templateType === 'ingestorConfig'
                        ? { databaseConfig: template.config }
                        : convertConfig('CredentialProvider', template.config)
                );
            }
            for (const edge of legacy?.edges ?? []) {
                if (edge.target !== node.id) continue;
                const resource = nodes.find(
                    (item) =>
                        item.id === edge.source && resources.has(item.type)
                );
                if (!resource) continue;
                const rawResource = legacy?.nodeConfigs[resource.id];
                if (!isRecord(rawResource))
                    throw new Error(
                        `Missing configuration for resource ${resource.id}.`
                    );
                config = mergeResource(
                    config,
                    resource.type === 'DatabaseConfigProvider'
                        ? { databaseConfig: rawResource }
                        : convertConfig(resource.type, rawResource)
                );
            }
            // Resource/template values fill gaps; explicit executable values remain authoritative.
            config = normalizeLegacyUnsetValues(
                node.type,
                { ...config, ...savedJob?.config },
                savedJob?.config
            );
            const dependencyEdges =
                legacy?.edges
                    .filter(
                        (edge) =>
                            edge.target === node.id &&
                            !nodes.some(
                                (item) =>
                                    item.id === edge.source &&
                                    resources.has(item.type)
                            )
                    )
                    .map((edge) => edge.source) ?? [];
            const {
                jobId: _jobId,
                worker: _worker,
                config: _config,
                dependencies: _dependencies,
                ...execution
            } = savedJob ?? {};
            const dependencies = [
                ...new Set([
                    ...(savedJob?.dependencies ?? []),
                    ...dependencyEdges,
                ]),
            ];
            if (node.type === 'DimWorkerV2')
                config = syncDimInputs(config, dependencies);
            const label = isRecord(node.data) ? node.data.label : undefined;
            return {
                id: node.id,
                name: typeof label === 'string' ? label : node.id,
                type: node.type,
                config,
                dependencies,
                position: node.position,
                execution,
            };
        });
    return normalizeDocument({ ...emptyDocument(), jobs });
}
