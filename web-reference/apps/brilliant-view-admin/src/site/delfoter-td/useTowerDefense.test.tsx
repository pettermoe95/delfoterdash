// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { startWave } from './engine';
import { useTowerDefense } from './useTowerDefense';

it('advances at each speed, renders wave completion immediately, respects pause, and cancels animation on unmount', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    let frame: FrameRequestCallback = () => {};
    const cancel = vi.fn();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frame = callback;
        return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', cancel);
    let controller!: ReturnType<typeof useTowerDefense>;
    function Probe() {
        controller = useTowerDefense();
        return <span>{controller.game.phase}</span>;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        act(() => root.render(<Probe />));
        act(() => {
            startWave(controller.game);
            controller.refresh();
        });
        act(() => frame(100));
        for (const speed of [1, 2, 4, 8]) {
            act(() => controller.setSpeed(speed));
            act(() => frame(200));
            const before = controller.game.time;
            act(() => frame(216));
            expect(controller.game.time - before).toBeCloseTo(0.016 * speed);
        }
        act(() => controller.setSpeed(1));
        act(() => controller.setPaused(true));
        const time = controller.game.time;
        act(() => frame(1000));
        expect(controller.game.time).toBe(time);
        expect(container.textContent).toBe('wave');
        act(() => controller.setPaused(false));
        controller.game.pending = [];
        controller.game.enemies = [];
        act(() => frame(1010));
        // Finishes inside the 30fps rendering interval: must still repaint the controls.
        act(() => frame(1026));
        expect(container.textContent).toBe('build');
    } finally {
        act(() => root.unmount());
        expect(cancel).toHaveBeenCalled();
        vi.unstubAllGlobals();
    }
});
