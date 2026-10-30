// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { reorderListItem } from '../model/listOrder';
import { required } from '../test/required';
import { useSortableList } from './useSortableList';

it('reorders only on a drop in the same list and clears canceled drag indicators', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    function List() {
        const [items, setItems] = useState(['a', 'b', 'c']);
        const sortable = useSortableList(items.length, (from, to) =>
            setItems((current) => reorderListItem(current, from, to))
        );
        return (
            <section>
                {items.map((item, index) => (
                    <div key={index} {...sortable.itemProps(index)}>
                        {sortable.handle(index, item)}
                        <span>{item}</span>
                    </div>
                ))}
            </section>
        );
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    const data = new Map<string, string>();
    const dataTransfer = {
        types: ['application/x-workflow-list-item'],
        setData: (type: string, value: string) => data.set(type, value),
        getData: (type: string) => data.get(type),
        setDragImage: vi.fn(),
    };
    const drag = (element: Element, type: string) =>
        act(() => {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperty(event, 'dataTransfer', {
                value: dataTransfer,
            });
            element.dispatchEvent(event);
        });
    try {
        act(() =>
            root.render(
                <>
                    <List />
                    <List />
                </>
            )
        );
        const lists = container.querySelectorAll('section');
        const rows = () => lists[0].querySelectorAll('[data-sort-item]');
        const handle = () => required(rows()[0].querySelector('button'));
        const values = (list: Element) =>
            Array.from(list.querySelectorAll('span')).map(
                (item) => item.textContent
            );
        drag(handle(), 'dragstart');
        drag(rows()[2], 'dragover');
        expect(rows()[2].getAttribute('data-sort-target')).toBe('after');
        expect(values(lists[0])).toEqual(['a', 'b', 'c']);
        drag(lists[1].children[1], 'drop');
        expect(values(lists[1])).toEqual(['a', 'b', 'c']);
        drag(handle(), 'dragend');
        expect(container.querySelector('[data-sort-target]')).toBeNull();
        expect(values(lists[0])).toEqual(['a', 'b', 'c']);

        drag(handle(), 'dragstart');
        drag(rows()[2], 'dragover');
        drag(rows()[2], 'drop');
        expect(values(lists[0])).toEqual(['b', 'c', 'a']);
        expect(container.querySelector('[data-sort-target]')).toBeNull();
    } finally {
        act(() => root.unmount());
    }
});
