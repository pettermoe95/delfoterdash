import type { DashLevel, DashRecord, DashWorld } from './types';

export const DASH_WORLDS: DashWorld[] = [
    {
        id: 'neon',
        name: 'Neon Coast',
        subtitle:
            'Rooftop rhythms, neon tides, and your first air-ring flights.',
        theme: 'neon',
        accent: '#55f1ed',
        secondary: '#fb78be',
        sky: '#0a1530',
    },
    {
        id: 'frost',
        name: 'Frostbyte Fjord',
        subtitle:
            'Frozen spires, aurora skies, and laser gates. Learn to Phase through the light.',
        theme: 'frost',
        accent: '#a6dfff',
        secondary: '#c8b4ff',
        sky: '#0a1e32',
        ability: 'phase',
    },
];
export const worldFor = (level: DashLevel) =>
    DASH_WORLDS.find((world) => world.id === level.worldId)!;

export function worldUnlocked(
    worldId: string,
    levels: DashLevel[],
    records: Record<string, DashRecord>
) {
    const index = DASH_WORLDS.findIndex((world) => world.id === worldId);
    if (index < 0) return false;
    if (index === 0) return true;
    // Recheck every preceding world, so unlocking remains correct as new worlds are added.
    return DASH_WORLDS.slice(0, index).every((world) => {
        const previous = levels.filter((level) => level.worldId === world.id);
        return (
            previous.length > 0 &&
            previous.every((level) => records[level.id]?.completed)
        );
    });
}
