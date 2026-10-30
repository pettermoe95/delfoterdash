import { expect, it } from 'vitest';
import { createHistory, historyReducer } from '../state/history';
import { arrangeDocument } from './layout';
import { emptyDocument } from './schema';
import type { EditorJob } from './schema';

const job = (id: string, dependencies: string[] = []): EditorJob => ({
    id,
    name: id,
    type: 'JsonLoader',
    dependencies,
    position: { x: 900, y: 700 },
    config: { onlyIncludeKeys: ['id'] },
    execution: {},
});
it('arranges fan-in and disconnected workers without overlap, preserving data and supporting undo', () => {
    const document = {
        ...emptyDocument(),
        jobs: [
            job('target', ['a', 'b']),
            job('b'),
            job('a'),
            job('disconnected'),
        ],
    };
    const arranged = arrangeDocument(document);
    const target = arranged.jobs[0];
    expect(
        arranged.jobs
            .slice(1)
            .every((source) => source.position.x < target.position.x)
    ).toBe(true);
    expect(
        new Set(arranged.jobs.map((node) => JSON.stringify(node.position))).size
    ).toBe(4);
    expect(arranged.jobs[0].config).toBe(document.jobs[0].config);
    expect(arranged.jobs[0].dependencies).toEqual(['a', 'b']);
    expect(arrangeDocument(arranged)).toEqual(arranged);
    const history = historyReducer(createHistory(document), {
        type: 'edit',
        update: arrangeDocument,
    });
    expect(historyReducer(history, { type: 'undo' }).present).toEqual(document);
});
it('handles empty workflows and rejects cycles without changing positions', () => {
    expect(arrangeDocument(emptyDocument())).toEqual(emptyDocument());
    const document = {
        ...emptyDocument(),
        jobs: [job('a', ['b']), job('b', ['a'])],
    };
    expect(() => arrangeDocument(document)).toThrow('cyclic');
    expect(document.jobs[0].position).toEqual({ x: 900, y: 700 });
});
