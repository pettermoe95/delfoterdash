import type { GameMap, Point } from './types';

const layouts = [
    {
        id: 'cove',
        name: 'Bubble Cove',
        description:
            'A sunny seaside loop. A gentle place for a very ungentle invasion.',
        ground: '#398b4a',
        path: [
            { x: -35, y: 130 },
            { x: 220, y: 130 },
            { x: 220, y: 350 },
            { x: 465, y: 350 },
            { x: 465, y: 155 },
            { x: 695, y: 155 },
            { x: 695, y: 440 },
            { x: 850, y: 440 },
        ],
        pads: [
            { x: 105, y: 220 },
            { x: 120, y: 55 },
            { x: 315, y: 220 },
            { x: 330, y: 440 },
            { x: 545, y: 260 },
            { x: 575, y: 65 },
            { x: 790, y: 235 },
            { x: 790, y: 355 },
            { x: 595, y: 445 },
        ],
    },
    {
        id: 'lagoon',
        name: 'Moonlit Lagoon',
        description:
            'Long switchbacks beneath a lavender sky. Watch the last bend.',
        ground: '#274e66',
        path: [
            { x: -35, y: 90 },
            { x: 750, y: 90 },
            { x: 750, y: 265 },
            { x: 155, y: 265 },
            { x: 155, y: 435 },
            { x: 850, y: 435 },
        ],
        pads: [
            { x: 120, y: 170 },
            { x: 285, y: 175 },
            { x: 455, y: 175 },
            { x: 625, y: 175 },
            { x: 830, y: 180 },
            { x: 75, y: 350 },
            { x: 285, y: 350 },
            { x: 465, y: 350 },
            { x: 650, y: 350 },
            { x: 815, y: 350 },
        ],
    },
];

// A larger coordinate space creates two-row build lanes without shrinking placement clearance.
export const MAPS: GameMap[] = layouts.map((layout) => {
    const point = (position: Point): Point => ({
        x: (position.x * 1100) / 900,
        y: (position.y * 650) / 520,
    });
    const path = layout.path.map(point);
    return {
        ...layout,
        width: 1100,
        height: 650,
        home: path[path.length - 1],
        path,
        pads: layout.pads.map(point),
    };
});

export function normalizedMap(map: GameMap): GameMap {
    const point = (position: Point): Point => ({
        x: (position.x * 900) / map.width,
        y: (position.y * 520) / map.height,
    });
    return {
        ...map,
        width: 900,
        height: 520,
        path: map.path.map(point),
        home: point(map.home),
    };
}

export const distance = (a: Point, b: Point) =>
    Math.hypot(a.x - b.x, a.y - b.y);

export function distanceToPath(map: GameMap, point: Point) {
    return Math.min(
        ...map.path.slice(1).map((end, index) => {
            const start = map.path[index];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const lengthSquared = dx * dx + dy * dy;
            const t = lengthSquared
                ? Math.max(
                      0,
                      Math.min(
                          1,
                          ((point.x - start.x) * dx +
                              (point.y - start.y) * dy) /
                              lengthSquared
                      )
                  )
                : 0;
            return distance(point, {
                x: start.x + t * dx,
                y: start.y + t * dy,
            });
        })
    );
}
export const pathLength = (map: GameMap) =>
    map.path
        .slice(1)
        .reduce((sum, point, i) => sum + distance(map.path[i], point), 0);
export function pathPosition(map: GameMap, progress: number): Point {
    for (let i = 1; i < map.path.length; i++) {
        const a = map.path[i - 1];
        const b = map.path[i];
        const length = distance(a, b);
        if (progress <= length)
            return {
                x: a.x + ((b.x - a.x) * progress) / length,
                y: a.y + ((b.y - a.y) * progress) / length,
            };
        progress -= length;
    }
    return map.path[map.path.length - 1];
}
