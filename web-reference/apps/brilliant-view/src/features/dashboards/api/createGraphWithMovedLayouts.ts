import type { DashboardLayoutItem } from '@bv/api';
import { isAxiosError } from 'axios';
import {
    getMovedLayoutsForNewGraph,
    overlapsExistingLayouts,
    toLayoutPositionMap,
} from '../../utility/functions/dashboardLayoutUtils';
import { dashboardEndpoints } from './dashboards';
import type { CreateGraphPayload, GraphPositionPayload } from './schema';
import { createDashboardGraphPayloadSchema } from './schema';

type CreateGraphWithMovedLayoutsParams = {
    dashboardId: number;
    layouts: DashboardLayoutItem[];
    graph: CreateGraphPayload;
    position: GraphPositionPayload;
};

async function moveLayoutsForNewGraph(
    dashboardId: number,
    layouts: DashboardLayoutItem[],
    position: GraphPositionPayload
) {
    const repositionedLayouts = getMovedLayoutsForNewGraph(layouts, position);

    await dashboardEndpoints.updateDashboardGraphPositions(
        dashboardId,
        toLayoutPositionMap(repositionedLayouts)
    );
}

async function refetchAndMoveLayoutsForNewGraph(
    dashboardId: number,
    position: GraphPositionPayload
) {
    const latestDashboard = await dashboardEndpoints.getDashboard(dashboardId);

    await moveLayoutsForNewGraph(
        dashboardId,
        latestDashboard.layouts,
        position
    );
}

export async function createGraphWithMovedLayouts({
    dashboardId,
    layouts,
    graph,
    position,
}: CreateGraphWithMovedLayoutsParams) {
    const payload = createDashboardGraphPayloadSchema.parse({
        graph,
        position,
    });
    const normalizedPosition = payload.position;

    if (overlapsExistingLayouts(layouts, normalizedPosition)) {
        await moveLayoutsForNewGraph(dashboardId, layouts, normalizedPosition);
    }

    try {
        return await dashboardEndpoints.createDashboardGraph(
            dashboardId,
            payload
        );
    } catch (error) {
        const data: unknown = isAxiosError(error)
            ? error.response?.data
            : undefined;
        const isDashboardOverlapError =
            typeof data === 'string'
                ? data === 'Dashboard graphs are overlapping'
                : typeof data === 'object' &&
                  data !== null &&
                  'message' in data &&
                  data.message === 'Dashboard graphs are overlapping';

        if (!isDashboardOverlapError) {
            throw error;
        }

        await refetchAndMoveLayoutsForNewGraph(dashboardId, normalizedPosition);

        return dashboardEndpoints.createDashboardGraph(dashboardId, payload);
    }
}
