import type { EditorJob } from '../../model/schema';
import { configuredColumns } from './columns';
import type { DimV2Config } from './definitions';

type Issue = { path: string; message: string };
export function validateDimInputs(
    job: EditorJob,
    upstream: EditorJob[]
): Issue[] {
    const issues: Issue[] = [];
    // Called by the registry only after the worker's Zod schema passes.
    const { inputs, merging, columnPriorities } = (job.config as DimV2Config)
        .dataConfig;
    const dependencies = new Set(job.dependencies);
    const inputIds = inputs.map((input) => input.jobId);
    if (
        new Set(inputIds).size !== inputIds.length ||
        inputIds.length !== dependencies.size ||
        inputIds.some((id) => !dependencies.has(id))
    )
        issues.push({
            path: 'dataConfig.inputs',
            message: 'Configure exactly one input for every connected worker.',
        });
    const outputIds = inputs.map(
        (input) => input.outputIdentityColumn || input.identityColumn
    );
    if (new Set(outputIds).size !== outputIds.length)
        issues.push({
            path: 'dataConfig.inputs',
            message: 'Output identity column names must be unique.',
        });
    for (const [index, merge] of merging.entries())
        if (
            !dependencies.has(merge.fromJobId) ||
            !dependencies.has(merge.toJobId) ||
            merge.fromJobId === merge.toJobId
        )
            issues.push({
                path: `dataConfig.merging.${index}`,
                message: 'Choose two different connected workers.',
            });
    const priorities = new Set<string>();
    for (const [index, priority] of columnPriorities.entries()) {
        if (priorities.has(priority.column))
            issues.push({
                path: `dataConfig.columnPriorities.${index}`,
                message: 'Configure each column priority only once.',
            });
        priorities.add(priority.column);
        if (
            priority.jobIds.some((id) => !dependencies.has(id)) ||
            new Set(priority.jobIds).size !== priority.jobIds.length
        )
            issues.push({
                path: `dataConfig.columnPriorities.${index}`,
                message: 'Choose distinct connected workers in priority order.',
            });
    }
    const exempt = new Set([
        ...inputs.map((input) => input.identityColumn),
        ...merging.flatMap((merge) => [merge.fromColumn, merge.toColumn]),
    ]);
    const counts = new Map<string, number>();
    for (const source of upstream)
        for (const column of configuredColumns(source.config))
            counts.set(column, (counts.get(column) ?? 0) + 1);
    for (const [column, count] of counts)
        if (
            count > 1 &&
            !exempt.has(column) &&
            !priorities.has(column) &&
            !column.startsWith('__') &&
            column !== 'master_id'
        )
            issues.push({
                path: 'dataConfig.columnPriorities',
                message: `Configure a priority for shared column "${column}".`,
            });
    return issues;
}
