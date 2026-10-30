import type { RobotSprite } from './robotArtwork';

// Art/equipment identifiers describe reusable visuals, independently of character IDs.
export type Equipment = 'squirt' | 'blaster' | 'rifle';
export type SpriteSheet = {
    type: 'image';
    src: string;
    // Optional layered equipment keeps portraits intact while the in-game weapon aims independently.
    bodySrc?: string;
    weapon?: {
        src: string;
        pivot: { x: number; y: number };
        muzzle: { x: number; y: number };
        recoil: number;
        recoilDuration: number;
        effect: 'water' | 'snow' | 'rocket';
    };
    frameWidth: number;
    frameHeight: number;
    frames: number;
    fps: number;
    width: number;
    height: number;
};
export type CharacterSprite =
    | { type: 'robot'; shape: RobotSprite }
    | { type: 'defender'; equipment: Equipment }
    | SpriteSheet;
export type CharacterAppearance = {
    sprite: CharacterSprite;
    scale: number;
    portraitViewBox?: string;
    animation: { speed: number; bob: number; sway: number; hover: number };
    shadowWidth: number;
    healthBar: { width: number; offset: number };
};

export const DEFENDER_APPEARANCE = {
    scale: 0.86,
    animation: { speed: 3.5, bob: 1.5, sway: 0, hover: 0 },
    shadowWidth: 32,
    healthBar: { width: 34, offset: 40 },
} satisfies Omit<CharacterAppearance, 'sprite'>;

export const ROBOT_APPEARANCE = {
    scale: 0.7,
    animation: { speed: 7, bob: 1.8, sway: 0.02, hover: 0 },
    shadowWidth: 31,
    healthBar: { width: 34, offset: 46 },
} satisfies Omit<CharacterAppearance, 'sprite'>;
