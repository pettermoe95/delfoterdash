import type { EnemyDefinition } from './types';
import { FORMATIONS, WAVES } from './waves';

// Early pressure matters; later chapters add compound HP growth, speed and armor.
export function waveDifficulty(wave: number) {
    const level = Math.max(0, wave - 1);
    const formation = FORMATIONS[WAVES[wave - 1]?.formation ?? 'mixed'];
    const midgame = 1 + Math.min(0.75, Math.max(0, wave - 6) * 0.1);
    return {
        health:
            1.3 *
            (1 + level * 0.14) *
            Math.pow(1 + Math.max(0, wave - 10) * 0.065, 1.3) *
            midgame *
            formation.health,
        speed: (1 + Math.min(0.65, level * 0.012)) * formation.speed,
        armor: Math.floor(level / 5) * 1.5,
    };
}

export const waveBonus = (wave: number) => 35 + wave * 4;

export const killReward = (reward: number, wave: number) =>
    Math.max(
        1,
        Math.floor(
            reward * FORMATIONS[WAVES[wave - 1]?.formation ?? 'mixed'].reward
        )
    );

// Carrier hulls have their own growth curve instead of multiplying their huge base HP by the full infantry curve.
export function enemyDurability(definition: EnemyDefinition, wave: number) {
    const growth = Math.max(0, definition.durabilityScaling ?? 1);
    return 1 + (waveDifficulty(wave).health - 1) * growth;
}
