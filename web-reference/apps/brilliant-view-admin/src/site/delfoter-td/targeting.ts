import { ENEMIES } from './enemies';
import { distance, pathPosition } from './maps';
import { TOWERS, towerStats } from './towers';
import type { Enemy, GameState, Tower } from './types';

export function selectTarget(game: GameState, tower: Tower): Enemy | undefined {
    const definition = TOWERS[tower.kind];
    const range = towerStats(tower).range;
    const speed = (enemy: Enemy) =>
        (enemy.speed ?? ENEMIES[enemy.kind].speed) *
        (game.time < enemy.slowUntil ? 1 - enemy.slow : 1);
    return game.enemies
        .filter(
            (enemy) =>
                enemy.health > 0 &&
                distance(
                    tower.position,
                    pathPosition(game.map, enemy.distance)
                ) <= range
        )
        .sort((a, b) =>
            definition.targeting === 'fastest'
                ? speed(b) - speed(a) || b.distance - a.distance
                : (ENEMIES[b.kind].targetPriority ?? 0) -
                      (ENEMIES[a.kind].targetPriority ?? 0) ||
                  b.distance - a.distance
        )[0];
}
