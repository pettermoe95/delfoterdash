import type { EnemyKind } from './types';

export type Group = {
    kind: EnemyKind;
    count: number;
    interval: number;
    pause?: number;
};
export const FORMATIONS = {
    mixed: {
        label: 'Mixed patrol',
        hint: 'A balanced mix. Keep a little of everything.',
        health: 1,
        speed: 1,
        reward: 1,
    },
    swarm: {
        label: 'Swarm bursts',
        hint: 'Tight packs with breathing room. Splash damage shines.',
        health: 0.95,
        speed: 1.08,
        reward: 0.65,
    },
    column: {
        label: 'Spaced armor column',
        hint: 'Heavy enemies arrive separately. Trade splash for snipers.',
        health: 1.8,
        speed: 1.12,
        reward: 1.3,
    },
    runners: {
        label: 'Runner stream',
        hint: 'Fast, spaced targets. Bring slows and fast single-target fire.',
        health: 1.3,
        speed: 1.35,
        reward: 0.9,
    },
    convoy: {
        label: 'Carrier convoy',
        hint: 'Crack the hulls, then splash the released crew.',
        health: 1.5,
        speed: 1.08,
        reward: 0.9,
    },
    bosses: {
        label: 'Boss duels',
        hint: 'Few targets, enormous HP. Armor-piercing single-target damage wins.',
        health: 1.7,
        speed: 1.1,
        reward: 1.4,
    },
} as const;
export type Formation = keyof typeof FORMATIONS;
type Wave = { name: string; groups: Group[]; formation: Formation };
const openingWaves: Wave[] = [
    {
        formation: 'mixed',
        name: 'An unwelcome update',
        groups: [{ kind: 'drone', count: 12, interval: 0.65 }],
    },
    {
        formation: 'mixed',
        name: 'Boot sequence',
        groups: [
            { kind: 'drone', count: 16, interval: 0.5 },
            { kind: 'skitter', count: 5, interval: 0.45 },
        ],
    },
    {
        formation: 'mixed',
        name: 'Too fast to pet',
        groups: [
            { kind: 'skitter', count: 18, interval: 0.4 },
            { kind: 'drone', count: 10, interval: 0.35 },
        ],
    },
    {
        formation: 'mixed',
        name: 'Heavy metal flippers',
        groups: [
            { kind: 'drone', count: 8, interval: 0.7 },
            { kind: 'armored', count: 6, interval: 0.8 },
        ],
    },
    {
        formation: 'mixed',
        name: 'Have you tried turning it off?',
        groups: [
            { kind: 'repair', count: 12, interval: 0.7 },
            { kind: 'skitter', count: 10, interval: 0.5 },
        ],
    },
    {
        formation: 'convoy',
        name: 'Sjark attack: malicious cod',
        groups: [
            { kind: 'sjark', count: 1, interval: 8 },
            { kind: 'drone', count: 16, interval: 0.8 },
            { kind: 'armored', count: 6, interval: 3.2 },
        ],
    },
    {
        formation: 'bosses',
        name: 'The Ottermind awakens',
        groups: [
            { kind: 'overlord', count: 1, interval: 9 },
            { kind: 'armored', count: 6, interval: 3.5 },
        ],
    },
    {
        formation: 'runners',
        name: 'DelfIver: Epoq express',
        groups: [
            { kind: 'delfiver', count: 10, interval: 2.5 },
            { kind: 'skitter', count: 14, interval: 1.5 },
        ],
    },
    {
        formation: 'swarm',
        name: 'A very bad download',
        groups: [
            { kind: 'drone', count: 18, interval: 0.16, pause: 3 },
            { kind: 'skitter', count: 20, interval: 0.18, pause: 3 },
            { kind: 'repair', count: 10, interval: 0.25 },
        ],
    },
    {
        formation: 'column',
        name: 'Steel tide: single file',
        groups: [
            { kind: 'armored', count: 12, interval: 3.8 },
            { kind: 'repair', count: 8, interval: 2.8 },
        ],
    },
    {
        formation: 'swarm',
        name: 'No more nice circuits',
        groups: [
            { kind: 'sjark', count: 1, interval: 6 },
            { kind: 'skitter', count: 22, interval: 0.15, pause: 4 },
            { kind: 'drone', count: 24, interval: 0.16, pause: 4 },
            { kind: 'delfiver', count: 8, interval: 0.5 },
        ],
    },
    {
        formation: 'bosses',
        name: 'The invasion was only the tutorial',
        groups: [
            { kind: 'overlord', count: 3, interval: 12 },
            { kind: 'sjark', count: 1, interval: 10 },
            { kind: 'armored', count: 8, interval: 3.5 },
        ],
    },
];

