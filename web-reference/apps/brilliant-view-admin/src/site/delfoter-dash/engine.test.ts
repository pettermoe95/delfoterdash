import { expect, it } from 'vitest';
import {
    advanceDash,
    createDash,
    GROUND,
    requestJump,
    requestPhase,
    RIDER_HEIGHT,
} from './engine';
import { DASH_LEVELS } from './levels';
import type { DashLevel, DashRecord, Hazard } from './types';
import { DASH_WORLDS, worldUnlocked } from './worlds';

const arena = (hazards: Hazard[]): DashLevel => ({
    ...DASH_LEVELS[0],
    length: 10000,
    hazards,
    shells: [],
});

it('collides with the first spike consistently at different frame rates while a timed jump clears it', () => {
    const deathPositions: number[] = [];
    for (const hz of [30, 60, 120]) {
        const game = createDash(DASH_LEVELS[0]);
        game.phase = 'playing';
        for (let i = 0; i < hz * 10 && game.phase === 'playing'; i++)
            advanceDash(game, 1 / hz);
        expect(game.phase).toBe('dead');
        deathPositions.push(game.distance);
    }
    expect(
        Math.max(...deathPositions) - Math.min(...deathPositions)
    ).toBeLessThan(4);
    const game = createDash(DASH_LEVELS[0]);
    game.phase = 'playing';
    while (game.distance < game.level.hazards[0].x - 80)
        advanceDash(game, 1 / 120);
    requestJump(game);
    for (let i = 0; i < 120; i++) advanceDash(game, 1 / 120);
    expect(game.phase).toBe('playing');
    expect(game.grounded).toBe(true);
});

function ride(level: DashLevel, rings = true, phase = true) {
    const game = createDash(level);
    game.phase = 'playing';
    for (let tick = 0; tick < 24000 && game.phase === 'playing'; tick++) {
        const upcoming = level.hazards.filter(
            (h) => h.x + h.width > game.distance - 20
        );
        if (
            phase &&
            upcoming.some(
                (h) =>
                    h.kind === 'laser' &&
                    h.x - game.distance < 22 &&
                    h.x - game.distance > -30
            )
        )
            requestPhase(game);
        const orb = upcoming.find(
            (h) =>
                h.kind === 'orb' &&
                !game.used.has(h.id) &&
                Math.abs(h.x + h.width / 2 - game.distance) < 8
        );
        if (
            rings &&
            orb &&
            !game.grounded &&
            Math.abs((orb.y ?? 285) - (game.y + 23)) < 54
        )
            requestJump(game);
        if (game.grounded) {
            const current = level.hazards.find(
                (h) =>
                    h.kind === 'block' &&
                    Math.abs(game.y + RIDER_HEIGHT - (GROUND - h.height)) < 1 &&
                    game.distance >= h.x - 14 &&
                    game.distance <= h.x + h.width + 14
            );
            let target: Pick<Hazard, 'x' | 'width' | 'height'> | undefined;
            if (current?.section?.toLowerCase().includes('pillars')) {
                target = level.hazards.find(
                    (h) =>
                        h.kind === 'block' &&
                        h.section === current.section &&
                        h.x > current.x
                );
                if (!target) {
                    const gap = level.hazards.find(
                        (h) => h.kind === 'gap' && h.section === current.section
                    )!;
                    target = { x: gap.x + gap.width, width: 160, height: 0 };
                }
            } else {
                const next = upcoming.find(
                    (h) =>
                        h.kind !== 'orb' &&
                        h.kind !== 'laser' &&
                        h.x + h.width > game.distance + 2
                );
                if (
                    next?.kind === 'gap' &&
                    next.section?.toLowerCase().includes('pillars')
                )
                    target = level.hazards.find(
                        (h) => h.kind === 'block' && h.section === next.section
                    );
                else if (
                    next &&
                    next.kind !== 'pad' &&
                    next.x - game.distance < 80 &&
                    next.x - game.distance > -20
                )
                    requestJump(game);
            }
            if (target) {
                const discriminant =
                    850 ** 2 +
                    4800 * (GROUND - target.height - (game.y + RIDER_HEIGHT));
                if (discriminant >= 0) {
                    const airtime = (850 + Math.sqrt(discriminant)) / 2400;
                    if (
                        game.distance >=
                        target.x + target.width / 2 - level.speed * airtime - 2
                    )
                        requestJump(game);
                }
            }
        }
        advanceDash(game, 1 / 120);
    }
    return game;
}

it.each(DASH_LEVELS)(
    'has a clearable route through $name with correctly timed rings, pillar landings and phase gates',
    (level) => {
        const game = ride(level);
        expect(game.phase).toBe('complete');
        expect(game.shells.size).toBeGreaterThan(0);
        for (const ring of level.hazards.filter(
            (h) => h.kind === 'orb' && h.required
        ))
            expect(game.used.has(ring.id)).toBe(true);
    }
);

