import { Route } from 'react-router-dom';
import { DatabaseIntrospectionPage } from './pages';

export const INTROSPECTION_ROUTES = {
    introspection: '/introspection',
} as const;

export const IntrospectionRoutes = (
    <>
        <Route
            path={INTROSPECTION_ROUTES.introspection}
            element={<DatabaseIntrospectionPage />}
        />
    </>
);
