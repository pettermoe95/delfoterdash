import { expect, it } from 'vitest';
import { createHistory, historyReducer } from '../state/history';
import { withDependencies } from './graph';
import { moveListItem, reorderListItem } from './listOrder';
import { emptyDocument } from './schema';
import type { EditorJob } from './schema';

it('moves items across multiple positions while retaining intervening order', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(reorderListItem(items, 0, 3)).toEqual(['b', 'c', 'd', 'a']);
    expect(reorderListItem(items, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(reorderListItem(items, 1, 1)).toBe(items);
    expect(reorderListItem(items, 0, 4)).toBe(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
});

it('reorders dependencies and Dim inputs together, retaining configuration and supporting undo', () => {
    const inputs = [
        {
            jobId: 'b',
            identityColumn: 'b_id',
            outputIdentityColumn: 'output_b',
        },
        { jobId: 'a', identityColumn: 'a_id' },
    ];
    const job: EditorJob = {
        id: 'dim',
        name: 'Dim',
        type: 'DimWorkerV2',
        dependencies: ['b', 'a'],
        config: {
            entity: 'employees',
            dataConfig: { inputs, merging: [], columnPriorities: [] },
        },
        execution: {},
        position: { x: 0, y: 0 },
    };
    const document = { ...emptyDocument(), jobs: [job] };
    const history = historyReducer(createHistory(document), {
        type: 'edit',
        update: (current) => ({
            ...current,
            jobs: [
                withDependencies(job, moveListItem(job.dependencies, 1, -1)),
            ],
        }),
    });
    expect(history.present.jobs[0].dependencies).toEqual(['a', 'b']);
    expect(history.present.jobs[0].config.dataConfig).toMatchObject({
        inputs: [inputs[1], inputs[0]],
    });
    expect(historyReducer(history, { type: 'undo' }).present).toEqual(document);
    expect(moveListItem(job.dependencies, 0, -1)).toBe(job.dependencies);
    expect(moveListItem(job.dependencies, 1, 1)).toBe(job.dependencies);
});
