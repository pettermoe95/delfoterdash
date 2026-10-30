import type { CharacterAppearance } from './appearance';
import type { Point } from './types';

export function weaponGeometry(appearance: CharacterAppearance) {
    const sprite = appearance.sprite;
    if (sprite.type === 'image' && sprite.weapon) {
        const x = sprite.width / sprite.frameWidth,
            y = sprite.height / sprite.frameHeight;
        return {
            pivot: {
                x: (sprite.weapon.pivot.x - sprite.frameWidth / 2) * x,
                y: (sprite.weapon.pivot.y - sprite.frameHeight / 2) * y,
            },
            muzzle: {
                x: (sprite.weapon.muzzle.x - sprite.weapon.pivot.x) * x,
                y: (sprite.weapon.muzzle.y - sprite.weapon.pivot.y) * y,
            },
            recoil: sprite.weapon.recoil,
            duration: sprite.weapon.recoilDuration,
            layered: true,
        };
    }
    const mouth = sprite.type === 'defender' && sprite.equipment === 'squirt';
    return {
        pivot: { x: mouth ? 22 : 0, y: 8 },
        muzzle: {
            x: mouth
                ? 8
                : sprite.type === 'defender' && sprite.equipment === 'rifle'
                  ? 59
                  : 49,
            y: mouth ? 0 : 5,
        },
        recoil: mouth ? 0 : 3,
        duration: 0.16,
        layered: false,
    };
}

export function weaponRecoil(
    appearance: CharacterAppearance,
    time: number,
    firedAt?: number
) {
    if (firedAt === undefined) return 0;
    return (
        Math.max(
            0,
            1 -
                Math.max(0, time - firedAt) /
                    weaponGeometry(appearance).duration
        ) ** 2
    );
}

export function weaponMuzzle(
    appearance: CharacterAppearance,
    position: Point,
    angle: number,
    facing: 1 | -1 = 1,
    recoil = 0
): Point {
    const geometry = weaponGeometry(appearance);
    const radians = (angle * Math.PI) / 180;
    const x = geometry.muzzle.x - geometry.recoil * recoil;
    const y = geometry.muzzle.y * facing;
    return {
        x:
            position.x +
            appearance.scale *
                (geometry.pivot.x * facing +
                    x * Math.cos(radians) -
                    y * Math.sin(radians)),
        y:
            position.y +
            appearance.scale *
                (geometry.pivot.y +
                    x * Math.sin(radians) +
                    y * Math.cos(radians)),
    };
}

// Aim around the hand rather than the character center. Offset barrels remain aligned with the target.
export function aimWeapon(
    appearance: CharacterAppearance,
    position: Point,
    target: Point
) {
    const geometry = weaponGeometry(appearance);
    const facing: 1 | -1 = geometry.layered && target.x < position.x ? -1 : 1;
    const pivot = {
        x: position.x + geometry.pivot.x * appearance.scale * facing,
        y: position.y + geometry.pivot.y * appearance.scale,
    };
    const angle =
        ((Math.atan2(target.y - pivot.y, target.x - pivot.x) -
            Math.atan2(
                geometry.muzzle.y * facing,
                geometry.muzzle.x - geometry.recoil
            )) *
            180) /
        Math.PI;
    return {
        angle,
        facing,
        muzzle: weaponMuzzle(appearance, position, angle, facing, 1),
    };
}
