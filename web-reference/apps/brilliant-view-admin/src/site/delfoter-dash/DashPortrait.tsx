import { useEffect, useRef } from 'react';
import { drawSurfer } from './surfer';

export function DashPortrait() {
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const ctx = canvas.current?.getContext('2d');
        if (!ctx) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        const draw = (now: number) => {
            const t = motion.matches ? 0 : now / 1000;
            ctx.clearRect(0, 0, 260, 180);
            ctx.save();
            ctx.translate(140, 92);
            ctx.scale(1.7, 1.7);
            drawSurfer(ctx, t);
            ctx.restore();
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, []);
    return (
        <canvas
            ref={canvas}
            width={260}
            height={180}
            className="dash-portrait"
            aria-hidden="true"
        />
    );
}
