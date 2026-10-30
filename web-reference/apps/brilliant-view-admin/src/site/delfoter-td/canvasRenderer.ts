import { ellipse, shape } from './canvasCharacters';
import { paintAmbient } from './canvasScenery';
import { drawCharacter } from './characterRenderer';
import { ENEMIES } from './enemies';
import { canDeployAt } from './engine';
import {
    paintFrostGround,
    paintFrozenFeet,
    paintSnowShot,
} from './frostRendering';
import { pathPosition } from './maps';
import { TOWERS, towerStats } from './towers';
import type { GameMap, GameState, Point, TowerKind } from './types';
import { weaponRecoil } from './weaponAim';

export type ArenaLayout = {
    width: number;
    height: number;
    x: number;
    y: number;
    fieldWidth: number;
    fieldHeight: number;
};

// Keep the map proportional inside the space left by the HUD and recruit dock.
export function arenaLayout(
    width: number,
    height: number,
    map: GameMap
): ArenaLayout {
    const availableWidth = Math.max(1, width - 208);
    const availableHeight = Math.max(1, height - 146);
    const scale = Math.min(
        availableWidth / map.width,
        availableHeight / map.height
    );
    const fieldWidth = map.width * scale;
    const fieldHeight = map.height * scale;
    return {
        width,
        height,
        x: 8 + (availableWidth - fieldWidth) / 2,
        y: 80 + (availableHeight - fieldHeight) / 2,
        fieldWidth,
        fieldHeight,
    };
}
export const ARENA = { width: 1440, height: 900 };
export const fieldScale = (map: GameMap, arena: ArenaLayout) =>
    Math.min(arena.fieldWidth / map.width, arena.fieldHeight / map.height);
export type PlacementPreview = { kind: TowerKind; position: Point };

