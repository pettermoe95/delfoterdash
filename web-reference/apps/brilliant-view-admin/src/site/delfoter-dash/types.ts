export type HazardKind =
    | 'spike'
    | 'block'
    | 'saw'
    | 'gap'
    | 'pad'
    | 'orb'
    | 'laser';
export type Hazard = {
    id: number;
    kind: HazardKind;
    x: number;
    width: number;
    height: number;
    y?: number;
    required?: boolean;
    sequence?: number;
    section?: string;
};
export type Shell = { id: number; x: number; y: number };
export type DashWorld = {
    id: string;
    name: string;
    subtitle: string;
    theme: 'neon' | 'frost';
    accent: string;
    secondary: string;
    sky: string;
    ability?: 'phase';
};
export type DashLevel = {
    worldId: string;
    number: number;
    id: string;
    name: string;
    subtitle: string;
    difficulty: string;
    bpm: number;
    speed: number;
    length: number;
    accent: string;
    secondary: string;
    sky: string;
    music: string;
    hazards: Hazard[];
    shells: Shell[];
};
export type DashCue =
    | 'phase'
    | 'jump'
    | 'land'
    | 'pad'
    | 'orb'
    | 'shell'
    | 'crash'
    | 'finish';
export type DashBurst = {
    x: number;
    y: number;
    age: number;
    color: string;
    kind: 'water' | 'spark' | 'crash';
};
export type DashState = {
    level: DashLevel;
    phase: 'ready' | 'playing' | 'paused' | 'dead' | 'complete';
    distance: number;
    elapsed: number;
    y: number;
    velocity: number;
    grounded: boolean;
    coyote: number;
    buffer: number;
    flip: number;
    jumps: number;
    phaseUntil: number;
    phaseReadyAt: number;
    shells: Set<number>;
    used: Set<number>;
    bursts: DashBurst[];
    deathAge: number;
};
export type DashRecord = {
    progress: number;
    shells: number;
    completed: boolean;
};
