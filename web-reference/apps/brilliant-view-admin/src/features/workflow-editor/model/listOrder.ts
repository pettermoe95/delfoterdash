/** Move one position without mutating the source; boundary moves are no-ops. */
export function moveListItem<T>(
    items: T[],
    index: number,
    direction: -1 | 1
): T[] {
    return reorderListItem(items, index, index + direction);
}

/** Move to any position without mutating the source or changing other items' order. */
export function reorderListItem<T>(
    items: T[],
    index: number,
    target: number
): T[] {
    if (
        index === target ||
        index < 0 ||
        index >= items.length ||
        target < 0 ||
        target >= items.length
    )
        return items;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    return next;
}
