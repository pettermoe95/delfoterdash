import { ellipse, shape } from './canvasCharacters';
import { distanceToPath, normalizedMap } from './maps';
import type { GameMap } from './types';

export function paintMap(ctx: CanvasRenderingContext2D, sourceMap: GameMap) {
    ctx.save();
    ctx.scale(sourceMap.width / 900, sourceMap.height / 520);
    const map = normalizedMap(sourceMap);
    const night = map.id === 'lagoon';
    const sea = ctx.createLinearGradient(0, 0, 900, 520);
    sea.addColorStop(0, night ? '#101c51' : '#05526f');
    sea.addColorStop(1, night ? '#174a7d' : '#078fa4');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, 900, 520);
    ctx.shadowColor = '#061c46';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.roundRect(25, 18, 850, 475, 65);
    ctx.fillStyle = night ? '#276077' : '#e3ad53';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const grass = ctx.createLinearGradient(0, 20, 600, 490);
    grass.addColorStop(0, night ? '#245f68' : '#4eaa45');
    grass.addColorStop(0.5, map.ground);
    grass.addColorStop(1, night ? '#183b54' : '#256e43');
    ctx.beginPath();
    ctx.roundRect(37, 27, 826, 450, 60);
    ctx.fillStyle = grass;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = night ? '#428c8c' : '#7ac254';
    ctx.stroke();
    for (let i = 0; i < 220; i++) {
        const x = 65 + ((i * 79) % 765);
        const y = 48 + ((i * 137) % 405);
        if (distanceToPath(map, { x, y }) < 39) continue;
        if (i % 7 === 0) {
            ellipse(ctx, x, y, 7, 4, night ? '#389294' : '#29673b');
            ellipse(ctx, x - 2, y - 2, 4, 3, night ? '#58a1a0' : '#66af50');
        } else if (i % 5 === 0) {
            ellipse(ctx, x, y, 2.5, 2.5, night ? '#bc94ff' : '#ffe776');
            ellipse(ctx, x + 3, y + 3, 2.5, 2.5, night ? '#7d9dff' : '#ff9b63');
        } else {
            ctx.strokeStyle = night ? '#48927d66' : '#a2d75b66';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - 3, y + 3);
            ctx.lineTo(x, y - 4);
            ctx.lineTo(x + 2, y + 2);
            ctx.lineTo(x + 5, y - 2);
            ctx.stroke();
        }
    }
    ctx.beginPath();
    map.path.forEach((point, index) =>
        index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)
    );
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [width, color] of [
        [69, '#123c3e88'],
        [61, night ? '#806c61' : '#a46c35'],
        [53, night ? '#c5ad87' : '#ecc078'],
        [39, night ? '#d4bd95' : '#f6d798'],
    ] as const) {
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    for (let i = 0; i < 180; i++) {
        const point = { x: (i * 83) % 900, y: (i * 157) % 520 };
        if (distanceToPath(map, point) < 20)
            ellipse(ctx, point.x, point.y, 1.5 + (i % 3), 1, '#97734f55');
    }
    // Seaside details stay in the map layer, so every frame only repaints moving elements.
    for (const [x, y, rotation] of [
        [57, 462, -0.3],
        [842, 49, 0.5],
        [52, 40, -0.9],
    ]) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        shape(
            ctx,
            'M-4 27 Q-8 1 3 -24 L10 -24 Q-2 4 4 27Z',
            '#a86c3b',
            '#694428'
        );
        for (let leaf = 0; leaf < 5; leaf++) {
            ctx.save();
            ctx.translate(6, -23);
            ctx.rotate(leaf * 1.18);
            shape(
                ctx,
                'M0 0 Q-5 -24 28 -33 Q13 -17 0 0Z',
                night ? '#258d79' : '#72c941',
                '#21593f',
                1.5
            );
            ctx.restore();
        }
        ellipse(ctx, 6, -22, 5, 6, '#b87936');
        ctx.restore();
    }
    ctx.save();
    ctx.translate(map.home.x, map.home.y - 3);
    ellipse(ctx, 0, 29, 40, 11, '#122c4677');
    shape(ctx, 'M-25 20 L-20 -29 L19 -29 L26 20Z', '#fff4c7', '#684721', 3);
    shape(ctx, 'M-22 -8 H22 V4 H-24Z', '#ec6845');
    shape(ctx, 'M-28 -29 L0 -50 L28 -29Z', '#f87439', '#a73b29', 3);
    shape(ctx, 'M-8 20 V5 Q0 -5 8 5 V20Z', '#094e69');
    shape(ctx, 'M-9 -28 H9 V-17 H-9Z', '#4be7ed', '#1b7480');
    ctx.shadowColor = '#7ef9ff';
    ctx.shadowBlur = 18;
    ellipse(ctx, 0, -22, 4, 4, '#c9ffff');
    ctx.restore();
    ctx.font = '800 11px Inter, sans-serif';
    ctx.fillStyle = '#eaffed';
    ctx.fillText('HOME REEF', map.home.x - 35, map.home.y + 52);
    ctx.restore();
}

export function paintAmbient(
    ctx: CanvasRenderingContext2D,
    sourceMap: GameMap,
    time: number
) {
    const map = normalizedMap(sourceMap);
    ctx.save();
    ctx.scale(sourceMap.width / 900, sourceMap.height / 520);
    for (let i = 0; i < 22; i++) {
        const x = (i * 113 + time * 7) % 900;
        const y =
            i % 2 ? 505 + Math.sin(time + i) * 3 : 6 + Math.sin(time + i) * 3;
        ctx.strokeStyle = '#6ff8ff55';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 9, y + 5, x + 22, y);
        ctx.stroke();
    }
    for (let i = 0; i < 16; i++) {
        const x = 65 + ((i * 197) % 760);
        const y = 48 + ((i * 117) % 390);
        if (distanceToPath(map, { x, y }) < 42) continue;
        ctx.globalAlpha = 0.25 + Math.max(0, Math.sin(time * 2 + i)) * 0.65;
        ctx.shadowBlur = 7;
        ctx.shadowColor = map.id === 'lagoon' ? '#82eeff' : '#fff56a';
        ellipse(
            ctx,
            x + Math.sin(time + i) * 7,
            y + Math.cos(time * 0.7 + i) * 5,
            1.7,
            1.7,
            map.id === 'lagoon' ? '#b6f9ff' : '#fff3a0'
        );
    }
    ctx.restore();
}
