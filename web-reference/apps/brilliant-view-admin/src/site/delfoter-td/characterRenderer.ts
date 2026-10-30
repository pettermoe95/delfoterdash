import type { CharacterAppearance, SpriteSheet } from './appearance';
import { drawDefender, drawRobot, ellipse } from './canvasCharacters';
import { weaponGeometry } from './weaponAim';

const spriteImages = new Map<string, HTMLImageElement>();

function drawSprite(
    ctx: CanvasRenderingContext2D,
    sprite: SpriteSheet,
    time: number
) {
    let image = spriteImages.get(sprite.src);
    if (!image) {
        image = new Image();
        image.src = sprite.src;
        spriteImages.set(sprite.src, image);
    }
    const frames = Math.max(1, Math.floor(sprite.frames));
    if (
        !image.complete ||
        image.naturalWidth < sprite.frameWidth * frames ||
        image.naturalHeight < sprite.frameHeight
    ) {
        ellipse(ctx, 0, 0, 22, 22, '#1b5165', '#69e4f5');
        ctx.fillStyle = '#eaffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', 0, 7);
        return;
    }
    const frame = Math.floor(time * sprite.fps) % frames;
    ctx.drawImage(
        image,
        frame * sprite.frameWidth,
        0,
        sprite.frameWidth,
        sprite.frameHeight,
        -sprite.width / 2,
        -sprite.height / 2,
        sprite.width,
        sprite.height
    );
}

function drawLayeredDefender(
    ctx: CanvasRenderingContext2D,
    appearance: CharacterAppearance,
    sprite: SpriteSheet,
    time: number,
    angle: number,
    facing: 1 | -1,
    level: number,
    firing: boolean,
    recoil: number
) {
    const weapon = sprite.weapon!;
    const geometry = weaponGeometry(appearance);
    ellipse(
        ctx,
        0,
        sprite.height / 2 - 8,
        appearance.shadowWidth,
        7,
        '#00151d66'
    );
    ctx.save();
    ctx.translate(
        0,
        Math.sin(time * appearance.animation.speed) * appearance.animation.bob +
            appearance.animation.hover
    );
    ctx.scale(facing, 1);
    drawSprite(ctx, { ...sprite, src: sprite.bodySrc! }, time);
    ctx.restore();
    // The hand/barrel anchor is stable while the body bobs gently behind it.
    ctx.save();
    ctx.translate(geometry.pivot.x * facing, geometry.pivot.y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.scale(1, facing);
    ctx.translate(-geometry.recoil * recoil, 0);
    ctx.save();
    ctx.translate(-geometry.pivot.x, -geometry.pivot.y);
    drawSprite(ctx, { ...sprite, src: weapon.src }, time);
    ctx.restore();
    if (firing) {
        ctx.translate(geometry.muzzle.x, geometry.muzzle.y);
        ctx.globalAlpha = 0.35 + recoil * 0.65;
        ctx.strokeStyle = '#e9fbff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = weapon.effect === 'rocket' ? '#ffbe62' : '#98efff';
        ctx.shadowBlur = 9;
        if (weapon.effect === 'snow') {
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
                ctx.stroke();
            }
            ellipse(ctx, 0, 0, 3, 3, '#f0fbff');
        } else {
            ellipse(
                ctx,
                3,
                0,
                5 + recoil * 4,
                3 + recoil * 2,
                weapon.effect === 'rocket' ? '#ffe0a0' : '#c7faff'
            );
        }
    }
    ctx.restore();
    for (let i = 0; i <= level; i++)
        ellipse(ctx, -10 + i * 10, 42, 3, 3, '#ffe16a', '#9e6e17');
}

export function drawCharacter(
    ctx: CanvasRenderingContext2D,
    appearance: CharacterAppearance,
    color: string,
    time: number,
    {
        angle = 0,
        level = 0,
        seed = 0,
        firing = false,
        facing,
        recoil = firing ? 1 : 0,
    }: {
        angle?: number;
        level?: number;
        seed?: number;
        firing?: boolean;
        facing?: 1 | -1;
        recoil?: number;
    } = {}
) {
    ctx.save();
    ctx.scale(appearance.scale, appearance.scale);
    const sprite = appearance.sprite;
    if (sprite.type === 'robot')
        drawRobot(ctx, sprite.shape, color, appearance, time, seed);
    else if (sprite.type === 'defender')
        drawDefender(
            ctx,
            sprite.equipment,
            color,
            appearance,
            angle,
            level,
            time,
            firing,
            recoil
        );
    else if (sprite.bodySrc && sprite.weapon) {
        drawLayeredDefender(
            ctx,
            appearance,
            sprite,
            time,
            angle,
            facing ?? (Math.cos((angle * Math.PI) / 180) < 0 ? -1 : 1),
            level,
            firing,
            recoil
        );
    } else {
        if (Math.cos((angle * Math.PI) / 180) < 0) ctx.scale(-1, 1);
        ellipse(
            ctx,
            0,
            sprite.height / 2 - 8,
            appearance.shadowWidth,
            7,
            '#00151d66'
        );
        ctx.translate(
            0,
            Math.sin(time * appearance.animation.speed + seed) *
                appearance.animation.bob +
                appearance.animation.hover
        );
        ctx.rotate(
            Math.sin(time * appearance.animation.speed + seed) *
                appearance.animation.sway
        );
        drawSprite(ctx, sprite, time);
    }
    ctx.restore();
}
