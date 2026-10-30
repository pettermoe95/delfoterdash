import { CustomerDetailsPage } from '~/site/customers/CustomerDetailsPage';
import { DelfoterDashPage } from '~/site/delfoter-dash/DelfoterDashPage';
import { DelfoterTDPage } from '~/site/delfoter-td/DelfoterTDPage';
import { DelfoterAdventurePage } from '~/site/DelfoterAdventurePage';
import { DelfoterArcadePage } from '~/site/DelfoterArcadePage';
import { LibraryEditPage } from '~/site/library/LibraryEditPage';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Navigate,
    Route,
} from 'react-router-dom';
import { isLocalAuthBypass } from '../config/env';
import { redirectWorkflowEditor } from '../features/workflow-editor/api/route';
import WorkflowEditorV2 from '../features/workflow-editor/WorkflowEditorV2';
import { AdminLayout } from '../layout/AdminLayout';
import { AssistantPage } from '../site/assistant/AssistantPage';
import { CustomersPage } from '../site/customers/CustomersPage';
import { LibraryPage } from '../site/library/LibraryPage';
import { APP_ROUTES } from './routes';

export const router: ReturnType<typeof createBrowserRouter> =
    createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route element={<AdminLayout />}>
                    <Route
                        index
                        element={
                            <Navigate
                                to={
                                    isLocalAuthBypass
                                        ? APP_ROUTES.delfoter_arcade
                                        : APP_ROUTES.customers
                                }
                                replace
                            />
                        }
                    />
                    <Route
                        path={APP_ROUTES.customers}
                        element={<CustomersPage />}
                    />
                    <Route
                        path={APP_ROUTES.delfoter_adventure}
                        element={<DelfoterAdventurePage />}
                    />
                    <Route
                        path={APP_ROUTES.delfoter_arcade}
                        element={<DelfoterArcadePage />}
                    />
                    <Route
                        path={APP_ROUTES.delfoter_dash}
                        element={<DelfoterDashPage />}
                    />
                    <Route
                        path={APP_ROUTES.delfoter_td}
                        element={<DelfoterTDPage />}
                    />
                    <Route
                        path={APP_ROUTES.customer_details}
                        element={<CustomerDetailsPage />}
                    />
                    <Route
                        path={APP_ROUTES.library}
                        element={<LibraryPage />}
                    />
                    <Route
                        path={APP_ROUTES.assistant}
                        element={<AssistantPage />}
                    />
                    <Route
                        path={APP_ROUTES.library_edit_template}
                        element={<LibraryEditPage />}
                    />
                </Route>
                <Route
                    path={APP_ROUTES.workflow_editor}
                    element={<WorkflowEditorV2 />}
                />
                <Route
                    path={APP_ROUTES.workflow_editor_v2}
                    loader={redirectWorkflowEditor}
                />
            </>
        )
    );
