import { DeletedUserPage, LoginSuccessPage, LogoutPage } from '~/features/auth';
import { ConceptsRoutes } from '~/features/concepts/routes';
import { IntrospectionRoutes } from '~/features/introspection';
import { UserRoutes } from '~/features/users';
import { WorkflowsAndCredentialsPage } from '~/features/workflows/pages';
import { AuthenticatedLayout } from '~/layout/AuthenticatedLayout';
import { UnauthenticatedLayout } from '~/layout/UnauthenticatedLayout';
import { APP_ROUTES } from '~/routes/routes';
import { DashboardOverview } from '~/site/dashboard/dashboard_list/DashboardOverview';
import {
    DashboardFullscreenPage,
    DashboardPage,
} from '~/site/dashboard/DashboardPage';
import { DebugPage } from '~/site/DebugPage';
import { SettingsPage } from '~/site/SettingsPage';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
} from 'react-router-dom';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/logout" element={<LogoutPage />} />
            <Route element={<UnauthenticatedLayout />}>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/login_success" element={<LoginSuccessPage />} />
                <Route path="/login_failed" element={<div>Login failed</div>} />
            </Route>
            <Route
                path={APP_ROUTES.deletedUser}
                element={<DeletedUserPage />}
            />
            <Route element={<AuthenticatedLayout />}>
                {/* Redirect default route to dashboards/overview */}
                <Route
                    path={APP_ROUTES.home}
                    element={<Navigate to={APP_ROUTES.dashboardsOverview} />}
                />
                {/* Redirect /dashboards to /dashboards/overview */}
                <Route
                    path={APP_ROUTES.dashboards}
                    element={<Navigate to={APP_ROUTES.dashboardsOverview} />}
                />
                {/* DASHBOARD PAGES */}
                <Route path={APP_ROUTES.dashboards}>
                    <Route
                        path={APP_ROUTES.dashboardsOverview}
                        element={<DashboardOverview />}
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate to={APP_ROUTES.dashboardsOverview} />
                        }
                    />
                </Route>

                <Route
                    path={APP_ROUTES.dashboard}
                    element={<DashboardPage />}
                />
                <Route
                    path={APP_ROUTES.dashboard_fullscreen}
                    element={<DashboardFullscreenPage />}
                />
                <Route path={APP_ROUTES.settings} element={<SettingsPage />} />

                {/* WORKFLOWS PAGES */}
                <Route
                    path={APP_ROUTES.workflows}
                    element={<WorkflowsAndCredentialsPage />}
                />

                {/* CONCEPTS PAGES */}
                {ConceptsRoutes}

                {/* INTROSPECTION PAGES */}
                {IntrospectionRoutes}

                {/* USER PAGES */}
                {UserRoutes}

                <Route path="debug-info" element={<DebugPage />} />
            </Route>
        </>
    )
);