function range(
    ctx: CanvasRenderingContext2D,
    point: Point,
    radius: number,
    color: string,
    time: number
) {
    ctx.save();
    ctx.translate(point.x, point.y);
    ellipse(ctx, 0, 0, radius, radius, `${color}18`);
    ctx.setLineDash([7, 8]);
    ctx.lineDashOffset = -time * 12;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

export function paintBattle(
    ctx: CanvasRenderingContext2D,
    game: GameState,
    mapLayer: HTMLCanvasElement,
    time: number,
    selected: number | null,
    preview: PlacementPreview | null,
    animated: boolean,
    arena: ArenaLayout
) {
    ctx.clearRect(0, 0, arena.width, arena.height);
    const background = ctx.createLinearGradient(
        0,
        0,
        arena.width,
        arena.height
    );
    background.addColorStop(
        0,
        game.map.id === 'lagoon' ? '#23344e' : '#18364d'
    );
    background.addColorStop(
        1,
        game.map.id === 'lagoon' ? '#0f192e' : '#0d2032'
    );
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, arena.width, arena.height);
    ctx.save();
    ctx.translate(arena.x, arena.y);
    ctx.scale(fieldScale(game.map, arena), fieldScale(game.map, arena));
    ctx.beginPath();
    ctx.roundRect(0, 0, game.map.width, game.map.height, 18);
    ctx.clip();
    ctx.drawImage(mapLayer, 0, 0, game.map.width, game.map.height);
    paintAmbient(ctx, game.map, animated ? time : 0);
    paintFrostGround(ctx, game.frostPatches, game.time, animated);
    const tower = game.towers.find((item) => item.id === selected);
    if (tower)
        range(ctx, tower.position, towerStats(tower).range, '#5fe6ff', time);
    for (const defender of game.towers) {
        ctx.save();
        ctx.translate(defender.position.x, defender.position.y);
        const color = TOWERS[defender.kind].color;
        ellipse(ctx, 0, 17, 34, 20, '#123c4588', '#64c8a766');
        if (defender.id === selected) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 17, 35, 21, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        const recoil =
            game.phase === 'wave'
                ? weaponRecoil(
                      TOWERS[defender.kind].appearance,
                      game.time,
                      defender.lastFiredAt
                  )
                : 0;
        drawCharacter(
            ctx,
            TOWERS[defender.kind].appearance,
            color,
            animated ? time + defender.id : 0,
            {
                angle: defender.angle,
                level: defender.level,
                facing: defender.facing,
                recoil: animated ? recoil : 0,
                firing: game.phase === 'wave' && recoil > 0.05,
            }
        );
        ctx.restore();
    }
    for (const enemy of [...game.enemies].sort(
        (a, b) =>
            pathPosition(game.map, a.distance).y -
            pathPosition(game.map, b.distance).y
    )) {
        const point = pathPosition(game.map, enemy.distance);
        const ahead = pathPosition(game.map, enemy.distance + 3);
        const definition = ENEMIES[enemy.kind];
        ctx.save();
        ctx.translate(point.x, point.y);
        if (ahead.x < point.x) ctx.scale(-1, 1);
        drawCharacter(
            ctx,
            definition.appearance,
            definition.color,
            animated ? game.time : 0,
            { seed: enemy.id }
        );
        ctx.restore();
        if (
            game.time < enemy.slowUntil &&
            enemy.slowEffects?.some(
                (effect) => effect.stackFactor > 0 && effect.until > game.time
            )
        )
            paintFrozenFeet(ctx, point, enemy.slow);
        const width = definition.appearance.healthBar.width;
        const top = point.y - definition.appearance.healthBar.offset;
        ctx.fillStyle = '#071424';
        ctx.fillRect(point.x - width / 2 - 1, top - 1, width + 2, 6);
        ctx.fillStyle = game.time < enemy.slowUntil ? '#4de1ff' : '#ff4969';
        ctx.fillRect(
            point.x - width / 2,
            top,
            width * Math.max(0, enemy.health / enemy.maxHealth),
            4
        );
        if (enemy.shield > 0 && definition.shield) {
            ctx.fillStyle = '#69f0ff';
            ctx.fillRect(
                point.x - width / 2,
                top - 5,
                (width * enemy.shield) / (enemy.maxShield ?? definition.shield),
                2
            );
        }
    }
    for (const missile of game.missiles) {
        ctx.save();
        ctx.translate(missile.position.x, missile.position.y);
        const angle = Math.atan2(
            missile.target.y - missile.position.y,
            missile.target.x - missile.position.x
        );
        ctx.rotate(angle);
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffba56';
        shape(ctx, 'M-10 -4 L-26 0 L-10 4Z', '#ffb83e');
        ctx.shadowBlur = 0;
        shape(ctx, 'M-11 -5 H7 L15 0 L7 5 H-11Z', '#d6ffff', '#1d5263', 1.5);
        shape(ctx, 'M7 -5 L15 0 L7 5Z', '#fb9a46');
        shape(
            ctx,
            'M-8 -5 L-14 -10 L-12 -3 M-8 5 L-14 10 L-12 3',
            '#64dce7',
            '#1d5263',
            1
        );
        ctx.restore();
    }
    for (const shot of game.shots) {
        const progress = 1 - shot.life / (shot.duration ?? 0.18);
        if (shot.mode === 'snow') {
            paintSnowShot(ctx, shot, animated);
            continue;
        }
        if (shot.mode === 'pellet') {
            ctx.save();
            ctx.globalAlpha = Math.min(1, shot.life / 0.045);
            const angle = Math.atan2(
                shot.to.y - shot.from.y,
                shot.to.x - shot.from.x
            );
            for (let i = 0; i < 3; i++) {
                const travel = Math.min(1, Math.max(0, progress - i * 0.14));
                ctx.save();
                ctx.translate(
                    shot.from.x + (shot.to.x - shot.from.x) * travel,
                    shot.from.y + (shot.to.y - shot.from.y) * travel
                );
                ctx.rotate(angle);
                ellipse(
                    ctx,
                    0,
                    0,
                    shot.width * (1.8 - i * 0.4),
                    shot.width * 0.65,
                    shot.color
                );
                ellipse(ctx, 1, -0.5, 2, 1, shot.coreColor);
                ctx.restore();
            }
            ctx.restore();
            continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, shot.life / 0.09);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 9;
        ctx.shadowColor = shot.color;
        ctx.beginPath();
        ctx.moveTo(shot.from.x, shot.from.y);
        ctx.lineTo(shot.to.x, shot.to.y);
        ctx.lineWidth = shot.width;
        ctx.strokeStyle = shot.color;
        ctx.stroke();
        ctx.lineWidth = shot.width / 2;
        ctx.strokeStyle = shot.coreColor;
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (let i = 0; i < 7; i++) {
            const angle = (i * Math.PI * 2) / 7;
            const radius = (shot.splash || 20) * progress;
            ellipse(
                ctx,
                shot.to.x + Math.cos(angle) * radius,
                shot.to.y + Math.sin(angle) * radius,
                2.5 * (1 - progress) + 1,
                3.5,
                shot.particleColor
            );
        }
        ctx.restore();
    }
    for (const burst of game.bursts) {
        const progress = 1 - burst.life / 0.8;
        ctx.save();
        ctx.translate(burst.position.x, burst.position.y);
        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = '#9cf8ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
            0,
            0,
            burst.radius * progress,
            burst.radius * progress * 0.55,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            ctx.save();
            ctx.translate(
                Math.cos(angle) * burst.radius * progress,
                Math.sin(angle) * burst.radius * progress * 0.6 -
                    Math.sin(progress * Math.PI) * 22
            );
            ctx.rotate(angle + progress * 3);
            ctx.fillStyle = burst.color;
            ctx.fillRect(-6, -2, 12, 4);
            ctx.restore();
        }
        ctx.restore();
    }
    if (preview) {
        const valid =
            canDeployAt(game, preview.position) &&
            game.coins >= TOWERS[preview.kind].cost;
        range(
            ctx,
            preview.position,
            TOWERS[preview.kind].stats.range,
            valid ? '#86ffac' : '#ff456a',
            time
        );
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.translate(preview.position.x, preview.position.y);
        ellipse(ctx, 0, 17, 34, 20, valid ? '#22ff8766' : '#ff204c88');
        drawCharacter(
            ctx,
            TOWERS[preview.kind].appearance,
            TOWERS[preview.kind].color,
            animated ? time : 0
        );
        ctx.restore();
    }
    // A warning gate marks the exact entry point.
    const entry = game.map.path[0].y;
    ctx.strokeStyle = '#ff5073';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(12, entry - 29);
    ctx.lineTo(12, entry + 29);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '800 10px Inter, sans-serif';
    ctx.fillStyle = '#ffe4df';
    ctx.fillText('AI ENTRY', 12, entry - 39);
    ctx.restore();
}
