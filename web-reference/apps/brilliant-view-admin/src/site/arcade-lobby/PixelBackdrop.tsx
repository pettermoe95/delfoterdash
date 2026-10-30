import { useEffect, useRef } from 'react';

// Original low-resolution scenery. Integer rectangles stay crisp at any screen size.
export function PixelBackdrop() {
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const element = canvas.current;
        const ctx = element?.getContext('2d');
        if (!element || !ctx) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const resize = () => {
            const rect = element.getBoundingClientRect();
            element.width = Math.max(
                320,
                Math.min(640, Math.round(rect.width / 3))
            );
            element.height = Math.max(
                180,
                Math.round((element.width * rect.height) / rect.width)
            );
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        let frame = 0;
        let elapsed = 0;
        let previous = 0;
        const draw = (now: number) => {
            if (!document.hidden) {
                if (!motion.matches && previous)
                    elapsed += Math.min((now - previous) / 1000, 0.05);
                const w = element.width,
                    h = element.height,
                    t = elapsed;
                const rect = (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    color: string
                ) => {
                    ctx.fillStyle = color;
                    ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
                };
                rect(0, 0, w, h, '#080d24');
                for (let i = 0; i < 70; i++) {
                    const x = (i * 137 + 17) % w;
                    const y = (i * 53 + 11) % Math.max(1, h * 0.48);
                    rect(
                        x,
                        y,
                        i % 9 === 0 ? 2 : 1,
                        1,
                        Math.sin(t * 1.2 + i) > 0.2 ? '#5d86ad' : '#273c68'
                    );
                }
                const mx = w * 0.79,
                    my = h * 0.17;
                rect(mx + 5, my, 18, 4, '#a9d6e5');
                rect(mx, my + 4, 28, 17, '#a9d6e5');
                rect(mx + 5, my + 21, 18, 4, '#a9d6e5');
                rect(mx + 17, my, 11, 14, '#080d24');
                // Distant pixel islands and their neon beacons.
                for (let i = 0; i < 12; i++) {
                    const x = (i * w) / 11 - 10,
                        height = 8 + ((i * 19) % 31);
                    rect(x, h * 0.43 - height, 25, height, '#142544');
                    rect(x + 5, h * 0.43 - height - 4, 13, 4, '#142544');
                    if (i % 3 === 0)
                        rect(x + 10, h * 0.43 - height - 7, 2, 2, '#e6a777');
                }
                rect(0, h * 0.43, w, h, '#0c2039');
                for (let i = 0; i < 32; i++) {
                    const x =
                        ((((i * 89 + t * (i % 2 ? 2 : -2)) % (w + 30)) +
                            w +
                            30) %
                            (w + 30)) -
                        15;
                    rect(
                        x,
                        h * 0.45 + ((i * 17) % (h * 0.5)),
                        7 + (i % 13),
                        1,
                        i % 3 ? '#163951' : '#24617a'
                    );
                }
                // Tiny swimming Delfoters, built from pixel blocks.
                for (let i = 0; i < 5; i++) {
                    const x = ((t * (5 + i) + i * 113) % (w + 48)) - 24;
                    const y = h * (0.55 + i * 0.075) + Math.sin(t * 2 + i) * 3;
                    rect(x, y + 3, 17, 7, '#548fa2');
                    rect(x + 12, y, 10, 10, '#81bbcc');
                    rect(x + 13, y - 2, 3, 3, '#548fa2');
                    rect(x + 17, y + 3, 2, 2, '#07182c');
                    rect(x + 17, y + 7, 7, 3, '#c3e4e7');
                    rect(x - 5, y, 5, 4, '#548fa2');
                    rect(x - 3, y + 4, 5, 3, '#548fa2');
                    rect(
                        x + 6 + Math.round(Math.sin(t * 4)) * 2,
                        y + 9,
                        6,
                        3,
                        '#315a7a'
                    );
                    rect(x + 25, y - 4, 2, 2, '#4b91af');
                }
                for (let i = 0; i < 24; i++) {
                    const x = (i * 47) % w;
                    const base = h - ((i * 7) % 15);
                    const sway = Math.round(Math.sin(t + i) * 2);
                    rect(x, base - 14, 3, 28, '#215168');
                    rect(x + sway, base - 21, 3, 9, '#327487');
                    rect(x - 5, base - 10, 5, 3, '#327487');
                }
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
            className="arcade-pixel-backdrop"
            aria-hidden="true"
        />
    );
}