it('introduces rings in level 3 and requires them over gaps that ordinary jumps cannot clear', () => {
    expect(
        DASH_LEVELS.slice(0, 2)
            .flatMap((level) => level.hazards)
            .some((h) => h.kind === 'orb')
    ).toBe(false);
    const level = DASH_LEVELS[2];
    const ring = level.hazards.find((h) => h.kind === 'orb')!;
    const gap = level.hazards.find(
        (h) => h.kind === 'gap' && h.section === ring.section
    )!;
    expect(ring.x).toBeGreaterThan(gap.x);
    expect(ring.x + ring.width).toBeLessThan(gap.x + gap.width);
    expect(gap.width / level.speed).toBeGreaterThan(0.9);
    const missed = ride(level, false);
    expect(missed.phase).toBe('dead');
    expect(missed.distance).toBeGreaterThan(gap.x);
    expect(missed.distance).toBeLessThan(gap.x + gap.width);
    const noPillars = {
        ...DASH_LEVELS[3],
        hazards: DASH_LEVELS[3].hazards.filter((h) => h.kind !== 'block'),
    };
    expect(ride(noPillars).phase).toBe('dead');
});

it('requires both level-5 rings during one uninterrupted airborne crossing', () => {
    const level = DASH_LEVELS.find(
        (level) => level.worldId === 'neon' && level.number === 5
    )!;
    const rings = level.hazards.filter((h) => h.kind === 'orb' && h.sequence);
    expect(rings.map((h) => h.sequence)).toEqual([1, 2]);
    const gap = level.hazards.find(
        (h) => h.kind === 'gap' && h.section === rings[0].section
    )!;
    expect(
        rings.every(
            (h) =>
                h.section === gap.section &&
                h.x > gap.x &&
                h.x + h.width < gap.x + gap.width
        )
    ).toBe(true);
    expect(
        level.hazards.some(
            (h) => h.kind === 'block' && h.x > gap.x && h.x < gap.x + gap.width
        )
    ).toBe(false);
    const cleared = ride(level);
    expect(cleared.phase).toBe('complete');
    for (const ring of rings) {
        expect(cleared.used.has(ring.id)).toBe(true);
        const missed = ride({
            ...level,
            hazards: level.hazards.filter((h) => h.id !== ring.id),
        });
        expect(missed.phase).toBe('dead');
        expect(missed.distance).toBeGreaterThan(gap.x);
        expect(missed.distance).toBeLessThan(gap.x + gap.width);
    }
});

it('unlocks a world only after every previous level is completed, keeping partial progress locked', () => {
    expect(DASH_WORLDS).toHaveLength(2);
    expect(
        DASH_WORLDS.map(
            (world) =>
                DASH_LEVELS.filter((level) => level.worldId === world.id).length
        )
    ).toEqual([5, 5]);
    const records: Record<string, DashRecord> = {};
    expect(worldUnlocked('neon', DASH_LEVELS, records)).toBe(true);
    for (const level of DASH_LEVELS.slice(0, 4))
        records[level.id] = { progress: 100, shells: 0, completed: true };
    records[DASH_LEVELS[4].id] = { progress: 100, shells: 0, completed: false };
    expect(worldUnlocked('frost', DASH_LEVELS, records)).toBe(false);
    records[DASH_LEVELS[4].id].completed = true;
    expect(worldUnlocked('frost', DASH_LEVELS, records)).toBe(true);
});

it('requires Phase for laser gates, enforces its recharge, and leaves ordinary hazards dangerous', () => {
    expect(ride(DASH_LEVELS[5], true, false).phase).toBe('dead');
    const game = createDash({ ...DASH_LEVELS[5], hazards: [], shells: [] });
    game.phase = 'playing';
    expect(requestPhase(game)).toEqual(['phase']);
    expect(requestPhase(game)).toEqual([]);
    for (let i = 0; i < 15; i++) advanceDash(game, 0.1);
    expect(game.elapsed).toBeGreaterThan(game.phaseUntil);
    expect(requestPhase(game)).toEqual(['phase']);
    const spike = createDash({
        ...DASH_LEVELS[5],
        hazards: [{ id: 1, kind: 'spike', x: 50, width: 34, height: 43 }],
        shells: [],
    });
    spike.phase = 'playing';
    requestPhase(spike);
    for (let i = 0; i < 30; i++) advanceDash(spike, 1 / 120);
    expect(spike.phase).toBe('dead');
    const neon = createDash(DASH_LEVELS[0]);
    neon.phase = 'playing';
    expect(requestPhase(neon)).toEqual([]);
});

it('lands on blocks, consumes air rings once, and keeps a paused run unchanged', () => {
    const game = createDash(
        arena([{ id: 1, kind: 'block', x: 100, width: 72, height: 54 }])
    );
    game.phase = 'playing';
    game.distance = 120;
    game.y = GROUND - 54 - RIDER_HEIGHT - 2;
    game.velocity = 200;
    game.grounded = false;
    advanceDash(game, 1 / 60);
    expect(game.phase).toBe('playing');
    expect(game.grounded).toBe(true);
    expect(game.y).toBe(GROUND - 54 - RIDER_HEIGHT);
    game.level = arena([
        {
            id: 2,
            kind: 'orb',
            x: game.distance - 18,
            width: 36,
            height: 36,
            y: game.y + 23,
        },
    ]);
    game.grounded = false;
    expect(requestJump(game)).toEqual(['orb']);
    expect(game.velocity).toBe(-950);
    expect(requestJump(game)).toEqual([]);
    expect(game.used.size).toBe(1);
    game.phase = 'paused';
    const before = {
        distance: game.distance,
        y: game.y,
        elapsed: game.elapsed,
    };
    advanceDash(game, 0.1, true);
    expect({
        distance: game.distance,
        y: game.y,
        elapsed: game.elapsed,
    }).toEqual(before);
    const fresh = createDash(game.level);
    expect(fresh.distance).toBe(0);
    expect(fresh.used.size).toBe(0);
    expect(fresh.shells.size).toBe(0);
});
