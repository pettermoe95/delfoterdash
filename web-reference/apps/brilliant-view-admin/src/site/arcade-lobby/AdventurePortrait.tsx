import { useEffect, useRef } from 'react';
import { drawDelfoter } from '../delfoter/drawDelfoter';

export function AdventurePortrait() {
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const element = canvas.current;
        const context = element?.getContext('2d');
        if (!element || !context) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let elapsed = 0;
        let previous = 0;
        const draw = (now: number) => {
            if (!document.hidden) {
                if (previous && !motion.matches)
                    elapsed += Math.min((now - previous) / 1000, 0.05);
                context.clearRect(0, 0, element.width, element.height);
                drawDelfoter(context, 9, 12, motion.matches ? 0 : elapsed);
            }
            previous = now;
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, []);
    return (
        <canvas
            ref={canvas}
            width={132}
            height={66}
            className="arcade-adventure-portrait"
            aria-hidden="true"
        />
    );
}
