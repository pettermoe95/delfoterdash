// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { required } from '../test/required';
import { Field } from './Field';

let container: HTMLDivElement;
let root: Root;
const change = vi.fn();
type FormProps = { schema: z.ZodTypeAny; initial: unknown };
function Form({ schema, initial }: FormProps) {
    const [value, setValue] = useState(initial);
    return (
        <Field
            schema={schema}
            value={value}
            path="maxPages"
            environment={{}}
            onChange={(next) => {
                change(next);
                setValue(next);
            }}
        />
    );
}
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    change.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});
afterEach(() => {
    act(() => {
        root.unmount();
    });
    container.remove();
});
function type(value: string) {
    const input = required(container.querySelector('input'));
    act(() => {
        const descriptor = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        );
        if (!descriptor?.set) throw new Error('Missing input value setter.');
        descriptor.set.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return input;
}

it('keeps a checkbox label associated with its control when rendered as a horizontal field', () => {
    act(() => {
        root.render(
            <Form schema={z.boolean().default(false)} initial={false} />
        );
    });
    const input = required(
        container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    );
    expect(input.closest('.we-field-checkbox')).not.toBeNull();
    act(() => {
        required(container.querySelector('label')).click();
    });
    expect(input.checked).toBe(true);
    expect(change).toHaveBeenLastCalledWith(true);
});

it('keeps a cleared optional number focused until blur, then offers Configure', () => {
    act(() => {
        root.render(<Form schema={z.number().optional()} initial={12} />);
    });
    act(() => {
        required(container.querySelector('input')).focus();
    });
    const input = type('');
    expect(document.activeElement).toBe(input);
    expect(container.querySelector('input')).toBe(input);
    expect(input.value).toBe('');
    act(() => {
        input.blur();
    });
    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).toContain('Configure');
    act(() => {
        required(container.querySelector('button')).click();
    });
    expect(container.querySelector('input')).not.toBeNull();
});

it('allows replacing a defaulted number after erasing it, without losing focus', () => {
    act(() => {
        root.render(<Form schema={z.number().default(10)} initial={10} />);
    });
    act(() => {
        required(container.querySelector('input')).focus();
    });
    type('');
    const input = type('25');
    expect(document.activeElement).toBe(input);
    act(() => {
        input.blur();
    });
    expect(container.querySelector('input')?.value).toBe('25');
    expect(change).toHaveBeenLastCalledWith(25);
});

it('keeps a nullable numeric union editable after clearing and blurring, and switches to explicit null', () => {
    act(() => {
        root.render(
            <Form
                schema={z.union([z.string(), z.number(), z.null()])}
                initial={12}
            />
        );
    });
    act(() => {
        required(container.querySelector('input')).focus();
    });
    const input = type('');
    expect(input.type).toBe('number');
    act(() => input.blur());
    expect(container.querySelector('input')).toBe(input);
    expect(container.textContent).not.toContain('Configure');
    expect(container.querySelector('select')?.value).toBe('1');
    type('25');
    expect(change).toHaveBeenLastCalledWith(25);
    const selector = required(container.querySelector('select'));
    act(() => {
        selector.value = '2';
        selector.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(change).toHaveBeenLastCalledWith(null);
    expect(selector.value).toBe('2');
    expect(container.textContent).toContain('null');
    expect(container.querySelector('input')).toBeNull();
});

it('removes optional empty text on blur while leaving required empty fields editable', () => {
    act(() => {
        root.render(<Form schema={z.string().optional()} initial="abc" />);
    });
    act(() => {
        required(container.querySelector('input')).focus();
    });
    const input = type('');
    expect(container.querySelector('input')).toBe(input);
    act(() => {
        input.blur();
    });
    expect(change).toHaveBeenLastCalledWith(undefined);
    expect(container.querySelector('input')).toBeNull();
    act(() => {
        root.render(<Form key="required" schema={z.number()} initial={10} />);
    });
    act(() => {
        required(container.querySelector('input')).focus();
    });
    const requiredInput = type('');
    act(() => {
        requiredInput.blur();
    });
    expect(container.querySelector('input')).toBe(requiredInput);
});
