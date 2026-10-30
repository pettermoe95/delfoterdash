import { useAuth } from '~/features/auth';
import { Navigate, Outlet } from 'react-router-dom';

export function UnauthenticatedLayout() {
    const { isAuthenticated, isCheckingAuthentication } = useAuth();

    if (isCheckingAuthentication) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboards" />;
    }

    return <Outlet />;
}
