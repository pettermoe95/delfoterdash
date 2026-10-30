import type { AboutMeResponse } from '@bv/api';
import { useEffect, useState } from 'react';
import { apiService } from '../api/service';
import { env, isDev } from '../config/env';
import { localAuth } from '../config/localAuth';

/// Redirects to login if not authenticated
export const useAuthentication = () => {
    const [auth, setAuth] = useState<AboutMeResponse | undefined>(localAuth);

    async function logOut() {
        if (localAuth) {
            window.location.assign('/');
            return;
        }
        await apiService.getData('auth/logout');
        setAuth(undefined);
    }
    useEffect(() => {
        if (auth !== undefined) {
            return;
        }
        apiService
            .getData<AboutMeResponse>('v1/admin/me')
            .then((me) => {
                setAuth(me);
            })
            .catch(() => {
                window.location.replace(getLoginURL());
            });
    }, [auth]);

    return { auth, logOut };
};

function getLoginURL() {
    const urlPrefix = env.apiBaseUrl;
    const redirectUriPrefix = isDev
        ? 'http://localhost:7576/'
        : window.location.href;
    return `${urlPrefix}/auth/login?redirect=${redirectUriPrefix}&error_redirect=${redirectUriPrefix}`;
}
