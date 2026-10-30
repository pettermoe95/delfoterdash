import { advanceEnemy } from './combat';
import { enemyDurability, waveBonus, waveDifficulty } from './difficulty';
import { ENEMIES } from './enemies';
import { leaveFrost } from './frost';
import { awardIncome } from './income';
import { distance, distanceToPath, pathLength, pathPosition } from './maps';
import { advanceMissiles, damageTargets } from './projectiles';
import { selectTarget } from './targeting';
import { TOWERS, towerStats } from './towers';
import type {
    Enemy,
    EnemyKind,
    GameMap,
    GameState,
    Point,
    Sound,
    TowerKind,
} from './types';
import { WAVES, waveSpawns } from './waves';
import { aimWeapon } from './weaponAim';

export function createGame(map: GameMap): GameState {
    return {
        map,
        phase: 'build',
        wave: 0,
        coins: 300,
        incomeRemainder: 0,
        lives: 20,
        kills: 0,
        time: 0,
        nextId: 1,
        towers: [],
        enemies: [],
        shots: [],
        missiles: [],
        bursts: [],
        frostPatches: [],
        pending: [],
        waveTime: 0,
    };
}

function spawnEnemy(
    game: GameState,
    kind: EnemyKind,
    progress = 0,
    durabilityMultiplier = 1
): Enemy {
    const definition = ENEMIES[kind];
    const scaling = waveDifficulty(game.wave);
    const durability =
        enemyDurability(definition, game.wave) * durabilityMultiplier;
    const health = definition.health * durability;
    return {
        id: game.nextId++,
        kind,
        distance: Math.max(0, progress),
        health,
        maxHealth: health,
        shield: (definition.shield ?? 0) * durability,
        maxShield: (definition.shield ?? 0) * durability,
        armor: definition.armor + scaling.armor,
        speed: definition.speed * scaling.speed,
        slowUntil: 0,
        slow: 0,
    };
}
export function placeTower(game: GameState, kind: TowerKind, pad: number) {
    const position = game.map.pads[pad];
    return position ? deployTower(game, kind, position) !== null : false;
}

export function canDeployAt(game: GameState, position: Point) {
    return (
        Number.isFinite(position.x) &&
        Number.isFinite(position.y) &&
        position.x >= 50 &&
        position.x <= game.map.width - 70 &&
        position.y >= 50 &&
        position.y <= game.map.height - 55 &&
        distanceToPath(game.map, position) >= 55 &&
        distance(position, game.map.home) >= 70 &&
        game.towers.every((tower) => distance(tower.position, position) >= 66)
    );
}

export function deployTower(
    game: GameState,
    kind: TowerKind,
    position: Point
): number | null {
    if (
        !['build', 'wave'].includes(game.phase) ||
        !canDeployAt(game, position) ||
        game.coins < TOWERS[kind].cost
    )
        return null;
    game.coins -= TOWERS[kind].cost;
    const id = game.nextId++;
    game.towers.push({
        id,
        kind,
        position: { ...position },
        level: 0,
        cooldown: 0,
        spent: TOWERS[kind].cost,
        angle: 0,
    });
    return id;
}
export function upgradeTower(game: GameState, id: number) {
    const tower = game.towers.find((item) => item.id === id);
    if (!tower || !['build', 'wave'].includes(game.phase)) return false;
    const upgrade = TOWERS[tower.kind].upgrades[tower.level];
    if (!upgrade || game.coins < upgrade.cost) return false;
    game.coins -= upgrade.cost;
    tower.spent += upgrade.cost;
    tower.level++;
    return true;
}
export const SELL_REFUND = 0.8;
export const sellValue = (tower: GameState['towers'][number]) =>
    Math.floor((tower.spent * Math.round(SELL_REFUND * 100)) / 100);

export function sellTower(game: GameState, id: number) {
    const tower = game.towers.find((item) => item.id === id);
    if (!tower || !['build', 'wave'].includes(game.phase)) return 0;
    const refund = sellValue(tower);
    game.coins += refund;
    game.towers = game.towers.filter((item) => item.id !== id);
    return refund;
}
export function startWave(game: GameState) {
    if (game.phase !== 'build' || game.wave >= WAVES.length) return false;
    game.pending = waveSpawns(game.wave);
    game.wave++;
    game.waveTime = 0;
    game.phase = 'wave';
    return true;
}

