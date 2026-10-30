import type { Enemy, TowerStats } from './types';

const fraction = (value: number) => Math.max(0, Math.min(1, value));

export function refreshSlows(enemy: Enemy, time: number) {
    if (!enemy.slowEffects) return;
    const active = enemy.slowEffects.filter((effect) => effect.until > time);
    enemy.slowEffects = active;
    const stacking = active
        .filter((effect) => effect.stackFactor > 0)
        .sort((a, b) => b.strength - a.strength);
    const first = stacking[0];
    const combined = first
        ? Math.min(
              first.cap,
              stacking
                  .slice(0, first.maxStacks)
                  .reduce(
                      (total, effect, index) =>
                          total + effect.strength * first.stackFactor ** index,
                      0
                  )
          )
        : 0;
    // Ordinary slows retain strongest-effect behavior; stacking is opt-in per attack.
    enemy.slow = Math.max(
        combined,
        ...active
            .filter((effect) => !effect.stackFactor)
            .map((effect) => effect.strength),
        0
    );
    enemy.slowUntil = Math.max(time, ...active.map((effect) => effect.until));
}

export function applySlow(
    enemy: Enemy,
    attack: TowerStats,
    strength: number,
    time: number,
    source = 0
) {
    if (strength <= 0 || attack.slowDuration <= 0) return;
    // One effect per tower. Repeated fire refreshes a chill instead of adding stacks.
    enemy.slowEffects = (enemy.slowEffects ?? []).filter(
        (effect) => effect.source !== source && effect.until > time
    );
    enemy.slowEffects.push({
        source,
        strength: fraction(strength),
        until: time + attack.slowDuration,
        stackFactor: fraction(attack.slowStackFactor ?? 0),
        cap: fraction(attack.slowStackCap ?? 1),
        maxStacks: Math.max(1, Math.floor(attack.slowMaxStacks ?? 1)),
    });
    refreshSlows(enemy, time);
}
