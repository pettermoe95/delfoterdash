import { APP_ROUTES } from '~/routes/routes';
import { generatePath, useNavigate } from 'react-router-dom';

export function useNavigateToAppRoute(routeKey: keyof typeof APP_ROUTES) {
    const navigate = useNavigate();

    return (id: string | number) =>
        navigate(generateAppRoutePath(routeKey, id));
}

export function generateAppRoutePath(
    routeKey: keyof typeof APP_ROUTES,
    id: string | number
) {
    const path = APP_ROUTES[routeKey];
    return generatePathWithId(path, id);
}

export function generatePathWithId(path: string, id: string | number) {
    return generatePath(path, { id: id.toString() });
}
