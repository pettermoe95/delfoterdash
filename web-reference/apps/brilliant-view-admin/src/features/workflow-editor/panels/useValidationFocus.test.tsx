// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { required } from '../test/required';
import { useValidationFocus } from './useValidationFocus';
import type { ValidationTarget } from './ValidationIssues';

type ProbeProps = { target?: ValidationTarget };
it('consumes focus requests without losing the highlight or replaying focus on remount', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(0), 0)
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) =>
        window.clearTimeout(id)
    );
    const focused = vi.fn();
    const scroll = vi.fn();
    function Probe({ target }: ProbeProps) {
        const panel = useRef<HTMLDivElement>(null);
        useValidationFocus(panel, target, focused);
        return (
            <div ref={panel}>
                <div
                    data-field-path="example"
                    ref={(field) => {
                        if (field) field.scrollIntoView = scroll;
                    }}
                >
                    <input aria-label="Example" />
                </div>
            </div>
        );
    }
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const render = (target?: ValidationTarget) => {
        act(() => {
            root.render(<Probe target={target} />);
            vi.advanceTimersByTime(0);
        });
    };
    try {
        const request = { path: 'example' };
        render(request);
        act(() => {
            vi.advanceTimersByTime(0);
        });
        expect(focused).toHaveBeenCalledWith(request);
        expect(scroll).toHaveBeenCalledTimes(1);
        const field = required(container.querySelector('[data-field-path]'));
        expect(field.hasAttribute('data-validation-focus')).toBe(true);
        render();
        expect(field.hasAttribute('data-validation-focus')).toBe(true);
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(field.hasAttribute('data-validation-focus')).toBe(false);
        act(() => {
            root.render(null);
        });
        render();
        expect(document.activeElement).not.toBe(
            container.querySelector('input')
        );
        expect(scroll).toHaveBeenCalledTimes(1);
        render({ path: 'example' });
        act(() => {
            vi.advanceTimersByTime(0);
        });
        expect(scroll).toHaveBeenCalledTimes(2);
    } finally {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    }
});
