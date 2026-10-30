import { progress } from './engine';
import type { DashRecord, DashState } from './types';

const KEY = 'delfoter-dash-records-v1';
export function loadRecords(): Record<string, DashRecord> {
    try {
        const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
        if (!data || typeof data !== 'object') return {};
        return Object.fromEntries(
            Object.entries(data).filter(
                ([, value]) =>
                    value &&
                    typeof value === 'object' &&
                    typeof value.progress === 'number' &&
                    Number.isFinite(value.progress) &&
                    value.progress >= 0 &&
                    value.progress <= 100 &&
                    typeof value.shells === 'number' &&
                    Number.isFinite(value.shells) &&
                    value.shells >= 0 &&
                    typeof value.completed === 'boolean'
            )
        );
    } catch {
        return {};
    }
}
export function saveRecord(
    records: Record<string, DashRecord>,
    game: DashState
) {
    const previous = records[game.level.id];
    const next = {
        ...records,
        [game.level.id]: {
            progress: Math.max(previous?.progress ?? 0, progress(game)),
            shells: Math.max(previous?.shells ?? 0, game.shells.size),
            completed: !!previous?.completed || game.phase === 'complete',
        },
    };
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* Gameplay works without browser storage. */
    }
    return next;
}
