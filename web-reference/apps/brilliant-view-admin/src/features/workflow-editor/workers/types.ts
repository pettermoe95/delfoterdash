import type { z } from 'zod';
import type { EditorJob } from '../model/schema';

export type FieldHint = {
    label?: string;
    help?: string;
    control?: 'code' | 'credential' | 'column' | 'entity' | 'database';
    reference?: 'job';
    section?: string;
    layout?: 'compact';
    ordered?: boolean;
};
export type WorkerDefinition = {
    type: string;
    worker: string;
    name: string;
    category: 'Fetch' | 'Load' | 'Model' | 'Store';
    description: string;
    schema: z.ZodType<Record<string, unknown>, z.ZodTypeDef, unknown>;
    fields?: Partial<Record<string, FieldHint>>;
    onConfigChange?: (
        config: Record<string, unknown>,
        previous?: Record<string, unknown>
    ) => Record<string, unknown>;
    onDependenciesChange?: (
        config: Record<string, unknown>,
        dependencies: string[]
    ) => Record<string, unknown>;
    validate?: (
        job: EditorJob,
        upstream: EditorJob[]
    ) => { path: string; message: string }[];
};
