import { applySlow, refreshSlows } from './slows';
import type { DamageType, Enemy, EnemyDefinition, TowerStats } from './types';

const fraction = (value: number) => Math.max(0, Math.min(1, value));

// Reusable mechanics operate on properties, never character IDs. Zero disables an effect.
export function advanceEnemy(
    enemy: Enemy,
    definition: EnemyDefinition,
    dt: number,
    time: number
) {
    refreshSlows(enemy, time);
    enemy.distance +=
        (enemy.speed ?? definition.speed) *
        dt *
        (time < enemy.slowUntil ? 1 - enemy.slow : 1);
    enemy.health = Math.min(
        enemy.maxHealth,
        enemy.health + definition.regeneration * dt
    );
}

export function hitEnemy(
    enemy: Enemy,
    definition: EnemyDefinition,
    attack: TowerStats,
    damageType: DamageType,
    time: number,
    sourceId?: number
) {
    const armor =
        (enemy.armor ?? definition.armor) * (1 - fraction(attack.armorPierce));
    const resistance = fraction(definition.resistances?.[damageType] ?? 0);
    const damage = Math.max(1, attack.damage - armor) * (1 - resistance);
    enemy.shield -= Math.min(
        enemy.shield,
        Math.max(0, attack.shieldDamage ?? 0)
    );
    const absorbed = Math.min(enemy.shield, damage);
    enemy.shield -= absorbed;
    enemy.health -= damage - absorbed;
    const slow =
        fraction(attack.slow) *
        (1 -
            fraction(definition.slowResistance ?? 0) *
                (1 - fraction(attack.slowPierce ?? 0)));
    applySlow(enemy, attack, slow, time, sourceId);
}
