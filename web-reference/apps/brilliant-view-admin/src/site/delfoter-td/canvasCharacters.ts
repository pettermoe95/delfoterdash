import type { CharacterAppearance, Equipment } from './appearance';
import { ROBOT_ART, robotFill } from './robotArtwork';
import type { RobotSprite } from './robotArtwork';

const paths = new Map<string, Path2D>();
export function shape(
    ctx: CanvasRenderingContext2D,
    data: string,
    fill: string,
    stroke?: string,
    width = 2
) {
    let path = paths.get(data);
    if (!path) {
        path = new Path2D(data);
        paths.set(data, path);
    }
    if (fill !== 'none') {
        ctx.fillStyle = fill;
        ctx.fill(path);
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke(path);
    }
}
export function ellipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rx: number,
    ry: number,
    fill: string,
    stroke?: string
) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export function drawRobot(
    ctx: CanvasRenderingContext2D,
    sprite: RobotSprite,
    color: string,
    appearance: CharacterAppearance,
    time: number,
    seed: number
) {
    ctx.save();
    const bob = Math.sin(time * appearance.animation.speed + seed);
    ellipse(ctx, 0, 30, appearance.shadowWidth, 7, '#00151d66');
    ctx.translate(
        0,
        bob * appearance.animation.bob + appearance.animation.hover
    );
    ctx.rotate(bob * appearance.animation.sway);
    for (const part of ROBOT_ART[sprite])
        shape(
            ctx,
            part.path,
            robotFill(part.fill, color),
            part.stroke,
            part.width
        );
    // Independent eye pulse and little sparks make robots feel powered, not painted.
    ctx.globalAlpha = 0.45 + Math.sin(time * 5 + seed) * 0.25;
    ctx.shadowColor = '#ff274f';
    ctx.shadowBlur = 12;
    ellipse(ctx, 0, -7, 2, 2, '#ff4d68');
    ctx.restore();
}

export function drawDefender(
    ctx: CanvasRenderingContext2D,
    equipment: Equipment,
    accent: string,
    appearance: CharacterAppearance,
    angle: number,
    level: number,
    time: number,
    firing = false,
    recoil = firing ? 1 : 0
) {
    ctx.save();
    ellipse(ctx, 0, 28, appearance.shadowWidth, 8, '#06252966');
    const bob =
        Math.sin(time * appearance.animation.speed) * appearance.animation.bob +
        appearance.animation.hover;
    ctx.translate(0, bob);
    ctx.save();
    ctx.rotate(Math.sin(time * 5) * 0.045);
    shape(
        ctx,
        'M-17 12 Q-37 12 -40 -5 L-53 -12 L-49 2 L-57 13 Q-35 27 -15 22Z',
        '#577f98',
        '#183a54'
    );
    ctx.restore();
    const fur = ctx.createLinearGradient(-20, -30, 25, 25);
    fur.addColorStop(0, '#a4cad7');
    fur.addColorStop(1, '#48788e');
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(0, 8, 25, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e4660';
    ctx.lineWidth = 2;
    ctx.stroke();
    ellipse(ctx, 5, 15, 16, 14, '#e0f7f4');
    ellipse(ctx, -13, 28, 11, 6, '#54879d', '#1e4660');
    ellipse(ctx, 20, 28, 11, 6, '#54879d', '#1e4660');
    ellipse(ctx, -12, -19, 8, 8, '#6d9aac', '#1e4660');
    ellipse(ctx, 17, -19, 8, 8, '#6d9aac', '#1e4660');
    ellipse(ctx, -12, -19, 4, 4, '#f3afbd');
    ellipse(ctx, 17, -19, 4, 4, '#f3afbd');
    ellipse(ctx, 4, -6, 24, 22, '#86b1c3', '#1e4660');
    ellipse(ctx, 13, 3, 18, 11, '#ecfaf7');
    shape(ctx, 'M-17 -18 Q4 -32 25 -17', 'none', accent, 6);
    ellipse(ctx, -4, -8, 4, 5, '#102c45');
    ellipse(ctx, 13, -8, 4, 5, '#102c45');
    ellipse(ctx, -3, -10, 1.6, 2, '#fff');
    ellipse(ctx, 14, -10, 1.6, 2, '#fff');
    ellipse(ctx, 28, 0, 4, 3, '#102c45');
    ellipse(ctx, -9, 2, 5, 3, '#f695ac');
    shape(
        ctx,
        'M5 6 Q12 14 19 6 M1 1 L-10 -1 M2 5 L-10 7',
        'none',
        '#32576a',
        1.4
    );
    if (equipment === 'squirt') {
        ctx.save();
        ctx.translate(22, 8 - bob);
        ctx.rotate((angle * Math.PI) / 180);
        ellipse(ctx, 0, 0, firing ? 8 : 5, 5, '#e2fbff');
        ctx.restore();
        shape(ctx, 'M-6 11 Q-14 15 -10 23', 'none', accent, 6);
    } else {
        ctx.save();
        ctx.translate(0, 8 - bob);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-3 * recoil, 0);
        if (equipment === 'blaster') {
            shape(ctx, 'M-8 -17 H10 V7 H-8Z', '#38d9ff', '#1e4660');
            shape(
                ctx,
                'M6 -1 H38 V12 H6Z M17 9 H24 V20 H17Z',
                accent,
                '#53359a'
            );
            shape(ctx, 'M15 -9 H29 V1 H15Z', '#89f3ff', '#155e75');
            shape(ctx, 'M37 1 H49 V10 H37Z', '#26445a', '#11283d');
            shape(ctx, 'M13 3 H33', 'none', '#e0ceff', 2);
        } else {
            shape(ctx, 'M7 2 H59 V8 H7Z', '#1b3547', '#102537');
            shape(ctx, 'M4 -1 H26 V12 H4Z', accent, '#956015');
            shape(ctx, 'M20 -9 H39 V-3 H20Z M24 -3 V2', '#1b3547', '#102537');
            ellipse(ctx, 38, -6, 3, 3, '#41e3ff');
        }
        if (firing) {
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#58edff';
            ellipse(ctx, equipment === 'rifle' ? 60 : 50, 5, 7, 5, '#b9fbff');
        }
        ctx.restore();
    }
    for (let i = 0; i <= level; i++) {
        ellipse(ctx, -10 + i * 10, 40, 3, 3, '#ffe16a', '#9e6e17');
    }
    ctx.restore();
}
