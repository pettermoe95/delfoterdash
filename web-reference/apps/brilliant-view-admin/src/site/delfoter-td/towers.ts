import { DEFENDER_APPEARANCE } from './appearance';
import type { Tower, TowerDefinition, TowerStats } from './types';

export const BASE_TOWER: TowerDefinition = {
    name: 'New Delfoter',
    description: '',
    role: 'Water defender',
    color: '#38bdf8',
    cost: 65,
    stats: {
        damage: 8,
        range: 140,
        cooldown: 0.55,
        splash: 0,
        slow: 0,
        slowDuration: 1.2,
        armorPierce: 0,
    },
    damageType: 'water',
    appearance: {
        ...DEFENDER_APPEARANCE,
        sprite: { type: 'defender', equipment: 'squirt' },
    },
    audio: { fire: 'spritz' },
    projectile: {
        color: '#3bc8ff',
        coreColor: '#deffff',
        width: 3,
        particleColor: '#9cf8ff',
    },
    upgrades: [],
};

const definitions = {
    spritz: {
        name: 'Pip · Little Spritz',
        role: 'Fast squirts + slow',
        color: '#38bdf8',
        cost: 65,
        description:
            'Tiny paws, mighty cheeks. Quick little squirts slow robot feet by 30%.',
        stats: {
            damage: 8,
            range: 140,
            cooldown: 0.55,
            splash: 0,
            slow: 0.3,
            slowDuration: 1.2,
            armorPierce: 0,
        },
        damageType: 'water',
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: { type: 'defender', equipment: 'squirt' },
        },
        audio: { fire: 'spritz' },
        projectile: { ...BASE_TOWER.projectile, width: 3 },
        upgrades: [
            {
                name: 'Bubble cheeks',
                cost: 60,
                stats: { damage: 14, range: 155 },
            },
            {
                name: 'Brain freeze',
                cost: 110,
                stats: { damage: 22, cooldown: 0.35, slow: 0.55 },
            },
        ],
    },
    soaker: {
        name: 'Mochi · Super Soaker',
        role: 'Splash crowd control',
        color: '#a78bfa',
        cost: 140,
        description:
            'A very large water blaster for a very small Delfoter. Soaks nearby circuits too.',
        stats: {
            damage: 24,
            range: 165,
            cooldown: 1.15,
            splash: 60,
            slow: 0,
            slowDuration: 1.2,
            armorPierce: 0,
        },
        damageType: 'water',
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: { type: 'defender', equipment: 'blaster' },
        },
        audio: { fire: 'soaker' },
        projectile: { ...BASE_TOWER.projectile, width: 7 },
        upgrades: [
            {
                name: 'Pressure tank',
                cost: 100,
                stats: { damage: 40, splash: 75 },
            },
            {
                name: 'Monsoon mode',
                cost: 180,
                stats: { damage: 65, cooldown: 0.85, splash: 95 },
            },
        ],
    },
    sniper: {
        name: 'Skipper · Reef Sniper',
        role: 'Long range · pierces armor',
        color: '#fbbf24',
        cost: 200,
        description:
            'One eye closed. One perfect water bolt. Ignores armor and reaches across the reef.',
        stats: {
            damage: 85,
            range: 340,
            cooldown: 2.1,
            splash: 0,
            slow: 0,
            slowDuration: 1.2,
            armorPierce: 1,
        },
        damageType: 'water',
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: { type: 'defender', equipment: 'rifle' },
        },
        audio: { fire: 'sniper' },
        projectile: { ...BASE_TOWER.projectile, width: 3 },
        upgrades: [
            {
                name: 'Scope & a sip',
                cost: 140,
                stats: { damage: 140, range: 400 },
            },
            {
                name: 'Rail-water cannon',
                cost: 360,
                stats: { damage: 480, cooldown: 1.6 },
            },
        ],
    },
    repeater: {
        ...BASE_TOWER,
        name: 'Finn · Riptide Repeater',
        role: 'Rapid water bullets · fastest targets',
        color: '#a3e635',
        cost: 500,
        description:
            'Low damage per bullet, ten squirts a second. Finn tracks the fastest robots instead of being distracted by sjarks. Upgrade the scope for enormous coverage.',
        stats: {
            ...BASE_TOWER.stats,
            damage: 24,
            range: 300,
            cooldown: 0.1,
            armorPierce: 0.35,
        },
        targeting: 'fastest',
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: {
                type: 'image',
                src: '/delfoter-td/riptide-repeater.svg',
                bodySrc: '/delfoter-td/riptide-repeater-body.svg',
                weapon: {
                    src: '/delfoter-td/riptide-repeater-weapon.svg',
                    pivot: { x: 138, y: 130 },
                    muzzle: { x: 242, y: 123 },
                    recoil: 3,
                    recoilDuration: 0.06,
                    effect: 'water',
                },
                frameWidth: 256,
                frameHeight: 192,
                frames: 1,
                fps: 0,
                width: 125,
                height: 94,
            },
            portraitViewBox: '-70 -55 140 110',
        },
        audio: { fire: 'repeater' },
        projectile: {
            ...BASE_TOWER.projectile,
            mode: 'pellet',
            width: 3,
            color: '#a4f9da',
            particleColor: '#cefff4',
        },
        upgrades: [
            {
                name: 'Pressurized drum',
                cost: 250,
                stats: { damage: 44, cooldown: 0.09, armorPierce: 0.5 },
            },
            {
                name: 'Horizon sight',
                cost: 450,
                stats: { range: 600, damage: 64 },
            },
            {
                name: 'Fjord-wide coverage',
                cost: 850,
                stats: {
                    range: 700,
                    damage: 88,
                    cooldown: 0.075,
                    armorPierce: 0.65,
                },
            },
        ],
    },
    frostMist: {
        ...BASE_TOWER,
        name: 'Mira · Frost Mist',
        role: 'Runner slows + shield stripping',
        color: '#c4a1ff',
        cost: 400,
        description:
            'Snow chills fast robots and strips shields. Up to 3 Miras combine their slows with diminishing returns, capped at 75%. Each Mira refreshes her own chill.',
        damageType: 'ice',
        targeting: 'fastest',
        stats: {
            ...BASE_TOWER.stats,
            damage: 5,
            range: 190,
            cooldown: 1.2,
            splash: 65,
            slow: 0.5,
            slowDuration: 1.6,
            slowPierce: 0.5,
            shieldDamage: 80,
            slowStackFactor: 0.25,
            slowStackCap: 0.75,
            slowMaxStacks: 3,
        },
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: {
                type: 'image',
                src: '/delfoter-td/frost-mist.svg',
                bodySrc: '/delfoter-td/frost-mist-body.svg',
                weapon: {
                    src: '/delfoter-td/frost-mist-weapon.svg',
                    pivot: { x: 138, y: 129 },
                    muzzle: { x: 234, y: 121 },
                    recoil: 3,
                    recoilDuration: 0.18,
                    effect: 'snow',
                },
                frameWidth: 256,
                frameHeight: 192,
                frames: 1,
                fps: 0,
                width: 125,
                height: 94,
            },
            portraitViewBox: '-70 -55 140 110',
        },
        audio: { fire: 'freeze' },
        projectile: {
            ...BASE_TOWER.projectile,
            mode: 'snow',
            color: '#cbaaff',
            coreColor: '#f2ebff',
            width: 8,
            particleColor: '#e3d0ff',
        },
        upgrades: [
            {
                name: 'Can opener',
                cost: 250,
                stats: { shieldDamage: 130, range: 210 },
            },
            {
                name: 'Polar paws',
                cost: 500,
                stats: { slow: 0.6, slowDuration: 2, splash: 85 },
            },
            {
                name: 'Deep freeze',
                cost: 750,
                stats: {
                    shieldDamage: 220,
                    slowPierce: 0.75,
                    cooldown: 0.95,
                    range: 230,
                },
            },
        ],
    },
    bigSpritz: {
        ...BASE_TOWER,
        name: 'Bjørn · Big Spritz',
        role: 'Premium pressure cannon',
        color: '#2dd4bf',
        cost: 650,
        description:
            'Two water tanks, one enormous nozzle. Bjørn turns crowds into very expensive puddles.',
        stats: {
            ...BASE_TOWER.stats,
            damage: 80,
            range: 220,
            cooldown: 0.75,
            splash: 70,
            splashEdgeDamage: 0.4,
            slow: 0.1,
            slowDuration: 0.6,
        },
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: {
                type: 'image',
                src: '/delfoter-td/big-spritz.svg',
                bodySrc: '/delfoter-td/big-spritz-body.svg',
                weapon: {
                    src: '/delfoter-td/big-spritz-weapon.svg',
                    pivot: { x: 134, y: 128 },
                    muzzle: { x: 233, y: 124 },
                    recoil: 5,
                    recoilDuration: 0.18,
                    effect: 'water',
                },
                frameWidth: 256,
                frameHeight: 192,
                frames: 1,
                fps: 0,
                width: 125,
                height: 94,
            },
            portraitViewBox: '-70 -55 140 110',
        },
        audio: { fire: 'soaker' },
        projectile: { ...BASE_TOWER.projectile, width: 14, color: '#2de2d0' },
        upgrades: [
            {
                name: 'Double pressure',
                cost: 500,
                stats: { damage: 125, splash: 90 },
            },
            {
                name: 'Fjord hydrant',
                cost: 1100,
                stats: {
                    damage: 190,
                    cooldown: 0.65,
                    range: 250,
                    armorPierce: 0.2,
                },
            },
            {
                name: 'North Sea monsoon',
                cost: 2100,
                stats: { damage: 280, cooldown: 0.5, splash: 125, slow: 0.25 },
            },
        ],
    },
    rocketeer: {
        ...BASE_TOWER,
        name: 'Astrid · Aqua-RPG',
        role: 'Homing water rockets · armor buster',
        color: '#fb923c',
        cost: 1200,
        description:
            'A brave little Delfoter with a completely unreasonable rocket launcher. Water warheads home in and soak whole squads.',
        stats: {
            ...BASE_TOWER.stats,
            damage: 420,
            range: 320,
            cooldown: 2.8,
            splash: 110,
            splashEdgeDamage: 0.5,
            armorPierce: 0.75,
        },
        appearance: {
            ...DEFENDER_APPEARANCE,
            sprite: {
                type: 'image',
                src: '/delfoter-td/aqua-rpg.svg',
                bodySrc: '/delfoter-td/aqua-rpg-body.svg',
                weapon: {
                    src: '/delfoter-td/aqua-rpg-weapon.svg',
                    pivot: { x: 132, y: 135 },
                    muzzle: { x: 232, y: 125 },
                    recoil: 6,
                    recoilDuration: 0.24,
                    effect: 'rocket',
                },
                frameWidth: 256,
                frameHeight: 192,
                frames: 1,
                fps: 0,
                width: 125,
                height: 94,
            },
            portraitViewBox: '-70 -55 140 110',
        },
        audio: { fire: 'rocket' },
        projectile: {
            ...BASE_TOWER.projectile,
            mode: 'rocket',
            speed: 340,
            width: 8,
            color: '#ffad55',
            particleColor: '#7ef3ff',
        },
        upgrades: [
            {
                name: 'Guidance goggles',
                cost: 900,
                stats: { damage: 850, range: 370, armorPierce: 1 },
            },
            {
                name: 'Fjordbuster warheads',
                cost: 1800,
                stats: { damage: 1600, splash: 145, cooldown: 2.6 },
            },
            {
                name: 'Orbital splash delivery',
                cost: 3200,
                stats: { damage: 3000, splash: 175, cooldown: 2.4, range: 440 },
            },
        ],
    },
} satisfies Record<string, TowerDefinition>;

export type TowerKind = keyof typeof definitions;
export const TOWERS: Record<TowerKind, TowerDefinition> = definitions;

export function towerStats(tower: Tower): TowerStats {
    const definition = TOWERS[tower.kind];
    return Object.assign(
        {},
        definition.stats,
        ...definition.upgrades
            .slice(0, tower.level)
            .map((upgrade) => upgrade.stats)
    );
}
