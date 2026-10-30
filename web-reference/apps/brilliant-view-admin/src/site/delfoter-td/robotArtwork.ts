export type RobotShape = {
    path: string;
    fill: string;
    stroke?: string;
    width?: number;
};
const plate = (path: string, fill = '#33465e'): RobotShape => ({
    path,
    fill,
    stroke: '#101c31',
    width: 2.5,
});
const wire = (path: string, stroke = '#ff3f68', width = 2): RobotShape => ({
    path,
    fill: 'none',
    stroke,
    width,
});
const eye = (path: string): RobotShape => ({
    path,
    fill: '#ff365e',
    stroke: '#ff9d99',
    width: 1,
});

// Silhouettes are shared by canvas sprites and SVG portraits, keeping the shop and field guide accurate.
export const ROBOT_ART = {
    drone: [
        plate('M-17 13 Q-35 22 -48 7 L-52 -7 L-40 0 L-32 -8 L-32 9Z'),
        plate(
            'M-22 -5 Q-20 -24 4 -26 Q27 -25 29 -4 L25 24 Q5 34 -19 24Z',
            '$body'
        ),
        plate('M-17 -18 L-23 -31 L-9 -27 M13 -25 L25 -32 L27 -17', '#8ba5b7'),
        plate('M-21 24 L-26 32 L-7 32 L-5 24 M13 25 L13 32 L33 32 L25 23'),
        plate('M-16 -11 Q2 -19 24 -10 L20 5 L-15 5Z', '#112033'),
        eye('M-12 -8 L-1 -5 L-11 -1Z M9 -5 L20 -9 L20 -1Z'),
        plate('M1 8 L31 8 L35 15 L25 21 L1 20Z', '#a3b5c0'),
        wire('M7 12 L10 18 L14 12 L18 18 L22 12', '#223348'),
        wire('M0 -27 L-3 -39 L6 -43', '#7c93a7', 3),
        eye('M3 -45 H10 V-39 H3Z'),
        wire('M-13 10 V20 H-6 M-5 24 H7'),
    ],
    skitter: [
        plate('M-27 9 L-55 0 L-43 -9 L-45 -19 L-22 -5Z', '#713bc4'),
        plate(
            'M-27 7 L-35 22 L-46 26 L-41 30 L-24 22 L-14 10 M-7 12 L-9 28 L4 32 L9 29 L1 24 L5 12 M15 5 L32 19 L43 20 L43 25 L28 25 L10 13',
            '#292b4b'
        ),
        plate('M-31 1 L-15 -19 L18 -26 L39 -8 L18 13 L-18 15Z', '$body'),
        plate('M-13 -19 L-20 -38 L1 -28 L12 -43 L20 -25', '#bc7aff'),
        plate('M-10 -10 L34 -13 L25 2 L-15 3Z', '#15192f'),
        eye('M-7 -9 L7 -5 L-7 -2Z M14 -5 L29 -10 L25 -2Z'),
        plate('M12 5 L43 2 L48 9 L20 15Z', '#d3c4f1'),
        wire('M-25 0 L-15 -8 M-20 7 L-10 -1', '#e674ff', 3),
    ],
    armored: [
        plate('M-31 4 L-58 -2 L-50 -15 L-48 0 L-32 -8Z', '#526578'),
        plate('M-38 17 H36 L44 30 L33 38 H-34 L-43 30Z', '#172a39'),
        wire('M-31 26 H32 M-27 33 H28', '#728999', 4),
        plate('M-39 1 L-27 -25 L18 -29 L40 -7 L35 23 H-32Z', '$body'),
        plate(
            'M-27 -22 L-23 -38 L-9 -27 L8 -42 L17 -27 L32 -36 L35 -15',
            '#adc0c7'
        ),
        plate('M-28 -7 L30 -12 L32 5 L-26 10Z', '#162337'),
        eye('M-20 -3 H-3 V2 H-20Z M9 -5 H26 V0 H9Z'),
        plate('M-8 10 L34 7 L41 17 L25 26 L-8 24Z', '#a4b7c0'),
        wire('M0 14 V21 M8 13 V22 M16 12 V23 M24 12 V21', '#24394a', 3),
        plate('M-37 -2 L-19 -13 L-10 5 L-24 19 L-39 12Z', '#7c93a0'),
        wire('M-29 -1 L-24 8', '#ffc144', 4),
    ],
    repair: [
        wire(
            'M-15 15 Q-35 13 -35 33 L-44 39 M9 19 Q12 39 26 35 L31 26 M25 10 Q43 14 44 32',
            '#36e7ac',
            5
        ),
        plate('M-22 7 L-42 15 L-50 5 L-43 -3 L-29 -4Z', '#187569'),
        plate(
            'M-26 10 Q-36 -16 -19 -34 Q1 -49 24 -29 Q39 -12 25 12 L14 23 H-14Z',
            '$body'
        ),
        plate('M-22 -15 Q-17 -35 4 -35 Q26 -29 25 -11 L12 -2 H-10Z', '#102e40'),
        eye('M-13 -19 L-1 -14 L-13 -11Z M8 -15 L20 -19 L19 -10Z'),
        plate('M-6 -2 L30 -2 L35 7 L18 16 L-5 12Z', '#88d3cf'),
        wire('M-17 7 V20 M-24 13 H-10', '#76ffc8', 4),
        wire('M-20 -33 L-29 -43 M20 -32 L28 -44', '#57d8bc', 3),
        plate('M-16 25 Q4 33 24 24 L18 30 H-9Z', '#4af6d2'),
    ],
    overlord: [
        plate('M-27 10 L-57 6 L-67 -12 L-60 -24 L-49 -7 L-30 -5Z', '#4c325f'),
        plate(
            'M-34 11 L-49 28 L-42 38 L-26 27 L-15 20 M-9 17 L-16 40 L-3 44 L7 20 M17 18 L24 42 L39 37 L31 13',
            '#1a1830'
        ),
        plate(
            'M-40 3 L-31 -27 L-10 -42 L27 -31 L46 -4 L34 27 L-24 30Z',
            '$body'
        ),
        plate(
            'M-32 -24 L-46 -49 L-21 -36 L-15 -60 L1 -42 L19 -62 L28 -36 L48 -46 L38 -20Z',
            '#9983b0'
        ),
        plate('M-31 -15 L33 -20 L37 3 L-28 8Z', '#0d1023'),
        eye('M-23 -11 L-3 -6 L-23 -2Z M9 -6 L30 -13 L29 -2Z'),
        plate('M-13 10 L36 5 L47 15 L28 32 L-13 26Z', '#b5a8c6'),
        wire('M-5 13 L0 23 L6 12 L12 25 L18 11 L24 24 L30 11', '#35253e', 3),
        plate('M-39 -2 L-23 -12 L-10 6 L-25 20 L-43 13Z', '#80549a'),
        eye('M-29 -1 L-20 4 L-29 12 L-35 5Z'),
        wire('M2 -38 V-47 M-35 9 L-44 18 M30 28 L38 31', '#ff4d88', 3),
    ],
} satisfies Record<string, RobotShape[]>;

export type RobotSprite = keyof typeof ROBOT_ART;

export const robotFill = (fill: string, color: string) =>
    fill === '$body' ? color : fill;
