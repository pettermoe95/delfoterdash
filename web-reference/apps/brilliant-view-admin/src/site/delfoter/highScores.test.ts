import { expect, it } from 'vitest';
import { LocalStorageHighScoreStore } from './highScores';

function createStorage() {
    const values = new Map<string, string>();
    return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
    };
}

it('loads a stored record across adapter instances and never lowers it', async () => {
    const storage = createStorage();
    const first = new LocalStorageHighScoreStore(() => storage);
    expect(await first.getHighScore()).toBe(0);
    expect(await first.submitScore(15)).toBe(15);
    const nextVisit = new LocalStorageHighScoreStore(() => storage);
    expect(await nextVisit.getHighScore()).toBe(15);
    expect(await nextVisit.submitScore(5)).toBe(15);
    expect(await nextVisit.submitScore(20)).toBe(20);
});

it('treats malformed saved scores as zero', async () => {
    const store = new LocalStorageHighScoreStore(() => ({
        getItem: () => 'not-a-score',
        setItem: () => undefined,
    }));
    expect(await store.getHighScore()).toBe(0);
});

it('reports storage failures through the asynchronous interface', async () => {
    const store = new LocalStorageHighScoreStore(() => {
        throw new Error('Storage unavailable');
    });
    await expect(store.getHighScore()).rejects.toThrow('Storage unavailable');
    await expect(store.submitScore(5)).rejects.toThrow('Storage unavailable');
});
