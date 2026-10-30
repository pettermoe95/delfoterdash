import { useEffect, useRef } from 'react';
import { HEIGHT, paintDash } from './renderer';
import type { DashState } from './types';

export function DashCanvas({
    game,
    onJump,
    onRelease,
}: {
    game: DashState;
    onJump: () => void;
    onRelease: () => void;
}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const current = useRef(game);
    current.current = game;
    useEffect(() => {
        const element = canvas.current,
            ctx = element?.getContext('2d');
        if (!element || !ctx) return;
        let width = 1200,
            scale = 1,
            offsetX = 0,
            offsetY = 0,
            dpr = 1;
        const resize = () => {
            const r = element.getBoundingClientRect();
            dpr = Math.min(2, devicePixelRatio || 1);
            width = Math.max(900, (r.width / r.height) * HEIGHT);
            scale = Math.min(r.width / width, r.height / HEIGHT);
            offsetX = (r.width - width * scale) / 2;
            offsetY = (r.height - HEIGHT * scale) / 2;
            element.width = Math.round(r.width * dpr);
            element.height = Math.round(r.height * dpr);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0,
            time = 0,
            previous = 0;
        const draw = (now: number) => {
            if (!document.hidden) {
                if (previous && current.current.phase !== 'paused')
                    time += Math.min(0.05, (now - previous) / 1000);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = '#070e20';
                ctx.fillRect(0, 0, element.width, element.height);
                ctx.setTransform(
                    dpr * scale,
                    0,
                    0,
                    dpr * scale,
                    dpr * offsetX,
                    dpr * offsetY
                );
                paintDash(ctx, current.current, width, time, !motion.matches);
            }
            previous = now;
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);
    return (
        <canvas
            ref={canvas}
            width={1200}
            height={600}
            className="dash-canvas"
            tabIndex={0}
            aria-label="Delfoter Dash surfing course. Press Space, Arrow Up, or tap to jump. Hold to chain jumps. P pauses."
            onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.currentTarget.focus({ preventScroll: true });
                event.currentTarget.setPointerCapture(event.pointerId);
                onJump();
            }}
            onPointerUp={onRelease}
            onPointerCancel={onRelease}
            onLostPointerCapture={onRelease}
        >
            Your browser needs canvas support to play Delfoter Dash.
        </canvas>
    );
}
