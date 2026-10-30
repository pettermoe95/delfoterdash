import { describe, expect, it } from 'vitest';
import { advanceEnemy, hitEnemy } from './combat';
import { enemyDurability, killReward, waveDifficulty } from './difficulty';
import { BASE_ENEMY, ENEMIES } from './enemies';
import {
    canDeployAt,
    createGame,
    deployTower,
    placeTower,
    sellTower,
    startWave,
    step,
    upgradeTower,
} from './engine';
import { awardIncome } from './income';
import { distance, MAPS, pathLength, pathPosition } from './maps';
import { BASE_TOWER, TOWERS, towerStats } from './towers';
import type { Enemy, EnemyKind, GameState, Point, TowerKind } from './types';
import { FORMATIONS, WAVES, waveSpawns } from './waves';
import {
    aimWeapon,
    weaponGeometry,
    weaponMuzzle,
    weaponRecoil,
} from './weaponAim';

function enemy(kind: EnemyKind, health = 200): Enemy {
    return {
        id: 1000,
        kind,
        distance: 140,
        health,
        maxHealth: health,
        shield: 0,
        slowUntil: 0,
        slow: 0,
    };
}
function combat(kind: TowerKind, target: Enemy) {
    const game = createGame(MAPS[0]);
    game.coins = TOWERS[kind].cost + 100;
    placeTower(game, kind, 0);
    startWave(game);
    game.pending = [{ kind: 'drone', at: 100 }];
    game.enemies = [target];
    return game;
}
function advance(game: GameState, seconds: number) {
    for (let i = 0; i < seconds * 20 && game.phase === 'wave'; i++)
        step(game, 0.05);
}

describe('defender economy', () => {
    it('reduces all earned income by 20% while carrying fractional shells between payouts', () => {
        const game = createGame(MAPS[0]);
        expect(game.coins).toBe(300);
        awardIncome(game, 100);
        expect(game.coins).toBe(380);
        for (let i = 0; i < 5; i++) awardIncome(game, 1);
        expect(game.coins).toBe(384);
        expect(game.incomeRemainder).toBe(0);
        const clearedWave = createGame(MAPS[0]);
        clearedWave.phase = 'wave';
        clearedWave.wave = 1;
        step(clearedWave, 0.05);
        expect(clearedWave.coins).toBe(331);
        expect(clearedWave.incomeRemainder).toBe(20);
    });
    it('rejects invalid, occupied and unaffordable placements without charging', () => {
        const game = createGame(MAPS[0]);
        expect(deployTower(game, 'spritz', MAPS[0].path[2])).toBeNull();
        expect(deployTower(game, 'spritz', { x: 10, y: 10 })).toBeNull();
        expect(game.coins).toBe(300);
        expect(placeTower(game, 'spritz', -1)).toBe(false);
        expect(placeTower(game, 'sniper', 0)).toBe(true);
        expect(placeTower(game, 'spritz', 0)).toBe(false);
        expect(placeTower(game, 'soaker', 1)).toBe(false);
        expect(game.coins).toBe(100);
        expect(game.towers).toHaveLength(1);
        expect(
            deployTower(game, 'spritz', {
                x: MAPS[0].pads[0].x + 10,
                y: MAPS[0].pads[0].y + 5,
            })
        ).toBeNull();
        expect(deployTower(game, 'spritz', { x: 350, y: 220 })).not.toBeNull();
        expect(game.coins).toBe(35);
    });
    it('applies cumulative upgrades and refunds 80% of the actual investment once', () => {
        const game = createGame(MAPS[0]);
        game.coins = 1000;
        placeTower(game, 'spritz', 0);
        const tower = game.towers[0];
        expect(upgradeTower(game, tower.id)).toBe(true);
        expect(upgradeTower(game, tower.id)).toBe(true);
        expect(upgradeTower(game, tower.id)).toBe(false);
        expect(towerStats(tower)).toMatchObject({
            damage: 22,
            range: 155,
            slow: 0.55,
        });
        sellTower(game, tower.id);
        const balance = 1000 - 235 + Math.floor(235 * 0.8);
        expect(game.coins).toBe(balance);
        sellTower(game, tower.id);
        expect(game.coins).toBe(balance);
    });
});

