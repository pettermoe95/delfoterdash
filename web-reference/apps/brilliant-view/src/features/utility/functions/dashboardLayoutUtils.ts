import type { DashboardLayoutItem } from '@bv/api';
import { DASHBOARD_WIDTH } from '@bv/api';

export type DashboardGridItem = Pick<
    DashboardLayoutItem,
    'x' | 'y' | 'width' | 'height'
>;

export const DEFAULT_NEW_GRAPH_WIDTH = 6;
export const DEFAULT_NEW_GRAPH_HEIGHT = 4;

export function layoutsOverlap(
    first: DashboardGridItem,
    second: DashboardGridItem
) {
    return (
        first.x < second.x + second.width &&
        first.x + first.width > second.x &&
        first.y < second.y + second.height &&
        first.y + first.height > second.y
    );
}

export function overlapsExistingLayouts(
    layouts: readonly DashboardGridItem[],
    itemToPlace: DashboardGridItem
) {
    return layouts.some((layout) => layoutsOverlap(itemToPlace, layout));
}

export function getLowestOccupiedRow(layouts: readonly DashboardGridItem[]) {
    return layouts.reduce(
        (maxRow, layout) => Math.max(maxRow, layout.y + layout.height),
        0
    );
}

export function toLayoutPositionMap(layouts: DashboardLayoutItem[]) {
    return Object.fromEntries(
        layouts.map(({ graph, x, y, width, height }) => [
            graph.id,
            { x, y, width, height },
        ])
    );
}

export function getFirstAvailableGridPosition(
    layouts: DashboardLayoutItem[],
    width = DEFAULT_NEW_GRAPH_WIDTH,
    height = DEFAULT_NEW_GRAPH_HEIGHT,
    gridWidth = DASHBOARD_WIDTH
) {
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= gridWidth - width; x++) {
            const proposedPosition = { x, y, width, height };
            if (!overlapsExistingLayouts(layouts, proposedPosition)) {
                return proposedPosition;
            }
        }
    }

    return { x: 0, y: getLowestOccupiedRow(layouts), width, height };
}

function getNextOpenRow(overlappingItems: DashboardGridItem[]) {
    return Math.max(...overlappingItems.map((item) => item.y + item.height));
}

export function getMovedLayoutsForNewGraph(
    layouts: DashboardLayoutItem[],
    insertedItem: DashboardGridItem
) {
    const placedItems: DashboardGridItem[] = [insertedItem];

    return [...layouts]
        .sort((left, right) => left.y - right.y || left.x - right.x)
        .map((layout) => {
            const movedLayout = { ...layout };

            let overlappingItems = placedItems.filter((item) =>
                layoutsOverlap(movedLayout, item)
            );

            while (overlappingItems.length > 0) {
                movedLayout.y = getNextOpenRow(overlappingItems);
                overlappingItems = placedItems.filter((item) =>
                    layoutsOverlap(movedLayout, item)
                );
            }

            placedItems.push(movedLayout);
            return movedLayout;
        });
}
