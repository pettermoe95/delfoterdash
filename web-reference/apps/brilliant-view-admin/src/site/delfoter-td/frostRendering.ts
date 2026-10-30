import type { FrostPatch, Point, Shot } from './types';

function snowflake(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    angle = 0
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let spoke = 0; spoke < 6; spoke++) {
        const a = (spoke * Math.PI) / 3;
        const dx = Math.cos(a),
            dy = Math.sin(a);
        ctx.moveTo(0, 0);
        ctx.lineTo(dx * radius, dy * radius);
        for (const side of [-1, 1]) {
            const b = a + side * 0.7;
            ctx.moveTo(dx * radius * 0.55, dy * radius * 0.55);
            ctx.lineTo(
                dx * radius * 0.55 - Math.cos(b) * radius * 0.3,
                dy * radius * 0.55 - Math.sin(b) * radius * 0.3
            );
        }
    }
    ctx.stroke();
    ctx.restore();
}

export function paintFrostGround(
    ctx: CanvasRenderingContext2D,
    patches: FrostPatch[],
    time: number,
    animated: boolean
) {
    for (const patch of patches) {
        ctx.save();
        ctx.translate(patch.position.x, patch.position.y);
        ctx.globalAlpha = Math.min(0.8, patch.life / patch.duration);
        const radius = patch.radius;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        glow.addColorStop(0, '#d7f6ff99');
        glow.addColorStop(0.65, '#8bd6f955');
        glow.addColorStop(1, '#b9e9ff00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2fbffbb';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 7; i++) {
            const angle = i * 2.399;
            const r = radius * (0.25 + i * 0.085);
            const x = Math.cos(angle) * r,
                y = Math.sin(angle) * r * 0.65;
            snowflake(ctx, x, y, 5 + (i % 3) * 2, angle);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x * 0.55 + 5, y * 0.45);
            ctx.lineTo(x * 0.15, y * 0.1 + 5);
            ctx.stroke();
        }
        if (animated) {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 3; i++) {
                const phase = (time * 0.6 + i / 3) % 1;
                ctx.globalAlpha =
                    Math.sin(phase * Math.PI) * 0.7 * Math.min(1, patch.life);
                ctx.fillRect(
                    Math.cos(i * 2.4) * radius * 0.6,
                    Math.sin(i * 2.4) * radius * 0.4 - phase * 12,
                    2,
                    2
                );
            }
        }
        ctx.restore();
    }
}

export function paintSnowShot(
    ctx: CanvasRenderingContext2D,
    shot: Shot,
    animated: boolean
) {
    const progress = animated ? 1 - shot.life / (shot.duration ?? 0.36) : 0.65;
    const dx = shot.to.x - shot.from.x,
        dy = shot.to.y - shot.from.y;
    const angle = Math.atan2(dy, dx);
    ctx.save();
    ctx.globalAlpha = Math.min(1, shot.life / 0.08);
    ctx.lineCap = 'round';
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#bbecff33';
    ctx.beginPath();
    ctx.moveTo(shot.from.x, shot.from.y);
    ctx.lineTo(shot.to.x, shot.to.y);
    ctx.stroke();
    ctx.strokeStyle = '#f0fbff';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) {
        const travel = animated
            ? Math.min(1, Math.max(0, progress * 1.4 - i * 0.055))
            : (i + 1) / 10;
        const spread = Math.sin(i * 2.4) * (4 + travel * 12);
        snowflake(
            ctx,
            shot.from.x + dx * travel - Math.sin(angle) * spread,
            shot.from.y + dy * travel + Math.cos(angle) * spread,
            3 + (i % 3),
            animated ? progress * 3 + i : i
        );
    }
    ctx.restore();
}

export function paintFrozenFeet(
    ctx: CanvasRenderingContext2D,
    point: Point,
    strength: number
) {
    ctx.save();
    ctx.translate(point.x, point.y + 24);
    ctx.globalAlpha = 0.35 + strength * 0.5;
    ctx.fillStyle = '#9adfff';
    ctx.strokeStyle = '#eaffff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const x = (i - 1) * 13,
            height = 7 + strength * 12 + (i % 2) * 3;
        ctx.beginPath();
        ctx.moveTo(x - 5, 0);
        ctx.lineTo(x - 4, -height * 0.7);
        ctx.lineTo(x, -height);
        ctx.lineTo(x + 4, -height * 0.6);
        ctx.lineTo(x + 5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}