describe('water and circuits', () => {
    it('aligns every defender barrel with targets in all eight directions, including mirrored and vertical aim', () => {
        const position = { x: 500, y: 300 };
        for (const definition of Object.values(TOWERS)) {
            const appearance = definition.appearance;
            const geometry = weaponGeometry(appearance);
            for (let direction = 0; direction < 8; direction++) {
                const radians = (direction * Math.PI) / 4;
                const target = {
                    x: position.x + Math.cos(radians) * 300,
                    y: position.y + Math.sin(radians) * 300,
                };
                const aim = aimWeapon(appearance, position, target);
                const pivot = {
                    x:
                        position.x +
                        geometry.pivot.x * appearance.scale * aim.facing,
                    y: position.y + geometry.pivot.y * appearance.scale,
                };
                const barrel = {
                    x: aim.muzzle.x - pivot.x,
                    y: aim.muzzle.y - pivot.y,
                };
                const flight = {
                    x: target.x - aim.muzzle.x,
                    y: target.y - aim.muzzle.y,
                };
                expect(barrel.x * flight.y - barrel.y * flight.x).toBeCloseTo(
                    0,
                    7
                );
                expect(
                    barrel.x * flight.x + barrel.y * flight.y
                ).toBeGreaterThan(0);
                expect(distance(aim.muzzle, position)).toBeGreaterThan(10);
            }
        }
    });
    it('launches water, snow and rockets from the animated weapon muzzle and settles recoil after firing', () => {
        for (const kind of Object.keys(TOWERS) as TowerKind[]) {
            const game = combat(kind, enemy('drone', 100000));
            step(game, 0.05);
            const tower = game.towers[0];
            const appearance = TOWERS[kind].appearance;
            const from =
                kind === 'rocketeer'
                    ? game.missiles[0].origin
                    : game.shots[0].from;
            expect(from).toEqual(
                weaponMuzzle(
                    appearance,
                    tower.position,
                    tower.angle,
                    tower.facing,
                    1
                )
            );
            expect(from).not.toEqual(tower.position);
            expect(weaponRecoil(appearance, game.time, tower.lastFiredAt)).toBe(
                1
            );
            expect(
                weaponRecoil(appearance, game.time + 1, tower.lastFiredAt)
            ).toBe(0);
        }
    });
    it('lets the 500-shell repeater track fast DelfIvers instead of a distracting sjark and unlocks huge range through upgrades', () => {
        const game = combat('repeater', enemy('sjark', 1000));
        game.enemies.push({
            ...enemy('delfiver', 220),
            id: 1001,
            distance: 210,
            shield: 80,
        });
        expect(TOWERS.repeater.cost).toBe(500);
        expect(towerStats(game.towers[0]).range).toBe(300);
        step(game, 0.05);
        expect(game.enemies[0].health).toBe(1000);
        expect(game.enemies[1].shield).toBeCloseTo(58.6);
        advance(game, 0.5);
        expect(game.enemies[1].health).toBeLessThan(220);
        expect(game.enemies[0].health).toBe(1000);
        game.coins = 2000;
        const tower = game.towers[0];
        upgradeTower(game, tower.id);
        expect(towerStats(tower).range).toBe(300);
        upgradeTower(game, tower.id);
        expect(towerStats(tower).range).toBe(600);
        upgradeTower(game, tower.id);
        expect(towerStats(tower).range).toBe(700);
        expect(sellTower(game, tower.id)).toBe(1640);
    });
    it('strips shields and pierces some slow resistance without turning support damage into hull damage', () => {
        const robot = { ...enemy('delfiver', 220), shield: 150 };
        const mist = TOWERS.frostMist;
        hitEnemy(robot, ENEMIES.delfiver, mist.stats, mist.damageType, 0);
        expect(robot.shield).toBe(69);
        expect(robot.health).toBe(220);
        expect(robot.slow).toBeCloseTo(0.3375);
        hitEnemy(robot, ENEMIES.delfiver, mist.stats, mist.damageType, 0.5);
        expect(robot.shield).toBe(0);
        expect(robot.health).toBe(219);
        hitEnemy(robot, ENEMIES.delfiver, mist.stats, mist.damageType, 1);
        expect(robot.health).toBe(218);
    });
    it('stacks chills from distinct Miras with diminishing returns, caps the slow, and expires each source independently', () => {
        const robot = enemy('drone', 10000);
        const stats = towerStats({
            kind: 'frostMist',
            level: 3,
        } as GameState['towers'][number]);
        hitEnemy(robot, ENEMIES.drone, stats, 'ice', 0, 1);
        hitEnemy(robot, ENEMIES.drone, stats, 'ice', 0.1, 1);
        expect(robot.slow).toBeCloseTo(0.6);
        hitEnemy(robot, ENEMIES.drone, stats, 'ice', 0.2, 2);
        expect(robot.slow).toBeCloseTo(0.75);
        for (let id = 3; id <= 8; id++)
            hitEnemy(robot, ENEMIES.drone, stats, 'ice', 0.2, id);
        expect(robot.slow).toBeCloseTo(0.75);
        advanceEnemy(robot, ENEMIES.drone, 0, 2.15);
        expect(robot.slow).toBeCloseTo(0.75);
        advanceEnemy(robot, ENEMIES.drone, 0, 2.21);
        expect(robot.slow).toBe(0);
        const courier = enemy('delfiver', 10000);
        hitEnemy(courier, ENEMIES.delfiver, stats, 'ice', 0, 1);
        hitEnemy(courier, ENEMIES.delfiver, stats, 'ice', 0.5, 2);
        hitEnemy(courier, ENEMIES.delfiver, stats, 'ice', 0.5, 3);
        expect(courier.slow).toBeCloseTo(0.5025 * (1 + 0.25 + 0.0625));
        advanceEnemy(courier, ENEMIES.delfiver, 0, 2.1);
        expect(courier.slow).toBeCloseTo(0.5025 * 1.25);
    });
    it('fires snow with a freeze cue, leaves temporary ice, and clears visual effects on reset', () => {
        const game = combat('frostMist', enemy('drone', 10000));
        expect(step(game, 0.05)).toContain('freeze');
        expect(game.shots[0].mode).toBe('snow');
        expect(game.frostPatches).toHaveLength(1);
        sellTower(game, game.towers[0].id);
        advance(game, 2);
        expect(game.frostPatches).toHaveLength(0);
        expect(createGame(MAPS[0]).frostPatches).toHaveLength(0);
    });
    it('flies a homing rocket before applying splash damage, even if its launcher is sold', () => {
        const game = combat('rocketeer', enemy('armored', 1000));
        step(game, 0.05);
        expect(game.enemies[0].health).toBe(1000);
        expect(game.missiles).toHaveLength(1);
        sellTower(game, game.towers[0].id);
        advance(game, 1);
        expect(game.missiles).toHaveLength(0);
        expect(game.enemies[0].health).toBeCloseTo(1000 - (420 - 7 * 0.25));
        expect(game.bursts.length).toBeGreaterThan(0);
    });
    it('combines custom armor piercing, resistance, shields, slow immunity and regeneration from properties', () => {
        const definition = {
            ...BASE_ENEMY,
            armor: 10,
            regeneration: 5,
            resistances: { water: 0.5 },
            slowResistance: 1,
        };
        const robot = { ...enemy('drone', 100), health: 80, shield: 15 };
        const attack = {
            ...BASE_TOWER.stats,
            damage: 50,
            armorPierce: 0.5,
            slow: 0.5,
            slowDuration: 3,
        };
        hitEnemy(robot, definition, attack, 'water', 0);
        expect(robot.shield).toBe(0);
        expect(robot.health).toBe(72.5);
        expect(robot.slowUntil).toBe(0);
        advanceEnemy(robot, definition, 1, 1);
        expect(robot.health).toBe(77.5);
        expect(robot.distance).toBe(188);
    });
    it('makes ordinary squirts slow armored robots while sniper bolts pierce armor', () => {
        const spritz = combat('spritz', enemy('armored'));
        const sniper = combat('sniper', enemy('armored'));
        step(spritz, 0.05);
        step(sniper, 0.05);
        expect(spritz.enemies[0].health).toBe(199);
        expect(sniper.enemies[0].health).toBe(115);
        const before = spritz.enemies[0].distance;
        step(spritz, 0.05);
        expect(spritz.enemies[0].distance - before).toBeCloseTo(
            34 * 0.05 * 0.7
        );
    });
    it('reduces premium splash damage away from the direct hit', () => {
        const game = combat('bigSpritz', enemy('drone', 1000));
        game.enemies.push({ ...enemy('drone', 1000), id: 1001, distance: 175 });
        step(game, 0.05);
        expect(game.enemies[1].health).toBe(920);
        expect(game.enemies[0].health).toBeCloseTo(944);
    });
    it('splashes nearby robots but never damages out-of-range bystanders', () => {
        const game = combat('soaker', enemy('drone'));
        game.enemies.push(
            { ...enemy('drone'), id: 1001, distance: 155 },
            { ...enemy('drone'), id: 1002, distance: 1000 }
        );
        step(game, 0.05);
        expect(game.enemies.map((robot) => robot.health)).toEqual([
            176, 176, 200,
        ]);
    });
});

