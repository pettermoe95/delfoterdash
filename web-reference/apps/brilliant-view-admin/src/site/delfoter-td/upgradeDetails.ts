import type { TowerStats } from './types';

const number = (value: number) => Number(value.toFixed(3)).toString();
const percent = (value: number) => `${number(value * 100)}%`;
const seconds = (value: number) => `${number(value)}s`;

// Every numeric combat property has a player-facing label; new towers need no UI branches.
const STATS: Record<
    keyof TowerStats,
    { label: string; format: (value: number) => string }
> = {
    damage: { label: 'Damage per hit', format: number },
    range: { label: 'Range', format: number },
    cooldown: { label: 'Time between shots', format: seconds },
    splash: { label: 'Splash radius', format: number },
    splashEdgeDamage: { label: 'Damage at splash edge', format: percent },
    slow: { label: 'Slow strength before resistance', format: percent },
    slowDuration: { label: 'Slow duration', format: seconds },
    armorPierce: { label: 'Armor ignored', format: percent },
    shieldDamage: { label: 'Extra shield stripping per hit', format: number },
    slowPierce: { label: 'Slow resistance ignored', format: percent },
    slowStackFactor: { label: 'Extra chill contribution', format: percent },
    slowStackCap: { label: 'Maximum combined slow', format: percent },
    slowMaxStacks: { label: 'Miras that can combine chills', format: number },
};

export function upgradeChanges(
    before: TowerStats,
    changes: Partial<TowerStats>
) {
    return (Object.keys(changes) as (keyof TowerStats)[])
        .filter(
            (key) =>
                changes[key] !== undefined &&
                (before[key] ?? 0) !== changes[key]
        )
        .map((key) => ({
            key,
            label: STATS[key].label,
            before: STATS[key].format(before[key] ?? 0),
            after: STATS[key].format(changes[key]!),
        }));
}
