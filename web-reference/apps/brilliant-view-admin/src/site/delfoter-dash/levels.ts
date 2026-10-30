import type { DashLevel, Hazard, HazardKind } from './types';
import { DASH_WORLDS } from './worlds';

type Piece = {
    beat: number;
    kind: HazardKind;
    width?: number;
    height?: number;
    y?: number;
};
const PHRASES: Record<string, { beats: number; pieces: Piece[] }> = {
    warmup: {
        beats: 10,
        pieces: [
            { beat: 1.5, kind: 'spike' },
            { beat: 6, kind: 'spike' },
        ],
    },
    doubles: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'spike', width: 68 },
            { beat: 4.5, kind: 'spike', width: 68 },
            { beat: 8, kind: 'spike', width: 68 },
        ],
    },
    steps: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'block' },
            { beat: 4.5, kind: 'spike' },
            { beat: 8, kind: 'block' },
        ],
    },
    waterline: {
        beats: 10,
        pieces: [
            { beat: 1, kind: 'gap', width: 120 },
            { beat: 6, kind: 'spike', width: 68 },
        ],
    },
    turbine: {
        beats: 11,
        pieces: [
            { beat: 1, kind: 'saw' },
            { beat: 4, kind: 'block' },
            { beat: 7, kind: 'spike', width: 68 },
        ],
    },
    launch: {
        beats: 10,
        pieces: [
            { beat: 1, kind: 'pad' },
            { beat: 1.75, kind: 'gap', width: 155 },
            { beat: 6, kind: 'spike', width: 68 },
        ],
    },
    triples: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'spike', width: 96 },
            { beat: 4.5, kind: 'spike', width: 68 },
            { beat: 8, kind: 'spike', width: 96 },
        ],
    },
    quickstep: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'spike', width: 68 },
            { beat: 3.75, kind: 'block' },
            { beat: 6.5, kind: 'spike', width: 96 },
            { beat: 9.25, kind: 'saw' },
        ],
    },
    phaseLesson: {
        beats: 12,
        pieces: [
            { beat: 1.5, kind: 'laser' },
            { beat: 5, kind: 'spike', width: 68 },
            { beat: 8.5, kind: 'laser' },
        ],
    },
    phaseFlow: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'laser' },
            { beat: 4, kind: 'saw' },
            { beat: 7, kind: 'laser' },
            { beat: 10, kind: 'spike', width: 96 },
        ],
    },
    phaseDouble: {
        beats: 12,
        pieces: [
            { beat: 1, kind: 'laser' },
            { beat: 1.3, kind: 'laser' },
            { beat: 5, kind: 'block' },
            { beat: 8.5, kind: 'laser' },
            { beat: 8.8, kind: 'laser' },
        ],
    },
};
const DEFAULTS: Record<HazardKind, { width: number; height: number }> = {
    spike: { width: 34, height: 43 },
    block: { width: 72, height: 54 },
    saw: { width: 52, height: 52 },
    gap: { width: 120, height: 0 },
    pad: { width: 52, height: 12 },
    orb: { width: 36, height: 36 },
    laser: { width: 20, height: 440 },
};
function course(
    worldIndex: number,
    number: number,
    id: string,
    name: string,
    subtitle: string,
    difficulty: string,
    bpm: number,
    speed: number,
    phrases: string[]
): DashLevel {
    const world = DASH_WORLDS[worldIndex],
        beat = (speed * 60) / bpm;
    let idCounter = 1;
    const hazards: Hazard[] = [];
    const add = (kind: HazardKind, x: number, extra: Partial<Hazard> = {}) =>
        hazards.push({ id: idCounter++, kind, x, ...DEFAULTS[kind], ...extra });
    let cursor = 4 * beat;
    for (const [index, phrase] of phrases.entries()) {
        const start = cursor;
        const section = `${id}-${index}-${phrase}`;
        if (phrase === 'ringCrossing' || phrase === 'ringChain') {
            const x = start + beat;
            const chained = phrase === 'ringChain';
            // One uninterrupted trench. The first boost cannot reach the far bank of a chain.
            add('gap', x, { width: speed * (chained ? 1.8 : 1.04), section });
            add('orb', x + speed * 0.32 - 18, {
                y: 310,
                required: true,
                section,
                sequence: chained ? 1 : undefined,
            });
            if (chained) {
                add('orb', x + speed - 18, {
                    y: 220,
                    required: true,
                    section,
                    sequence: 2,
                });
                cursor = x + speed * 2.75;
            } else {
                add('spike', x + speed * 1.95, { width: 68, section });
                cursor = x + speed * 2.8;
            }
        } else if (phrase === 'pillars' || phrase === 'highPillars') {
            const x = start + beat,
                high = phrase === 'highPillars';
            add('gap', x, { width: 900, section });
            add('block', x + 80, {
                width: 150,
                height: high ? 75 : 65,
                section,
            });
            add('block', x + 330, {
                width: 150,
                height: high ? 150 : 120,
                section,
            });
            add('block', x + 610, {
                width: 160,
                height: high ? 220 : 185,
                section,
            });
            add('spike', x + 900 + speed * 0.85, { width: 68, section });
            cursor = x + 900 + speed * 1.75;
        } else {
            for (const piece of PHRASES[phrase].pieces) {
                const { kind, beat: at, ...extra } = piece;
                add(kind, start + at * beat, { ...extra, section });
            }
            cursor += PHRASES[phrase].beats * beat;
        }
    }
    hazards.sort((a, b) => a.x - b.x);
    const shells = hazards
        .filter((h) => !['orb', 'laser', 'gap'].includes(h.kind))
        .flatMap((h) =>
            [-18, 22, 62].map((offset, index) => ({
                id: idCounter++,
                x: h.x + offset,
                y: Math.max(
                    95,
                    325 -
                        (h.kind === 'block' ? Math.max(0, h.height - 65) : 0) -
                        (index === 1 ? 15 : 0)
                ),
            }))
        );
    return {
        id,
        worldId: world.id,
        number,
        name,
        subtitle,
        difficulty,
        bpm,
        speed,
        length: cursor + 2 * beat,
        accent: world.accent,
        secondary: world.secondary,
        sky: world.sky,
        music: `/delfoter-dash/${id}.wav`,
        hazards,
        shells,
    };
}
export const DASH_LEVELS: DashLevel[] = [
    course(
        0,
        1,
        'boardwalk',
        'Neon Boardwalk',
        'Find your flow.',
        'Chill',
        132,
        330,
        ['warmup', 'doubles', 'steps', 'waterline', 'launch']
    ),
    course(
        0,
        2,
        'reef',
        'Voltage Reef',
        'Sharper turns. Tighter timing.',
        'Spicy',
        144,
        380,
        ['doubles', 'quickstep', 'triples', 'turbine', 'launch']
    ),
    course(
        0,
        3,
        'overdrive',
        'Airwave Alley',
        'Jump into the gap, then tap the glowing ring.',
        'Air rings',
        148,
        390,
        ['steps', 'ringCrossing', 'turbine', 'launch', 'doubles']
    ),
    course(
        0,
        4,
        'skyline',
        'Skyline Switchback',
        'Land on the pillars. Jump again from each ledge.',
        'Pillars',
        152,
        405,
        ['turbine', 'pillars', 'ringCrossing', 'steps', 'triples']
    ),
    course(
        0,
        5,
        'coastline',
        'Coastline Overdrive',
        'Two rings. One gap. Stay airborne through both boosts.',
        'Expert',
        158,
        420,
        ['quickstep', 'highPillars', 'ringChain', 'turbine', 'triples']
    ),
    course(
        1,
        1,
        'frost-arrival',
        'Cold Start',
        'Shift / X or Phase: glide through the pink laser gates.',
        'Phase intro',
        140,
        375,
        ['steps', 'phaseLesson', 'doubles', 'waterline', 'launch']
    ),
    course(
        1,
        2,
        'icebreaker',
        'Icebreaker',
        'Pair short phase bursts with clean landings.',
        'Charged',
        148,
        390,
        ['phaseFlow', 'pillars', 'phaseLesson', 'ringCrossing', 'triples']
    ),
    course(
        1,
        3,
        'aurora-ascent',
        'Aurora Ascent',
        'Climb frozen spires beneath the northern lights.',
        'Vertical',
        154,
        410,
        ['highPillars', 'phaseFlow', 'ringCrossing', 'phaseDouble', 'turbine']
    ),
    course(
        1,
        4,
        'polar-flux',
        'Polar Flux',
        'One phase burst. Two gates. Keep your nerve.',
        'Intense',
        160,
        425,
        ['phaseDouble', 'quickstep', 'highPillars', 'ringChain', 'triples']
    ),
    course(
        1,
        5,
        'fjord-reactor',
        'Fjord Reactor',
        'Bring every trick. Leave only a frozen wake.',
        'Finale',
        168,
        445,
        [
            'phaseDouble',
            'highPillars',
            'ringChain',
            'quickstep',
            'phaseFlow',
            'turbine',
        ]
    ),
];