describe('maps and wave lifecycle', () => {
    it.each([
        { kind: 'sjark', crew: 12, wave: 6 },
        { kind: 'reaperSjark', crew: 30, wave: 30 },
    ] as const)(
        'breaks $kind once, releasing $crew healthy enemies without clearing the wave or hitting them with the killing splash',
        ({ kind, crew, wave }) => {
            const game = combat('soaker', enemy(kind, 1));
            game.wave = wave;
            game.pending = [];
            const before = game.coins;
            step(game, 0.05);
            expect(game.phase).toBe('wave');
            expect(game.kills).toBe(1);
            expect(game.coins).toBe(
                before +
                    Math.floor(
                        killReward(ENEMIES[kind].reward, game.wave) * 0.8
                    )
            );
            expect(game.enemies).toHaveLength(crew);
            expect(new Set(game.enemies.map((robot) => robot.id)).size).toBe(
                crew
            );
            expect(
                game.enemies.every(
                    (robot) =>
                        robot.health === robot.maxHealth &&
                        robot.distance <= 142
                )
            ).toBe(true);
            expect(game.enemies[0].maxHealth).toBeCloseTo(
                ENEMIES.drone.health *
                    waveDifficulty(wave).health *
                    (ENEMIES[kind].onDeath?.durabilityMultiplier ?? 1)
            );
            const progress = game.enemies[0].distance;
            step(game, 0.05);
            expect(game.enemies[0].distance).toBeGreaterThan(progress);
            expect(game.enemies).toHaveLength(crew);
            expect(game.kills).toBe(1);
        }
    );
    it('lets an in-range sjark draw fire away from runners but never targets an out-of-range carrier', () => {
        const game = combat('sniper', enemy('sjark', 500));
        game.enemies.push({
            ...enemy('skitter', 300),
            id: 1001,
            distance: 250,
        });
        step(game, 0.05);
        expect(game.enemies[0].health).toBe(415);
        expect(game.enemies[1].health).toBe(300);
        game.enemies[0].distance = 1800;
        game.towers[0].cooldown = 0;
        step(game, 0.05);
        expect(game.enemies[1].health).toBe(215);
    });
    it('introduces the Reaper Sjark on wave 30 and sends fast followers after distracting carriers', () => {
        expect(
            WAVES.slice(0, 29).some((wave) =>
                wave.groups.some((group) => group.kind === 'reaperSjark')
            )
        ).toBe(false);
        expect(waveSpawns(29)[0].kind).toBe('reaperSjark');
        const convoy = waveSpawns(27);
        expect(convoy.slice(0, 2).map((spawn) => spawn.kind)).toEqual([
            'sjark',
            'sjark',
        ]);
        expect(convoy[2].kind).toBe('skitter');
        expect(convoy[2].at).toBe(8);
    });
    it('gives wave 30 a scaled boss hull, lighter cargo, and a small delayed escort while preserving later fleets', () => {
        const durability = enemyDurability(ENEMIES.reaperSjark, 30);
        expect(ENEMIES.reaperSjark.health * durability).toBeGreaterThan(40000);
        expect(ENEMIES.reaperSjark.health * durability).toBeLessThan(45000);
        expect(ENEMIES.reaperSjark.shield! * durability).toBeLessThan(3300);
        expect(
            WAVES[29].groups.map(({ kind, count }) => ({ kind, count }))
        ).toEqual([
            { kind: 'reaperSjark', count: 1 },
            { kind: 'skitter', count: 12 },
            { kind: 'delfiver', count: 4 },
        ]);
        expect(waveSpawns(29)[1].at).toBe(10);
        expect(WAVES[39].groups[0].count).toBe(2);
        expect(WAVES[49].groups[0].count).toBe(2);
        expect(enemyDurability(ENEMIES.reaperSjark, 40)).toBeGreaterThan(
            durability
        );
    });
    it('alternates spaced columns and burst swarms with visible tactical previews', () => {
        const column = waveSpawns(12);
        const swarm = waveSpawns(13);
        expect(WAVES[12].formation).toBe('column');
        expect(WAVES[13].formation).toBe('swarm');
        expect(
            Math.min(
                ...column
                    .slice(1)
                    .map((spawn, index) => spawn.at - column[index].at)
            )
        ).toBeGreaterThanOrEqual(2.8 - 1e-8);
        expect(
            Math.min(
                ...swarm
                    .slice(1)
                    .map((spawn, index) => spawn.at - swarm[index].at)
            )
        ).toBeLessThan(0.2);
        expect(
            Math.max(
                ...swarm
                    .slice(1)
                    .map((spawn, index) => spawn.at - swarm[index].at)
            )
        ).toBeGreaterThan(4);
        expect(FORMATIONS.column.hint).toContain('snipers');
        expect(killReward(12, 14)).toBeLessThan(killReward(12, 1));
    });
    it('introduces the sjark in wave six and keeps it out of the first five waves', () => {
        expect(WAVES).toHaveLength(50);
        expect(waveDifficulty(50).health).toBeGreaterThan(
            waveDifficulty(20).health * 3
        );
        expect(
            WAVES.slice(0, 5)
                .flatMap((wave) => wave.groups)
                .some((group) => group.kind === 'sjark')
        ).toBe(false);
        expect(waveSpawns(5).some((spawn) => spawn.kind === 'sjark')).toBe(
            true
        );
    });
    it.each(MAPS)(
        'requires premium defenders to survive the later chapters on $name',
        (map) => {
            const game = createGame(map);
            placeTower(game, 'spritz', 0);
            placeTower(game, 'soaker', 2);
            placeTower(game, 'spritz', 4);
            const plan = [
                'spritz',
                'sniper',
                'soaker',
                'soaker',
                'spritz',
                'sniper',
                'soaker',
                'sniper',
                'soaker',
                'soaker',
            ] as const;
            while (game.phase === 'build') {
                for (let pad = 0; pad < map.pads.length; pad++)
                    placeTower(game, plan[pad], pad);
                for (let level = 0; level < 2; level++)
                    for (const tower of game.towers)
                        upgradeTower(game, tower.id);
                startWave(game);
                advance(game, 220);
            }
            expect(game.phase).toBe('lost');
            expect(game.wave).toBeLessThan(35);
        }
    );
    it.each(MAPS)(
        'supports two defenders between the roads on $name',
        (map) => {
            const game = createGame(map);
            const positions =
                map.id === 'cove'
                    ? [
                          { x: 385, y: 260 },
                          { x: 385, y: 335 },
                      ]
                    : [
                          { x: 350, y: 180 },
                          { x: 350, y: 260 },
                      ];
            expect(deployTower(game, 'spritz', positions[0])).not.toBeNull();
            expect(deployTower(game, 'spritz', positions[1])).not.toBeNull();
        }
    );
    it.each(MAPS)(
        'keeps the legacy sniper-heavy defense from clearing the campaign unaided on $name',
        (map) => {
            const game = createGame(map);
            placeTower(game, 'spritz', 0);
            placeTower(game, 'soaker', 2);
            placeTower(game, 'spritz', 4);
            const positions: Point[] = [...map.pads];
            for (let x = 90; x < map.width - 70; x += 68)
                for (let y = 80; y < map.height - 55; y += 68)
                    positions.push({ x, y });
            const coverage = (point: Point) => {
                let score = 0;
                for (
                    let progress = 0;
                    progress < pathLength(map);
                    progress += 100
                )
                    if (distance(point, pathPosition(map, progress)) < 280)
                        score++;
                return score;
            };
            positions.sort((a, b) => coverage(b) - coverage(a));
            while (game.phase === 'build') {
                if (game.wave < 5) {
                    for (let level = 0; level < 2; level++)
                        for (const tower of game.towers)
                            upgradeTower(game, tower.id);
                } else {
                    const formation = WAVES[game.wave].formation;
                    const purchase = (kind: TowerKind) => {
                        const point = positions.find((point) =>
                            canDeployAt(game, point)
                        );
                        if (point) deployTower(game, kind, point);
                    };
                    const singleTargetWave = [
                        'column',
                        'bosses',
                        'runners',
                        'convoy',
                    ].includes(formation);
                    // Start anti-armor support before the first carrier; keep splash for swarm waves.
                    const snipers = game.towers.filter(
                        (tower) => tower.kind === 'sniper'
                    );
                    const desiredSnipers = 2 + Math.floor(game.wave / 2);
                    if (
                        snipers.length < desiredSnipers &&
                        (singleTargetWave || snipers.length < 2)
                    )
                        purchase('sniper');
                    for (let level = 0; level < 2; level++)
                        for (const tower of game.towers.filter(
                            (tower) => tower.kind === 'sniper'
                        ))
                            upgradeTower(game, tower.id);
                    const premium = game.towers.filter(
                        (tower) =>
                            tower.kind === 'bigSpritz' ||
                            tower.kind === 'rocketeer'
                    );
                    if (!singleTargetWave || game.wave > 10) {
                        if (
                            premium.length <
                            Math.min(4, 1 + Math.floor(game.wave / 7))
                        )
                            purchase(
                                premium.length % 3 === 2
                                    ? 'rocketeer'
                                    : 'bigSpritz'
                            );
                        for (let level = 0; level < 3; level++)
                            for (const tower of premium)
                                upgradeTower(game, tower.id);
                    }
                    // Spend surplus on the current wave's counter instead of leaving shells idle.
                    if (singleTargetWave) {
                        while (
                            game.coins >= 700 &&
                            positions.some((point) => canDeployAt(game, point))
                        ) {
                            purchase('sniper');
                            const last = game.towers.at(-1)!;
                            upgradeTower(game, last.id);
                            upgradeTower(game, last.id);
                        }
                    }
                }
                startWave(game);
                advance(game, 240);
            }
            expect(
                game.phase,
                `Ended on wave ${game.wave}, shells ${game.coins}, towers ${game.towers.length}`
            ).toBe('lost');
            expect(game.wave).toBeGreaterThanOrEqual(20);
            expect(game.wave).toBeLessThanOrEqual(50);
            expect(game.coins).toBeGreaterThanOrEqual(0);
        },
        20000
    );

    it.each(MAPS)(
        'lets a 12,650-shell mixed army clear the wave-30 introduction on $name',
        (map) => {
            const game = createGame(map);
            game.wave = 29;
            game.coins = 12650;
            const positions =
                map.id === 'cove'
                    ? [
                          { x: 640, y: 390 },
                          { x: 240, y: 70 },
                          { x: 880, y: 70 },
                          { x: 640, y: 550 },
                          { x: 400, y: 310 },
                          { x: 480, y: 150 },
                          { x: 960, y: 150 },
                          { x: 560, y: 70 },
                          { x: 720, y: 70 },
                      ]
                    : [
                          { x: 720, y: 470 },
                          { x: 400, y: 390 },
                          { x: 80, y: 550 },
                          { x: 640, y: 230 },
                          { x: 80, y: 230 },
                          { x: 80, y: 310 },
                          { x: 640, y: 470 },
                          { x: 800, y: 390 },
                          { x: 400, y: 470 },
                      ];
            const army = [
                ['repeater', 3],
                ['repeater', 3],
                ['repeater', 3],
                ['frostMist', 2],
                ['frostMist', 2],
                ['sniper', 2],
                ['sniper', 2],
                ['sniper', 2],
                ['rocketeer', 1],
            ] as const;
            army.forEach(([kind, level], index) => {
                const id = deployTower(game, kind, positions[index]);
                expect(id).not.toBeNull();
                for (let stage = 0; stage < level; stage++)
                    expect(upgradeTower(game, id!)).toBe(true);
            });
            expect(game.coins).toBe(0);
            startWave(game);
            advance(game, 240);
            expect(game.phase).toBe('build');
            expect(game.lives).toBe(20);
            expect(game.kills).toBe(47);
        }
    );

    it.each(['overlord', 'sjark', 'reaperSjark'] as const)(
        'deducts %s leak damage without releasing cargo and freezes the game on defeat',
        (kind) => {
            const game = combat('spritz', enemy(kind));
            game.enemies[0].distance = pathLength(game.map);
            game.lives = 5;
            step(game, 0.05);
            expect(game.lives).toBe(0);
            expect(game.phase).toBe('lost');
            expect(game.enemies).toHaveLength(0);
            const time = game.time;
            step(game, 0.05);
            expect(game.time).toBe(time);
        }
    );
});
