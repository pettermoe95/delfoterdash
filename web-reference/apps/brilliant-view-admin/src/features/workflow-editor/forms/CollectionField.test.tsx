// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { z } from 'zod';
import { required } from '../test/required';
import { SchemaForm } from './SchemaForm';

it('shows ordering only when declared and supports reordering and removing compact list rows', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const schema = z.object({
        relations: z.array(
            z.object({
                toEntity: z.string(),
                fromColumn: z.string(),
                toColumn: z.string(),
            })
        ),
        ordered: z.array(z.string()),
        variables: z.record(z.union([z.string(), z.number(), z.null()])),
    });
    function Form() {
        const [value, setValue] = useState<unknown>({
            relations: [
                {
                    toEntity: 'company',
                    fromColumn: 'company_id',
                    toColumn: 'id',
                },
            ],
            ordered: ['first', 'second'],
            variables: { year: 2026, empty: null },
        });
        return (
            <SchemaForm
                schema={schema}
                value={value}
                onChange={setValue}
                environment={{ hints: { ordered: { ordered: true } } }}
            />
        );
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    const field = (path: string) =>
        required(
            Array.from(
                container.querySelectorAll<HTMLElement>('[data-field-path]')
            ).find((item) => item.dataset.fieldPath === path)
        );
    const button = (parent: HTMLElement, label: string) =>
        required(
            parent.querySelector<HTMLButtonElement>(
                `button[aria-label="${label}"]`
            )
        );
    try {
        act(() => {
            root.render(<Form />);
        });
        expect(field('relations').querySelector('.we-drag-handle')).toBeNull();
        expect(
            field('variables').querySelectorAll('.we-list-item-compact')
        ).toHaveLength(2);
        expect(field('variables.year').querySelector('.we-subtle')).toBeNull();
        expect(field('variables.empty').querySelector('select')?.value).toBe(
            '2'
        );
        const ordered = field('ordered');
        act(() => {
            button(ordered, 'Reorder item 2').dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
            );
        });
        expect(
            Array.from(ordered.querySelectorAll('input')).map(
                (input) => input.value
            )
        ).toEqual(['second', 'first']);
        act(() => {
            button(field('relations'), 'Remove item 1').click();
        });
        expect(field('relations').querySelector('.we-list-item')).toBeNull();
    } finally {
        act(() => {
            root.unmount();
        });
    }
});
