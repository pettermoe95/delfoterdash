import { GROUND, RIDER_HEIGHT } from './engine';
import { paintFjord } from './fjordScenery';
import { drawSurfer } from './surfer';
import type { DashState, Hazard } from './types';
import { worldFor } from './worlds';

export const HEIGHT = 600;
export const PLAYER_X = 180;
function path(
    ctx: CanvasRenderingContext2D,
    data: string,
    fill: string,
    stroke?: string
) {
    const shape = new Path2D(data);
    ctx.fillStyle = fill;
    ctx.fill(shape);
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke(shape);
    }
}
function obstacle(
    ctx: CanvasRenderingContext2D,
    h: Hazard,
    x: number,
    game: DashState,
    time: number
) {
    const { accent, secondary } = game.level;
    ctx.save();
    ctx.translate(x, GROUND);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = h.kind === 'pad' || h.kind === 'orb' ? accent : secondary;
    if (h.kind === 'spike') {
        for (let i = 0; i < h.width; i += 34) {
            path(
                ctx,
                `M${i} 0 L${i + 17} -${h.height} L${i + 34} 0Z`,
                '#412b58',
                secondary
            );
            path(
                ctx,
                `M${i + 11} -8 L${i + 17} -${h.height - 11} L${i + 23} -8Z`,
                secondary
            );
        }
    } else if (h.kind === 'block') {
        ctx.fillStyle = '#173d59';
        ctx.fillRect(0, -h.height, h.width, h.height);
        ctx.strokeStyle = accent;
        ctx.strokeRect(0, -h.height, h.width, h.height);
        ctx.fillStyle = accent;
        ctx.fillRect(0, -h.height, h.width, 4);
        if (worldFor(game.level).theme === 'frost') {
            path(
                ctx,
                `M0 -${h.height} L${h.width * 0.55} -${h.height * 0.6} L${h.width} 0 L0 0Z`,
                '#86c9e329'
            );
            path(
                ctx,
                `M${h.width} -${h.height} L${h.width * 0.55} -${h.height * 0.6} L${h.width * 0.7} 0`,
                '#b6e7ff22'
            );
        }
        ctx.globalAlpha = 0.3;
        ctx.fillRect(8, -h.height + 12, h.width - 16, 3);
        ctx.fillRect(8, -h.height + 24, h.width - 16, 3);
    } else if (h.kind === 'saw') {
        ctx.translate(h.width / 2, -35);
        ctx.rotate(time * 3);
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
            const a = (i * Math.PI) / 12,
                r = i % 2 ? 21 : 29;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#3d2f55';
        ctx.fill();
        ctx.strokeStyle = secondary;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#f0d2f9';
        ctx.stroke();
        ctx.fillStyle = secondary;
        ctx.fillRect(-3, -3, 6, 6);
    } else if (h.kind === 'laser') {
        const phased = game.elapsed < game.phaseUntil;
        ctx.globalAlpha = phased ? 0.45 : 1;
        ctx.shadowColor = '#ff628f';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ff628f44';
        ctx.fillRect(-7, -h.height, h.width + 14, h.height);
        ctx.fillStyle = '#ff628f';
        ctx.fillRect(0, -h.height, h.width, h.height);
        ctx.fillStyle = '#ffe8f4';
        ctx.fillRect(h.width * 0.4, -h.height, h.width * 0.2, h.height);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#243e59';
        ctx.strokeStyle = '#e5c2f6';
        ctx.fillRect(-9, -h.height - 8, h.width + 18, 12);
        ctx.strokeRect(-9, -h.height - 8, h.width + 18, 12);
        ctx.fillRect(-9, -5, h.width + 18, 8);
    } else if (h.kind === 'pad') {
        ctx.globalAlpha = game.used.has(h.id) ? 0.35 : 1;
        path(ctx, `M0 0 Q${h.width / 2} -24 ${h.width} 0Z`, '#245c72', accent);
        path(ctx, 'M17 -8 L26 -18 L35 -8', accent, accent);
    } else if (h.kind === 'orb') {
        if (!game.used.has(h.id)) {
            ctx.translate(h.width / 2, (h.y ?? 285) - GROUND);
            if (h.required) {
                ctx.font = '800 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8fbff';
                ctx.fillText(h.sequence ? `TAP ${h.sequence}` : 'TAP', 0, -39);
            }
            ctx.rotate(time);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 19, 0, Math.PI * 1.6);
            ctx.stroke();
            ctx.rotate(-time * 2);
            ctx.strokeStyle = secondary;
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, Math.PI * 1.4);
            ctx.stroke();
            path(ctx, 'M0 -10 L10 0 L0 10 L-10 0Z', accent);
        }
    }
    ctx.restore();
}
export function paintDash(
    ctx: CanvasRenderingContext2D,
    game: DashState,
    width: number,
    clock: number,
    animated: boolean
) {
    const { level } = game;
    const t = animated ? clock : 0;
    const run = game.distance;
    const pulse = animated
        ? Math.max(0, 1 - (((game.elapsed * level.bpm) / 60) % 1))
        : 0.25;
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, level.sky);
    gradient.addColorStop(1, '#071525');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, HEIGHT);
    for (let i = 0; i < 65; i++) {
        const x = (((i * 173 - run * 0.05) % width) + width) % width,
            y = 25 + ((i * 67) % 290);
        ctx.globalAlpha = 0.35 + (i % 4) * 0.12;
        ctx.fillStyle = i % 5 ? '#7198c5' : level.accent;
        ctx.fillRect(x, y, i % 7 ? 1.5 : 3, 1.5);
    }
    ctx.globalAlpha = 1;
    if (worldFor(level).theme === 'frost') paintFjord(ctx, width, run, t);
    else {
        const moonX = width * 0.79 - ((run * 0.015) % width);
        ctx.shadowBlur = 35 + pulse * 15;
        ctx.shadowColor = level.secondary;
        ctx.fillStyle = level.secondary;
        ctx.beginPath();
        ctx.arc(moonX, 137, 53, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = level.sky;
        for (let i = 0; i < 8; i++)
            ctx.fillRect(moonX - 56, 139 + i * 8, 112, 2 + i * 0.45);
        for (let layer = 0; layer < 2; layer++) {
            const step = layer ? 72 : 125,
                offset = (run * (layer ? 0.22 : 0.1)) % step;
            for (let x = -step; x < width + step; x += step) {
                const index =
                    Math.floor(x / step) +
                    Math.floor((run * (layer ? 0.22 : 0.1)) / step);
                const h = 45 + Math.abs(Math.sin(index * 3.7 + layer)) * 110;
                ctx.fillStyle = layer ? '#142944' : '#111e38';
                ctx.fillRect(x - offset, GROUND - h, step - 8, h);
                if (layer) {
                    ctx.fillStyle = level.accent;
                    ctx.globalAlpha = 0.2;
                    for (let y = GROUND - h + 12; y < GROUND - 10; y += 16)
                        ctx.fillRect(x - offset + 12, y, 5, 3);
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    ctx.strokeStyle = level.accent;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    for (let y = 340; y < GROUND; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = worldFor(level).theme === 'frost' ? '#102b40' : '#091b2e';
    ctx.fillRect(0, GROUND, width, HEIGHT - GROUND);
    ctx.strokeStyle = '#1a3850';
    for (let i = -8; i < 16; i++) {
        const x = i * 140 - ((run * 0.7) % 140);
        ctx.beginPath();
        ctx.moveTo(width / 2 + (x - width / 2) * 0.7, GROUND);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
    }
    for (let y = GROUND + 15; y < HEIGHT; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.fillStyle = level.accent;
    ctx.shadowColor = level.accent;
    ctx.shadowBlur = 10 + pulse * 8;
    ctx.fillRect(0, GROUND, width, 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = level.accent;
    ctx.globalAlpha = 0.1 + pulse * 0.07;
    ctx.fillRect(0, GROUND + 4, width, 12);
    ctx.globalAlpha = 1;
    const screen = (x: number) => x - run + PLAYER_X;
    for (const h of level.hazards)
        if (h.kind === 'gap') {
            const x = screen(h.x);
            if (x > width || x + h.width < 0) continue;
            if (h.section?.includes('ring')) {
                ctx.fillStyle = level.accent;
                ctx.font = '800 8px sans-serif';
                ctx.fillText('JUMP', x - 95, GROUND - 14);
                ctx.beginPath();
                ctx.moveTo(x - 88, GROUND - 7);
                ctx.lineTo(x - 80, GROUND - 12);
                ctx.lineTo(x - 72, GROUND - 7);
                ctx.strokeStyle = level.accent;
                ctx.stroke();
            }
            ctx.fillStyle = '#050b1c';
            ctx.fillRect(x, GROUND - 1, h.width, HEIGHT - GROUND + 1);
            ctx.strokeStyle = level.secondary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, GROUND);
            ctx.lineTo(x, HEIGHT);
            ctx.moveTo(x + h.width, GROUND);
            ctx.lineTo(x + h.width, HEIGHT);
            ctx.stroke();
            ctx.fillStyle = level.secondary;
            ctx.globalAlpha = 0.35;
            for (let i = 0; i < h.width; i += 18)
                ctx.fillRect(x + i, HEIGHT - 12, 8, 4);
            ctx.globalAlpha = 1;
        }
    for (const shell of level.shells) {
        const x = screen(shell.x);
        if (x < -30 || x > width + 30 || game.shells.has(shell.id)) continue;
        ctx.save();
        ctx.translate(
            x,
            shell.y + (animated ? Math.sin(t * 4 + shell.id) * 3 : 0)
        );
        ctx.rotate(Math.PI / 4);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffdc80';
        ctx.fillStyle = '#ffda79';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = '#fff5c9';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
    }
    for (const h of level.hazards)
        if (
            h.kind !== 'gap' &&
            screen(h.x) < width + 70 &&
            screen(h.x) + h.width > -70
        )
            obstacle(ctx, h, screen(h.x), game, t);
    // Ground wake and airborne spray trail.
    if (game.phase !== 'dead') {
        if (animated)
            for (let i = 0; i < 15; i++) {
                const age = (t * 3 + i / 15) % 1;
                ctx.globalAlpha = (1 - age) * 0.6;
                ctx.fillStyle = i % 3 ? level.accent : '#f3ffff';
                const y = game.y + RIDER_HEIGHT + Math.sin(i * 2.4) * age * 16;
                ctx.fillRect(
                    PLAYER_X - 35 - age * (game.grounded ? 150 : 90),
                    y + age * 10,
                    3 + age * 5,
                    2
                );
            }
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.translate(PLAYER_X, game.y + RIDER_HEIGHT - 35);
        if (game.elapsed < game.phaseUntil) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#d3bbff';
            if (animated)
                for (let i = 3; i > 0; i--) {
                    ctx.save();
                    ctx.translate(-i * 14, 0);
                    ctx.globalAlpha = 0.12;
                    drawSurfer(ctx, t, level.accent, !game.grounded, game.flip);
                    ctx.restore();
                }
            ctx.globalAlpha = 0.65;
            ctx.strokeStyle = '#d4bfff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -3, 49, 55, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        drawSurfer(ctx, t, level.accent, !game.grounded && animated, game.flip);
        ctx.restore();
    }
    for (const burst of game.bursts) {
        const life = 1 - burst.age,
            radius = burst.kind === 'crash' ? 160 : 65;
        ctx.save();
        ctx.translate(screen(burst.x), burst.y);
        ctx.fillStyle = burst.color;
        for (let i = 0; i < (burst.kind === 'crash' ? 28 : 12); i++) {
            const a = i * 2.399,
                travel = animated ? burst.age : 0.3;
            ctx.globalAlpha = life;
            ctx.save();
            ctx.translate(
                Math.cos(a) * radius * travel,
                Math.sin(a) * radius * travel + travel * travel * 80
            );
            ctx.rotate(t + i);
            ctx.fillRect(-3, -2, burst.kind === 'crash' ? 9 : 5, 4);
            ctx.restore();
        }
        ctx.restore();
    }
    const finish = screen(level.length);
    if (finish < width + 40) {
        ctx.save();
        ctx.strokeStyle = level.accent;
        ctx.lineWidth = 5;
        ctx.shadowColor = level.accent;
        ctx.shadowBlur = 20;
        ctx.strokeRect(finish, GROUND - 240, 25, 240);
        ctx.fillStyle = '#e4fbff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('FINISH', finish - 20, GROUND - 260);
        ctx.restore();
    }
    // Gentle vignette leaves the play lane clear.
    const vignette = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    vignette.addColorStop(0, '#04091955');
    vignette.addColorStop(0.5, '#04091900');
    vignette.addColorStop(1, '#04091977');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, HEIGHT);
}
