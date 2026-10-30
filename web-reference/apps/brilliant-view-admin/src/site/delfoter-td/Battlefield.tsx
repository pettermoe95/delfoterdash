import { useEffect, useRef } from 'react';
import { ARENA, arenaLayout, fieldScale, paintBattle } from './canvasRenderer';
import { paintMap } from './canvasScenery';
import type { GameState, Point, TowerKind } from './types';

type Props = {
    game: GameState;
    selected: number | null;
    purchasing: TowerKind | null;
    paused: boolean;
    onPlace: (point: Point) => void;
    onSelect: (id: number | null) => void;
};

export function Battlefield(props: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const layout = useRef(
        arenaLayout(ARENA.width, ARENA.height, props.game.map)
    );
    const latest = useRef(props);
    latest.current = props;
    const cursor = useRef<Point>({ ...props.game.map.pads[2] });
    useEffect(() => {
        const element = canvas.current;
        const ctx = element?.getContext('2d');
        if (!ctx || !element) return;
        const mapLayer = document.createElement('canvas');
        mapLayer.width = props.game.map.width * 2;
        mapLayer.height = props.game.map.height * 2;
        const mapContext = mapLayer.getContext('2d');
        if (!mapContext) return;
        mapContext.scale(2, 2);
        paintMap(mapContext, props.game.map);
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = element.getBoundingClientRect();
            layout.current = arenaLayout(
                rect.width,
                rect.height,
                props.game.map
            );
            element.width = Math.round(rect.width * dpr);
            element.height = Math.round(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let clock = 0;
        let previous = 0;
        const draw = (now: number) => {
            const current = latest.current;
            if (!document.hidden) {
                if (!current.paused)
                    clock += previous
                        ? Math.min((now - previous) / 1000, 0.05)
                        : 0;
                paintBattle(
                    ctx,
                    current.game,
                    mapLayer,
                    clock,
                    current.selected,
                    current.purchasing
                        ? { kind: current.purchasing, position: cursor.current }
                        : null,
                    !motion.matches,
                    layout.current
                );
            }
            previous = now;
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [props.game.map]);

    function pointerPoint(clientX: number, clientY: number): Point {
        const rect = canvas.current!.getBoundingClientRect();
        return {
            x:
                (clientX - rect.left - layout.current.x) /
                fieldScale(props.game.map, layout.current),
            y:
                (clientY - rect.top - layout.current.y) /
                fieldScale(props.game.map, layout.current),
        };
    }

    function interact(point: Point) {
        if (
            point.x < 0 ||
            point.x > props.game.map.width ||
            point.y < 0 ||
            point.y > props.game.map.height
        )
            return;
        if (props.purchasing) props.onPlace(point);
        else
            props.onSelect(
                props.game.towers.find(
                    (tower) =>
                        Math.hypot(
                            tower.position.x - point.x,
                            tower.position.y - point.y
                        ) < 36
                )?.id ?? null
            );
    }
    return (
        <canvas
            ref={canvas}
            className={`td-arena-canvas ${props.purchasing ? 'is-placing' : ''}`}
            width={ARENA.width}
            height={ARENA.height}
            tabIndex={0}
            aria-label={`${props.game.map.name} game field. ${props.purchasing ? 'Move to clear ground and click to deploy. Use arrow keys then Enter with the keyboard. Escape cancels.' : 'Select a defender to upgrade, or use a Purchase button in the shop.'}`}
            onPointerMove={(event) => {
                cursor.current = pointerPoint(event.clientX, event.clientY);
            }}
            onPointerDown={(event) => {
                if (event.button !== 0) return;
                const point = pointerPoint(event.clientX, event.clientY);
                cursor.current = point;
                interact(point);
            }}
            onKeyDown={(event) => {
                const movement: Record<string, Point> = {
                    ArrowUp: { x: 0, y: -10 },
                    ArrowDown: { x: 0, y: 10 },
                    ArrowLeft: { x: -10, y: 0 },
                    ArrowRight: { x: 10, y: 0 },
                };
                const delta = movement[event.key];
                if (delta) {
                    event.preventDefault();
                    cursor.current = {
                        x: Math.max(
                            50,
                            Math.min(
                                props.game.map.width - 70,
                                cursor.current.x + delta.x
                            )
                        ),
                        y: Math.max(
                            50,
                            Math.min(
                                props.game.map.height - 55,
                                cursor.current.y + delta.y
                            )
                        ),
                    };
                }
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    interact(cursor.current);
                }
            }}
        >
            Your browser needs canvas support to play Delfoter TD.
        </canvas>
    );
}
