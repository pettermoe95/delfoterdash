import type { DashCue, DashLevel, DashState, Hazard } from './types';
import { worldFor } from './worlds';

export const GROUND = 450;
export const RIDER_WIDTH = 34;
export const RIDER_HEIGHT = 46;
const GRAVITY = 2400;
const JUMP = 850;
const FIXED_STEP = 1 / 120;

export function createDash(level: DashLevel): DashState {
    return {
        level,
        phase: 'ready',
        distance: 0,
        elapsed: 0,
        y: GROUND - RIDER_HEIGHT,
        velocity: 0,
        grounded: true,
        coyote: 0.08,
        buffer: 0,
        flip: 0,
        jumps: 0,
        phaseUntil: 0,
        phaseReadyAt: 0,
        shells: new Set(),
        used: new Set(),
        bursts: [],
        deathAge: 0,
    };
}
export function requestJump(game: DashState): DashCue[] {
    if (game.phase !== 'playing') return [];
    // Air rings require a fresh press; holding jump only chains ordinary landings.
    const orb = game.level.hazards.find(
        (h) =>
            h.kind === 'orb' &&
            !game.used.has(h.id) &&
            Math.hypot(
                h.x + h.width / 2 - game.distance,
                (h.y ?? 285) - (game.y + RIDER_HEIGHT / 2)
            ) < 58
    );
    if (orb && !game.grounded) {
        game.used.add(orb.id);
        game.velocity = -950;
        game.buffer = 0;
        game.flip = 0;
        game.bursts.push({
            x: game.distance,
            y: game.y + 24,
            age: 0,
            color: game.level.secondary,
            kind: 'spark',
        });
        return ['orb'];
    }
    game.buffer = 0.12;
    return [];
}
export function requestPhase(game: DashState): DashCue[] {
    if (
        game.phase !== 'playing' ||
        worldFor(game.level)?.ability !== 'phase' ||
        game.elapsed < game.phaseReadyAt
    )
        return [];
    game.phaseUntil = game.elapsed + 0.32;
    game.phaseReadyAt = game.elapsed + 1.4;
    game.bursts.push({
        x: game.distance,
        y: game.y + 25,
        age: 0,
        color: '#c8b4ff',
        kind: 'spark',
    });
    return ['phase'];
}
function overlaps(x: number, width: number, hazard: Hazard) {
    return x + width > hazard.x + 3 && x < hazard.x + hazard.width - 3;
}
function crash(game: DashState, cues: DashCue[]) {
    if (game.phase !== 'playing') return;
    game.phase = 'dead';
    game.deathAge = 0;
    game.bursts.push({
        x: game.distance,
        y: game.y + 25,
        age: 0,
        color: game.level.accent,
        kind: 'crash',
    });
    cues.push('crash');
}
function tick(game: DashState, dt: number, held: boolean, cues: DashCue[]) {
    game.elapsed += dt;
    game.bursts = game.bursts.filter((b) => (b.age += dt) < 1);
    game.buffer = Math.max(0, game.buffer - dt);
    game.coyote = game.grounded ? 0.08 : Math.max(0, game.coyote - dt);
    if ((held || game.buffer > 0) && (game.grounded || game.coyote > 0)) {
        game.velocity = -JUMP;
        game.grounded = false;
        game.coyote = 0;
        game.buffer = 0;
        game.jumps++;
        game.flip = 0;
        game.bursts.push({
            x: game.distance,
            y: game.y + RIDER_HEIGHT,
            age: 0,
            color: game.level.accent,
            kind: 'water',
        });
        cues.push('jump');
    }
    const wasGrounded = game.grounded;
    const previousBottom = game.y + RIDER_HEIGHT;
    game.distance += game.level.speed * dt;
    game.velocity += GRAVITY * dt;
    game.y += game.velocity * dt;
    if (!game.grounded) game.flip += dt;
    const left = game.distance - RIDER_WIDTH / 2;
    const nearby = game.level.hazards.filter(
        (h) => h.x < left + RIDER_WIDTH + 90 && h.x + h.width > left - 90
    );
    const gap = nearby.some(
        (h) =>
            h.kind === 'gap' &&
            game.distance > h.x + 3 &&
            game.distance < h.x + h.width - 3
    );
    let floor = gap ? Infinity : GROUND;
    for (const h of nearby)
        if (
            h.kind === 'block' &&
            overlaps(left, RIDER_WIDTH, h) &&
            previousBottom <= GROUND - h.height + 1 &&
            game.velocity >= 0
        )
            floor = Math.min(floor, GROUND - h.height);
    game.grounded = false;
    if (game.y + RIDER_HEIGHT >= floor && game.velocity >= 0) {
        if (previousBottom > floor + 8) {
            crash(game, cues);
            return;
        }
        game.y = floor - RIDER_HEIGHT;
        game.velocity = 0;
        game.grounded = true;
        game.flip = 0;
        if (!wasGrounded) {
            cues.push('land');
            game.bursts.push({
                x: game.distance,
                y: floor,
                age: 0,
                color: game.level.accent,
                kind: 'water',
            });
        }
    }
    for (const h of nearby) {
        if (h.kind === 'gap' || h.kind === 'orb') continue;
        if (h.kind === 'pad') {
            if (
                game.grounded &&
                overlaps(left, RIDER_WIDTH, h) &&
                !game.used.has(h.id)
            ) {
                game.used.add(h.id);
                game.velocity = -1080;
                game.grounded = false;
                game.coyote = 0;
                game.flip = 0;
                game.bursts.push({
                    x: h.x + h.width / 2,
                    y: GROUND,
                    age: 0,
                    color: game.level.secondary,
                    kind: 'spark',
                });
                cues.push('pad');
            }
            continue;
        }
        if (!overlaps(left, RIDER_WIDTH, h)) continue;
        const top = game.y + 5,
            bottom = game.y + RIDER_HEIGHT - 4;
        if (h.kind === 'laser') {
            if (
                game.elapsed >= game.phaseUntil &&
                bottom > GROUND - h.height &&
                top < GROUND
            )
                crash(game, cues);
        } else if (h.kind === 'block') {
            if (bottom > GROUND - h.height + 2 && top < GROUND)
                crash(game, cues);
        } else if (h.kind === 'saw') {
            const cx = h.x + h.width / 2,
                cy = GROUND - 35,
                r = h.width / 2 - 4;
            const x = Math.max(left + 4, Math.min(cx, left + RIDER_WIDTH - 4));
            const y = Math.max(top, Math.min(cy, bottom));
            if (Math.hypot(cx - x, cy - y) < r) crash(game, cues);
        } else {
            // Test each triangle, keeping the decorative surfboard out of the hitbox.
            for (let x = h.x; x < h.x + h.width; x += 34) {
                const height = h.height - 5;
                const fraction = Math.max(
                    0,
                    Math.min(1, (bottom - (GROUND - height)) / height)
                );
                if (
                    bottom > GROUND - height &&
                    top < GROUND - 3 &&
                    left + RIDER_WIDTH - 4 > x + 17 - 14 * fraction &&
                    left + 4 < x + 17 + 14 * fraction
                )
                    crash(game, cues);
            }
        }
    }
    if (game.y > 650) crash(game, cues);
    if (game.phase !== 'playing') return;
    for (const shell of game.level.shells) {
        if (
            !game.shells.has(shell.id) &&
            Math.hypot(shell.x - game.distance, shell.y - (game.y + 23)) < 35
        ) {
            game.shells.add(shell.id);
            cues.push('shell');
            game.bursts.push({
                x: shell.x,
                y: shell.y,
                age: 0,
                color: '#ffe398',
                kind: 'spark',
            });
        }
    }
    if (game.distance >= game.level.length) {
        game.phase = 'complete';
        cues.push('finish');
    }
}
export function advanceDash(
    game: DashState,
    seconds: number,
    held = false
): DashCue[] {
    if (!Number.isFinite(seconds) || seconds <= 0) return [];
    if (game.phase === 'dead') {
        game.deathAge += Math.min(seconds, 0.1);
        game.bursts = game.bursts.filter(
            (b) => (b.age += Math.min(seconds, 0.1)) < 1
        );
        return [];
    }
    if (game.phase !== 'playing') return [];
    const cues: DashCue[] = [];
    let remaining = Math.min(seconds, 0.1);
    while (remaining > 0.000001 && game.phase === 'playing') {
        const dt = Math.min(FIXED_STEP, remaining);
        tick(game, dt, held, cues);
        remaining -= dt;
    }
    return cues;
}
export const progress = (game: DashState) =>
    Math.min(100, Math.floor((game.distance / game.level.length) * 100));
