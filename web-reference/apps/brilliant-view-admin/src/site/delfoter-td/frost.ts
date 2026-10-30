import { distance } from './maps';
import type { GameState, Point, TowerStats } from './types';

// A visual footprint of the snow impact. Slow duration remains tied to the robot, not the ground.
export function leaveFrost(game: GameState, point: Point, stats: TowerStats) {
    const duration = Math.max(1, stats.slowDuration);
    const radius = Math.max(24, stats.splash);
    const nearby = game.frostPatches.find(
        (patch) => distance(patch.position, point) < radius * 0.45
    );
    if (nearby) {
        nearby.life = duration;
        nearby.duration = duration;
        nearby.radius = Math.max(nearby.radius, radius);
    } else {
        game.frostPatches.push({
            position: { ...point },
            life: duration,
            duration,
            radius,
        });
        // Bound purely cosmetic effects even in large late-game armies.
        if (game.frostPatches.length > 48) game.frostPatches.shift();
    }
}
