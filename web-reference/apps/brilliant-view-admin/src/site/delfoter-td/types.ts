import type { CharacterAppearance } from './appearance';
import type { EnemyKind } from './enemies';
import type { TowerKind } from './towers';

export type Point = { x: number; y: number };

export type { EnemyKind } from './enemies';
export type { TowerKind } from './towers';
export type DamageType = 'water' | 'ice' | 'electric';
export type TowerStats = {
    damage: number;
    range: number;
    cooldown: number;
    splash: number;
    splashEdgeDamage?: number;
    slow: number;
    slowDuration: number;
    armorPierce: number;
    shieldDamage?: number;
    slowPierce?: number;
    slowStackFactor?: number;
    slowStackCap?: number;
    slowMaxStacks?: number;
};
export type CharacterDefinition = {
    name: string;
    description: string;
    color: string;
    appearance: CharacterAppearance;
};
export type ProjectileStyle = {
    mode?: 'stream' | 'rocket' | 'pellet' | 'snow';
    speed?: number;
    color: string;
    coreColor: string;
    width: number;
    particleColor: string;
};
export type TowerDefinition = CharacterDefinition & {
    role: string;
    cost: number;
    stats: TowerStats;
    damageType: DamageType;
    targeting?: 'first' | 'fastest';
    audio: { fire: Sound };
    projectile: ProjectileStyle;
    upgrades: { name: string; cost: number; stats: Partial<TowerStats> }[];
};
export type EnemyDefinition<Kind extends string = string> =
    CharacterDefinition & {
        health: number;
        speed: number;
        reward: number;
        armor: number;
        regeneration: number;
        leak: number;
        shield?: number;
        resistances?: Partial<Record<DamageType, number>>;
        slowResistance?: number;
        targetPriority?: number;
        durabilityScaling?: number;
        audio: { death: Sound; leak: Sound };
        onDeath?: {
            spawns: readonly { kind: Kind; count: number }[];
            spacing: number;
            durabilityMultiplier?: number;
            burst?: { color: string; radius: number };
        };
    };
export type GameMap = {
    width: number;
    height: number;
    home: Point;
    id: string;
    name: string;
    description: string;
    ground: string;
    path: Point[];
    pads: Point[];
};
export type Tower = {
    id: number;
    kind: TowerKind;
    position: Point;
    level: number;
    cooldown: number;
    spent: number;
    angle: number;
    facing?: 1 | -1;
    lastFiredAt?: number;
};
export type Enemy = {
    id: number;
    kind: EnemyKind;
    distance: number;
    health: number;
    maxHealth: number;
    shield: number;
    maxShield?: number;
    armor?: number;
    speed?: number;
    slowUntil: number;
    slow: number;
    slowEffects?: {
        source: number;
        strength: number;
        until: number;
        stackFactor: number;
        cap: number;
        maxStacks: number;
    }[];
};
export type FrostPatch = {
    position: Point;
    radius: number;
    life: number;
    duration: number;
};
export type Shot = ProjectileStyle & {
    from: Point;
    to: Point;
    life: number;
    duration?: number;
    splash: number;
};
export type Sound =
    | 'freeze'
    | 'repeater'
    | 'rocket'
    | 'spritz'
    | 'soaker'
    | 'sniper'
    | 'pop'
    | 'wave'
    | 'leak'
    | 'win';
export type GameState = {
    map: GameMap;
    phase: 'build' | 'wave' | 'won' | 'lost';
    wave: number;
    coins: number;
    incomeRemainder: number;
    lives: number;
    kills: number;
    time: number;
    nextId: number;
    towers: Tower[];
    enemies: Enemy[];
    shots: Shot[];
    missiles: {
        id: number;
        position: Point;
        origin: Point;
        target: Point;
        targetId: number;
        sourceId?: number;
        stats: TowerStats;
        damageType: DamageType;
        style: ProjectileStyle;
    }[];
    frostPatches: FrostPatch[];
    bursts: { position: Point; life: number; color: string; radius: number }[];
    pending: { kind: EnemyKind; at: number }[];
    waveTime: number;
};
