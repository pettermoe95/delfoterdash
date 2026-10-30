import { describe, expect, it } from 'vitest';
import { documentSchema, emptyDocument } from '../model/schema';
import type { EditorJob } from '../model/schema';
import { validateDocument } from '../model/validation';
import { createHistory, historyReducer } from './history';

const job = (id: string, dependencies: string[] = []): EditorJob => ({
    id,
    name: id,
    type: 'JsonLoader',
    config: {},
    dependencies,
    position: { x: 0, y: 0 },
    execution: {},
});

describe('drafts and history', () => {
    it('round-trips incomplete drafts but rejects them for execution', () => {
        const draft = {
            ...emptyDocument(),
            jobs: [
                { ...job('fetch'), type: 'JsonFetcher', config: { url: '' } },
            ],
            scheduling: { type: 'interval' },
        };
        const loaded = documentSchema.parse(JSON.parse(JSON.stringify(draft)));
        expect(loaded.jobs[0].config.url).toBe('');
        expect(
            validateDocument(loaded).some((issue) => issue.path === 'url')
        ).toBe(true);
        expect(
            validateDocument(loaded).some(
                (issue) => issue.path === 'scheduling.interval'
            )
        ).toBe(true);
    });
    it('groups drag changes into one undo step and clears redo after a new edit', () => {
        let history = createHistory({ ...emptyDocument(), jobs: [job('a')] });
        const move = (x: number) => ({
            type: 'edit' as const,
            group: 'move',
            update: (document: typeof history.present) => ({
                ...document,
                jobs: [{ ...document.jobs[0], position: { x, y: 0 } }],
            }),
        });
        history = historyReducer(history, move(10));
        history = historyReducer(history, move(20));
        expect(history.past).toHaveLength(1);
        history = historyReducer(history, { type: 'undo' });
        expect(history.present.jobs[0].position.x).toBe(0);
        history = historyReducer(history, { type: 'redo' });
        expect(history.present.jobs[0].position.x).toBe(20);
        history = historyReducer(history, { type: 'undo' });
        history = historyReducer(history, move(30));
        expect(history.future).toHaveLength(0);
    });
});
