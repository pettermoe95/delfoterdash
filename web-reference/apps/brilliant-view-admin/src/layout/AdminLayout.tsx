import { Link, matchPath, Outlet, useLocation } from 'react-router-dom';
import { useAuthentication } from '../hooks/useAuthentication';
import { APP_ROUTES } from '../routes/routes';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
    const { auth } = useAuthentication();
    const { pathname } = useLocation();
    const isArcade =
        matchPath(
            { path: APP_ROUTES.delfoter_arcade, end: false },
            pathname
        ) !== null ||
        matchPath(APP_ROUTES.delfoter_adventure, pathname) !== null;

    const hasArcadeHeader =
        matchPath(APP_ROUTES.delfoter_td, pathname) !== null ||
        matchPath(APP_ROUTES.delfoter_dash, pathname) !== null ||
        matchPath(APP_ROUTES.delfoter_arcade, pathname) !== null;

    if (auth == undefined) {
        return <div>Loading...</div>;
    }
    const permissions = auth.permissions ?? [];

    const isAdmin = permissions.some(
        (permission) => permission.name == 'system_admin.admin_panel.access'
    );

    if (!isAdmin) {
        return <div>Forbidden</div>;
    }

    return (
        <div className="flex h-screen max-h-screen">
            {isArcade ? (
                !hasArcadeHeader && (
                    <Link
                        to={APP_ROUTES.customers}
                        className="fixed bottom-4 left-3 z-50 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-600"
                    >
                        <span aria-hidden="true">←</span>
                        Back to admin panel
                    </Link>
                )
            ) : (
                <div className="h-full shrink-0">
                    <AdminSidebar />
                </div>
            )}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col gap-4xl bg-secondary">
                <div className="flex h-full w-full flex-1 flex-col overflow-y-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
