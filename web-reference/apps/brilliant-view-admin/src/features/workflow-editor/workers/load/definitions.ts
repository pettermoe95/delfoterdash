import { z } from 'zod';
import { loaderHints } from '../fieldHints';
import { loaderFields, optionalText, stringMap } from '../shared';
import type { WorkerDefinition } from '../types';

export const jsonLoaderSchema = z
    .object({
        ...loaderFields,
        nestedEntityKey: optionalText(),
        keysFromParent: stringMap().nullable().optional(),
        dateKeyColumn: optionalText(),
        dataProp: optionalText(),
        ignoreToDate: z.boolean().default(false),
    })
    .passthrough();
export const sdmxSchema = z
    .object({
        ...loaderFields,
        inputFormat: z.enum(['auto', 'xml', 'json']).default('auto'),
        recordMode: z.enum(['observation', 'series']).default('observation'),
        seriesFilter: stringMap().nullable().optional(),
        rootJsonPath: optionalText(),
        includeDatasetAttributes: z.boolean().default(true),
        includeSeriesAttributes: z.boolean().default(true),
        includeObservationAttributes: z.boolean().default(true),
        seriesKeyPrefix: z.string().default(''),
        datasetAttributePrefix: z.string().default(''),
        seriesAttributePrefix: z.string().default(''),
        observationKeyPrefix: z.string().default(''),
        observationAttributePrefix: z.string().default(''),
        observationValueColumn: z.string().default('value'),
        observationTimeColumn: z.string().default('time_period'),
        observationDimensionIdColumn: z.string().default('obs_dimension_id'),
        observationValueAttribute: z.string().default('OBS_VALUE'),
        observationTimeAttribute: z.string().default('TIME_PERIOD'),
        dropRowsWithoutObservationValue: z.boolean().default(false),
    })
    .passthrough();
export type JsonLoaderConfig = z.infer<typeof jsonLoaderSchema>;
export type SdmxConfig = z.infer<typeof sdmxSchema>;
export const loaders: WorkerDefinition[] = [
    {
        type: 'JsonLoader',
        worker: 'JsonLoader',
        name: 'JSON Loader',
        category: 'Load',
        description: 'Extract, filter and coerce JSON records.',
        schema: jsonLoaderSchema,
        fields: { ...loaderHints, dateKeyColumn: { control: 'column' } },
    },
    {
        type: 'SDMXLoader',
        worker: 'SDMXLoader',
        name: 'SDMX Loader',
        category: 'Load',
        description: 'Load SDMX observations from XML or JSON.',
        schema: sdmxSchema,
        fields: {
            ...Object.fromEntries(
                Object.keys(sdmxSchema.shape).map((key) => [
                    key,
                    {
                        section:
                            key.includes('Prefix') ||
                            key.startsWith('observation')
                                ? 'Columns'
                                : 'Configuration',
                    },
                ])
            ),
            ...loaderHints,
        },
    },
];
