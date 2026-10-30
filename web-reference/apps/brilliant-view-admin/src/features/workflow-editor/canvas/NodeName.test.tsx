// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { required } from '../test/required';
import { NodeName } from './NodeName';

let container: HTMLDivElement;
let root: Root;
const rename = vi.fn((_name: string): string | undefined => undefined);
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    rename.mockReset();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
        root.render(
            <NodeName id="fetch-orders" disabled={false} onRename={rename} />
        );
    });
});
afterEach(() => {
    act(() => {
        root.unmount();
    });
    container.remove();
});
function startEditing() {
    act(() => {
        required(container.querySelector('button')).dispatchEvent(
            new MouseEvent('dblclick', { bubbles: true })
        );
    });
    return required(container.querySelector('input'));
}
function changeName(value: string) {
    act(() => {
        const descriptor = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        );
        if (!descriptor?.set) throw new Error('Missing input value setter.');
        descriptor.set.call(required(container.querySelector('input')), value);
        required(container.querySelector('input')).dispatchEvent(
            new Event('input', { bubbles: true })
        );
    });
}

it('requires a double-click to edit, selects the ID and confirms the entered name', () => {
    expect(container.textContent).toContain('fetch-orders');
    act(() => {
        required(container.querySelector('button')).click();
    });
    expect(container.querySelector('input')).toBeNull();
    const input = startEditing();
    expect(document.activeElement).toBe(input);
    expect(input.selectionEnd).toBe('fetch-orders'.length);
    changeName('fetch-invoices');
    act(() => {
        required(container.querySelector('form')).dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );
    });
    expect(rename).toHaveBeenCalledWith('fetch-invoices');
    expect(container.querySelector('input')).toBeNull();
});

it('keeps an invalid rename editable and clears the error when corrected', () => {
    rename.mockReturnValue('A worker already has this name.');
    startEditing();
    changeName('existing');
    act(() => {
        required(container.querySelector('form')).dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
        'already has this name'
    );
    expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBe(
        'true'
    );
    changeName('available');
    expect(container.querySelector('[role="alert"]')).toBeNull();
});

it('cancels with Escape without changing the workflow', () => {
    const input = startEditing();
    changeName('uncommitted');
    act(() => {
        input.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
    });
    expect(rename).not.toHaveBeenCalled();
    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).toContain('fetch-orders');
});
