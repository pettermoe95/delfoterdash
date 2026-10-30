import { dashboardEndpoints } from './dashboards';
import { graphEndpoints } from './graphs';

export * from './schema';

export const dashboardApi = {
    ...graphEndpoints,
    ...dashboardEndpoints,
};
