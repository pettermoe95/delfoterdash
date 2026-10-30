import type { AddDashboardLayout, DashboardLayoutItem } from '@bv/api';

export function createPlaceholderLayout(
    layout: AddDashboardLayout,
    id?: number
): DashboardLayoutItem {
    return {
        id: id ?? -1,
        graph: {
            id: -1,
            template_id: -1,
            name: 'Loading...',
            type: {
                id: 1,
                name: 'axis',
            },
        },
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
    };
}
