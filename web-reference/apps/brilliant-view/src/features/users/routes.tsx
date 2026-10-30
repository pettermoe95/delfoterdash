import { Route } from 'react-router-dom';
import { UsersAndGroups } from './pages';

export const USER_ROUTES = {
    users: '/users',
    userGroups: '/users/groups',
    usersNew: '/users/new',
} as const;

export const UserRoutes = (
    <>
        <Route path={USER_ROUTES.users} element={<UsersAndGroups />} />
        <Route
            path={USER_ROUTES.userGroups}
            element={<UsersAndGroups initialTab="groups" />}
        />
    </>
);
