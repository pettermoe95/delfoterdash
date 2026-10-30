import { hitEnemy } from './combat';
import { killReward } from './difficulty';
import { ENEMIES } from './enemies';
import { awardIncome } from './income';
import { distance, pathPosition } from './maps';
import type { DamageType, GameState, Point, Sound, TowerStats } from './types';

export function damageTargets(
    game: GameState,
    stats: TowerStats,
    damageType: DamageType,
    point: Point,
    primaryId: number,
    sounds: Sound[],
    sourceId?: number
) {
    for (const enemy of game.enemies) {
        if (
            enemy.health <= 0 ||
            (enemy.id !== primaryId &&
                (!stats.splash ||
                    distance(point, pathPosition(game.map, enemy.distance)) >
                        stats.splash))
        )
            continue;
        const definition = ENEMIES[enemy.kind];
        const offset =
            enemy.id === primaryId || !stats.splash
                ? 0
                : Math.min(
                      1,
                      distance(point, pathPosition(game.map, enemy.distance)) /
                          stats.splash
                  );
        const edgeDamage = Math.max(
            0,
            Math.min(1, stats.splashEdgeDamage ?? 1)
        );
        const hit = offset
            ? {
                  ...stats,
                  damage: stats.damage * (1 - offset * (1 - edgeDamage)),
              }
            : stats;
        hitEnemy(enemy, definition, hit, damageType, game.time, sourceId);
        if (enemy.health <= 0) {
            awardIncome(game, killReward(definition.reward, game.wave));
            game.kills++;
            sounds.push(definition.audio.death);
        }
    }
}

export function advanceMissiles(game: GameState, dt: number, sounds: Sound[]) {
    game.missiles = game.missiles.filter((missile) => {
        const target = game.enemies.find(
            (enemy) => enemy.id === missile.targetId && enemy.health > 0
        );
        if (target) missile.target = pathPosition(game.map, target.distance);
        const remaining = distance(missile.position, missile.target);
        const travel = (missile.style.speed ?? 340) * dt;
        if (remaining <= travel) {
            damageTargets(
                game,
                missile.stats,
                missile.damageType,
                missile.target,
                missile.targetId,
                sounds,
                missile.sourceId
            );
            game.bursts.push({
                position: { ...missile.target },
                life: 0.8,
                color: missile.style.particleColor,
                radius: missile.stats.splash,
            });
            sounds.push('rocket');
            return false;
        }
        missile.position.x +=
            ((missile.target.x - missile.position.x) / remaining) * travel;
        missile.position.y +=
            ((missile.target.y - missile.position.y) / remaining) * travel;
        return true;
    });
}
