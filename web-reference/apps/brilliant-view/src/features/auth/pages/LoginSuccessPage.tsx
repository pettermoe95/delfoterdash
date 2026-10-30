import { APP_ROUTES } from '~/routes/routes';
import { Navigate } from 'react-router-dom';

export function LoginSuccessPage() {
    return <Navigate to={APP_ROUTES.dashboardsOverview} />;
}
