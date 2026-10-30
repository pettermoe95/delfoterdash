// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { required } from '../test/required';
import { MoreMenu } from './MoreMenu';

let container: HTMLDivElement;
let root: Root;
const action = vi.fn();
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    action.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
        root.render(
            <>
                <MoreMenu>
                    <button type="button" onClick={action}>
                        Action
                    </button>
                </MoreMenu>
                <button type="button" id="outside">
                    Outside
                </button>
            </>
        );
    });
});
afterEach(() => {
    act(() => {
        root.unmount();
    });
    container.remove();
});
it('closes after invoking an action, outside pointer events, and outside keyboard focus', () => {
    const menu = required(container.querySelector('details'));
    menu.open = true;
    act(() => {
        required(menu.querySelector('button')).click();
    });
    expect(action).toHaveBeenCalledOnce();
    expect(menu.open).toBe(false);
    menu.open = true;
    act(() => {
        document.body.dispatchEvent(
            new Event('pointerdown', { bubbles: true })
        );
    });
    expect(menu.open).toBe(false);
    menu.open = true;
    act(() => {
        required(
            container.querySelector<HTMLButtonElement>('#outside')
        ).focus();
    });
    expect(menu.open).toBe(false);
});
it('keeps inside interactions open and restores summary focus on Escape', () => {
    const menu = required(container.querySelector('details'));
    menu.open = true;
    act(() => {
        required(menu.querySelector('button')).dispatchEvent(
            new Event('pointerdown', { bubbles: true })
        );
    });
    expect(menu.open).toBe(true);
    act(() => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Escape',
                bubbles: true,
                cancelable: true,
            })
        );
    });
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(menu.querySelector('summary'));
});