// Mutates one simulation state. The React layer controls pause/speed and never supplies wall-clock jumps.
export function step(game: GameState, dt: number): Sound[] {
    if (game.phase !== 'wave' || dt <= 0 || !Number.isFinite(dt)) return [];
    dt = Math.min(dt, 0.05);
    const sounds: Sound[] = [];
    game.time += dt;
    game.waveTime += dt;
    game.shots = game.shots.filter((shot) => (shot.life -= dt) > 0);
    game.frostPatches = game.frostPatches.filter(
        (patch) => (patch.life -= dt) > 0
    );
    game.bursts = game.bursts.filter((burst) => (burst.life -= dt) > 0);
    while (game.pending.length && game.pending[0].at <= game.waveTime) {
        const spawn = game.pending.shift()!;
        game.enemies.push(spawnEnemy(game, spawn.kind));
    }
    const length = pathLength(game.map);
    game.enemies = game.enemies.filter((enemy) => {
        const definition = ENEMIES[enemy.kind];
        advanceEnemy(enemy, definition, dt, game.time);
        if (enemy.distance < length) return true;
        game.lives = Math.max(0, game.lives - definition.leak);
        sounds.push(definition.audio.leak);
        return false;
    });
    if (game.lives === 0) {
        game.phase = 'lost';
        return sounds;
    }
    advanceMissiles(game, dt, sounds);
    for (const tower of game.towers) {
        tower.cooldown -= dt;
        if (tower.cooldown > 0) continue;
        const stats = towerStats(tower);
        const target = selectTarget(game, tower);
        if (!target) continue;
        const to = pathPosition(game.map, target.distance);
        const definition = TOWERS[tower.kind];
        const aim = aimWeapon(definition.appearance, tower.position, to);
        tower.angle = aim.angle;
        tower.facing = aim.facing;
        tower.lastFiredAt = game.time;
        const from = aim.muzzle;
        tower.cooldown = stats.cooldown;
        sounds.push(definition.audio.fire);
        if (definition.projectile.mode === 'rocket') {
            game.missiles.push({
                id: game.nextId++,
                origin: { ...from },
                position: { ...from },
                target: to,
                targetId: target.id,
                sourceId: tower.id,
                stats,
                damageType: definition.damageType,
                style: definition.projectile,
            });
        } else {
            const duration =
                definition.projectile.mode === 'snow' ? 0.36 : 0.18;
            if (definition.projectile.mode === 'snow')
                leaveFrost(game, to, stats);
            game.shots.push({
                from,
                to,
                life: duration,
                duration,
                splash: stats.splash,
                ...definition.projectile,
            });
            damageTargets(
                game,
                stats,
                definition.damageType,
                to,
                target.id,
                sounds,
                tower.id
            );
        }
    }
    // Release cargo after all shots resolve: the killing splash cannot also wipe out the crew.
    const survivors: Enemy[] = [];
    for (const enemy of game.enemies) {
        if (enemy.health > 0) {
            survivors.push(enemy);
            continue;
        }
        const cargo = ENEMIES[enemy.kind].onDeath;
        if (!cargo) continue;
        let index = 0;
        for (const group of cargo.spawns) {
            for (let i = 0; i < group.count; i++)
                survivors.push(
                    spawnEnemy(
                        game,
                        group.kind,
                        enemy.distance - index++ * cargo.spacing,
                        cargo.durabilityMultiplier ?? 1
                    )
                );
        }
        if (cargo.burst)
            game.bursts.push({
                position: pathPosition(game.map, enemy.distance),
                life: 0.8,
                ...cargo.burst,
            });
    }
    game.enemies = survivors;
    if (!game.pending.length && !game.enemies.length) {
        awardIncome(game, waveBonus(game.wave));
        game.shots = [];
        game.missiles = [];
        game.bursts = [];
        game.frostPatches = [];
        game.phase = game.wave === WAVES.length ? 'won' : 'build';
        sounds.push(game.phase === 'won' ? 'win' : 'wave');
    }
    return sounds;
}
