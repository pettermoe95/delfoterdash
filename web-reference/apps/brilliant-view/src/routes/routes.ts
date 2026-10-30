import { CONCEPTS_ROUTES } from '~/features/concepts/routes';
import { INTROSPECTION_ROUTES } from '~/features/introspection';
import { USER_ROUTES } from '~/features/users';

export const APP_ROUTES = {
    home: '/',
    deletedUser: '/deleted-user',
    dashboards: '/dashboards',
    dashboardsOverview: '/dashboards/overview',
    dashboard: '/dashboards/:id?',
    dashboard_fullscreen: '/dashboards/:id/fullscreen',
    settings: '/settings',
    support: '/support',
    teams: '/teams',
    workflows: '/workflows',
    ...CONCEPTS_ROUTES,
    ...USER_ROUTES,
    ...INTROSPECTION_ROUTES,
} as const;

export type AppRouteName = keyof typeof APP_ROUTES;
