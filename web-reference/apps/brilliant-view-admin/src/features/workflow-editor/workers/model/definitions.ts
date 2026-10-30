import { z } from 'zod';
import { relationHints } from '../fieldHints';
import { optionalText, relations, strings, text } from '../shared';
import type { WorkerDefinition } from '../types';
import { syncDimInputs } from './inputs';
import { validateDimInputs } from './validate';

export const dimV2Schema = z
    .object({
        entity: text(),
        dataConfig: z
            .object({
                inputs: z
                    .array(
                        z
                            .object({
                                jobId: text(),
                                identityColumn: text(),
                                outputIdentityColumn: optionalText(),
                            })
                            .passthrough()
                    )
                    .min(1),
                merging: z
                    .array(
                        z
                            .object({
                                fromJobId: text(),
                                toJobId: text(),
                                fromColumn: text(),
                                toColumn: text(),
                            })
                            .passthrough()
                    )
                    .default([]),
                columnPriorities: z
                    .array(
                        z
                            .object({
                                column: text(),
                                jobIds: z.array(text()).min(1),
                            })
                            .passthrough()
                    )
                    .default([]),
                scd2Columns: strings().default([]),
            })
            .passthrough(),
    })
    .passthrough();
export const dimSchema = z.object({ entity: text(), relations }).passthrough();
export const factSchema = z
    .object({ entity: text(), dateKeyCol: optionalText(), relations })
    .passthrough();
export type DimV2Config = z.infer<typeof dimV2Schema>;
export type DimConfig = z.infer<typeof dimSchema>;
export type FactConfig = z.infer<typeof factSchema>;
export const modelWorkers: WorkerDefinition[] = [
    {
        type: 'DimWorkerV2',
        worker: 'DimWorkerV2',
        name: 'Dim V2',
        category: 'Model',
        description:
            'Combine connected inputs with identities, merge rules and column priorities.',
        schema: dimV2Schema,
        validate: validateDimInputs,
        onDependenciesChange: syncDimInputs,
        fields: {
            dataConfig: {
                label: '',
                section: 'Inputs',
                layout: 'compact',
                help: 'Add one input per connected worker. Column priorities run from highest to lowest precedence.',
            },
            'dataConfig.inputs.*.jobId': { label: 'Worker', reference: 'job' },
            'dataConfig.inputs.*.identityColumn': {
                label: 'Identity',
                control: 'column',
            },
            'dataConfig.inputs.*.outputIdentityColumn': {
                label: 'Output identity',
                control: 'column',
            },
            'dataConfig.merging.*.fromJobId': {
                label: 'From worker',
                reference: 'job',
            },
            'dataConfig.merging.*.toJobId': {
                label: 'To worker',
                reference: 'job',
            },
            'dataConfig.columnPriorities.*.jobIds': {
                label: 'Worker order',
                ordered: true,
            },
            'dataConfig.columnPriorities.*.jobIds.*': { reference: 'job' },
            'dataConfig.columnPriorities.*.column': { control: 'column' },
            'dataConfig.scd2Columns': {
                label: 'SCD2 columns',
                help: 'Columns whose changes should be tracked using SCD2 history.',
            },
            'dataConfig.scd2Columns.*': { control: 'column' },
            'dataConfig.merging.*.fromColumn': { control: 'column' },
            'dataConfig.merging.*.toColumn': { control: 'column' },
        },
    },
    {
        type: 'DimJob',
        worker: 'DimWorker',
        name: 'Dim (Legacy)',
        category: 'Model',
        description: 'Create a dimension using the legacy worker.',
        schema: dimSchema,
        fields: relationHints,
    },
    {
        type: 'FactJob',
        worker: 'FactWorker',
        name: 'Fact',
        category: 'Model',
        description: 'Build facts and entity relations.',
        schema: factSchema,
        fields: { ...relationHints, dateKeyCol: { control: 'column' } },
    },
];
