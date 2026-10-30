// @vitest-environment jsdom
import type * as BdsCore from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { RelationshipConditionRow } from './RelationshipConditionRow';
import type { Predicate } from './semanticModel';
import { useRelationshipPredicate } from './useRelationshipPredicate';

// Native selects let these tests exercise form transitions independently of Radix's select gestures.
// The help popover uses the real shared component.
vi.mock('@brilliant/bds-core', async (original) => ({
    ...(await original<typeof BdsCore>()),
    SingleSelect: ({
        options,
        value,
        onChange,
        placeholder,
        error,
        id,
    }: ComponentProps<typeof BdsCore.SingleSelect>) => (
        <select
            id={id}
            value={value ?? ''}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange?.(event.target.value)}
        >
            <option value="">{placeholder}</option>
            {options.map((option) =>
                typeof option === 'string' ? (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ) : (
                    <option key={option.value} value={option.value}>
                        {option.value}
                    </option>
                )
            )}
        </select>
    ),
}));

let container: HTMLDivElement;
let root: Root;
let form: ReturnType<typeof useRelationshipPredicate>;
const targetColumns = [
    'id',
    '__bv__valid_from',
    '__bv__valid_to',
    'start_date',
    'end_date',
];
const saved: Predicate = {
    type: 'between',
    operand: { relation: 'events', column: 'event_date' },
    lower: { relation: 'customers', column: 'start_date' },
    upper: { relation: 'customers', column: 'end_date' },
};
function Harness({
    columns = targetColumns,
    existingPredicate,
}: {
    columns?: string[];
    existingPredicate?: Predicate;
}) {
    form = useRelationshipPredicate({
        source: 'events',
        target: 'customers',
        sourceColumns: ['event_date'],
        targetColumns: columns,
        existingPredicate,
    });
    return (
        <>
            <RelationshipConditionRow
                source="events"
                target="customers"
                sourceColumns={['event_date']}
                targetColumns={columns}
                condition={form.conditions[0]}
                errors={form.conditionErrors[0]}
                index={0}
                onChange={(value) => form.updateCondition(0, value)}
            />
            {form.validationError && <p role="alert">{form.validationError}</p>}
        </>
    );
}
function select(index: number, value: string) {
    const element = container.querySelectorAll('select')[index];
    act(() => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
    });
}
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});
afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

test('new BETWEEN defaults bounds and preserves custom selections across operator changes', () => {
    act(() => root.render(<Harness />));
    select(1, 'between');
    expect(form.getPredicate()).toEqual({
        ...saved,
        lower: { relation: 'customers', column: '__bv__valid_from' },
        upper: { relation: 'customers', column: '__bv__valid_to' },
    });
    select(2, 'start_date');
    select(3, 'end_date');
    select(1, 'eq');
    select(1, 'between');
    expect(form.getPredicate()).toEqual(saved);
    expect(form.invalid).toBe(false);
});

test('saved custom bounds survive operator switching and saving', () => {
    act(() => root.render(<Harness existingPredicate={saved} />));
    select(1, 'eq');
    select(1, 'between');
    expect(form.getPredicate()).toEqual(saved);
});

test('missing upper bound is highlighted with an actionable error and clears after selection', () => {
    act(() =>
        root.render(
            <Harness columns={['id', '__bv__valid_from', 'end_date']} />
        )
    );
    select(1, 'between');
    expect(form.invalid).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
        'Condition 1: Select an upper-bound column.'
    );
    expect(
        container.querySelectorAll('select')[3].getAttribute('aria-invalid')
    ).toBe('true');
    select(3, 'end_date');
    expect(form.invalid).toBe(false);
    expect(container.querySelector('[role="alert"]')).toBeNull();
});

test('BETWEEN help opens by keyboard and closes with Escape', async () => {
    act(() => root.render(<Harness existingPredicate={saved} />));
    const help = container.querySelector<HTMLButtonElement>(
        'button[aria-label="About BETWEEN bounds"]'
    );
    if (!help) throw new Error('BETWEEN help button was not rendered');
    help.focus();
    expect(document.activeElement).toBe(help);
    // Browsers translate Enter/Space activation on a native button to click.
    await act(async () => {
        help.click();
        await Promise.resolve();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
        'Both bounds are inclusive. A NULL upper bound means the range has no end.'
    );
    await act(async () => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        await Promise.resolve();
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
});