function campaignWave(number: number): Wave {
    const tier = Math.floor((number - 13) / 8);
    if (number >= 30 && number % 10 === 0)
        return {
            formation: 'convoy',
            name:
                number === 50
                    ? 'The last voyage: lights out'
                    : `Nattmørke rises · ${number}`,
            groups: [
                {
                    kind: 'reaperSjark',
                    count: number >= 40 ? 2 : 1,
                    interval: number === 30 ? 10 : 6,
                },
                {
                    kind: 'skitter',
                    count: number === 30 ? 12 : 16 + tier * 4,
                    interval: number === 30 ? 0.65 : 0.45,
                },
                {
                    kind: 'delfiver',
                    count: number === 30 ? 4 : 6 + tier * 2,
                    interval: number === 30 ? 1.3 : 0.9,
                },
            ],
        };
    if (number % 5 === 0)
        return {
            formation: 'bosses',
            name:
                number === 50
                    ? 'The last splash: uninstall everything'
                    : `Ottermind duels · ${number}`,
            groups: [
                {
                    kind: 'overlord',
                    count: 2 + Math.floor(number / 15),
                    interval: 12,
                },
                { kind: 'delfiver', count: 6 + tier * 2, interval: 2.5 },
            ],
        };
    switch ((number - 13) % 4) {
        case 0:
            return {
                formation: 'column',
                name: `Ironflukes, one by one · ${number}`,
                groups: [
                    { kind: 'armored', count: 14 + tier * 3, interval: 3.8 },
                    { kind: 'repair', count: 8 + tier * 2, interval: 2.8 },
                    { kind: 'delfiver', count: 5 + tier, interval: 3 },
                ],
            };
        case 1:
            return {
                formation: 'swarm',
                name: `Circuit swarm · ${number}`,
                groups: [
                    {
                        kind: 'drone',
                        count: 25 + tier * 8,
                        interval: 0.15,
                        pause: 4,
                    },
                    {
                        kind: 'skitter',
                        count: 24 + tier * 6,
                        interval: 0.17,
                        pause: 4,
                    },
                    {
                        kind: 'repair',
                        count: 12 + tier * 3,
                        interval: 0.23,
                        pause: 3,
                    },
                    { kind: 'armored', count: 8 + tier * 2, interval: 0.4 },
                ],
            };
        case 2:
            return {
                formation: 'runners',
                name: `Epoq express lane · ${number}`,
                groups: [
                    ...(number >= 19
                        ? [
                              {
                                  kind: 'sjark' as const,
                                  count: number >= 25 ? 2 : 1,
                                  interval: 4,
                              },
                          ]
                        : []),
                    { kind: 'delfiver', count: 10 + tier * 2, interval: 2.5 },
                    { kind: 'skitter', count: 18 + tier * 4, interval: 1.5 },
                    { kind: 'repair', count: 8 + tier * 2, interval: 2 },
                ],
            };
        default:
            return {
                formation: 'convoy',
                name: `Fishing fleet of doom · ${number}`,
                groups: [
                    {
                        kind: 'sjark',
                        count: number >= 24 ? 2 : 1,
                        interval: 4,
                    },
                    { kind: 'skitter', count: 12 + tier * 3, interval: 0.5 },
                    { kind: 'armored', count: 8 + tier * 2, interval: 3.5 },
                ],
            };
    }
}

export const WAVES: Wave[] = [
    ...openingWaves,
    ...Array.from({ length: 38 }, (_, index) => campaignWave(index + 13)),
];

export function waveSpawns(index: number) {
    let at = 0;
    return WAVES[index].groups.flatMap((group) => {
        const spawns = Array.from({ length: group.count }, () => {
            const spawn = { kind: group.kind, at };
            at += group.interval;
            return spawn;
        });
        at += group.pause ?? 0;
        return spawns;
    });
}
