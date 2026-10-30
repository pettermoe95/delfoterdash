import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from './accountContext';
import { PERMISSION } from './constants';

type AuthBoundaryBaseProps = PropsWithChildren & {
    redirectTo?: string;
};

type AuthBoundaryProps = AuthBoundaryBaseProps & {
    isAuthorized: boolean | (() => boolean);
};

export function AuthBoundary({
    children,
    isAuthorized,
    redirectTo,
}: AuthBoundaryProps) {
    const shouldRender =
        typeof isAuthorized === 'function' ? isAuthorized() : isAuthorized;

    if (!shouldRender) {
        return redirectTo ? <Navigate to={redirectTo} /> : null;
    }

    return <>{children}</>;
}

export function AdminOnly({ children }: AuthBoundaryBaseProps) {
    const { hasPermission } = useAccount();
    const isAuthorized = hasPermission(PERMISSION.USERS_SET_ROLES);

    return <AuthBoundary isAuthorized={isAuthorized}>{children}</AuthBoundary>;
}
