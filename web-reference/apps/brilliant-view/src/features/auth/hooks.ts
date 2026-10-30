import type { AboutMeResponse } from '@bv/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '~/api';
import { apiService } from '~/api/service';
import { isDev } from '~/config/env';
import { clearStoredOwnedByFilter } from '~/site/dashboard/dashboardFilterUtils';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export const ACCOUNT_QUERY_KEY = ['account'] as const;

export function getAccountQueryOptions() {
    return {
        queryKey: ACCOUNT_QUERY_KEY,
        queryFn: () => API.aboutMe(),
        meta: {
            skipUnauthorizedRedirect: true,
        },
        retry: false,
        refetchOnMount: 'always' as const,
    };
}

export function isUnauthorizedAccountError(error: unknown) {
    return isAxiosError(error) && error.response?.status === 401;
}

export const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, error, isFetchedAfterMount } = useQuery<AboutMeResponse>(
        getAccountQueryOptions()
    );

    return {
        isAuthenticated: !isUnauthorizedAccountError(error) && !!data?.user,
        isCheckingAuthentication: !isFetchedAfterMount,
        logIn: () => {
            const loginURL = getLoginURL();
            window.location.replace(loginURL);
        },
        logOut: () => {
            apiService
                .postData('auth/logout', {})
                .catch((error) => console.error('Could not log out: ', error));
            clearStoredOwnedByFilter();
            queryClient.removeQueries({
                queryKey: ACCOUNT_QUERY_KEY,
                exact: true,
            });
            navigate('/');
        },
    };
};

function getLoginURL() {
    const redirectUriPrefix = isDev ? 'http://localhost:7575' : '';
    return `/api/auth/login?redirect=${redirectUriPrefix}/login_success&error_redirect=${redirectUriPrefix}/login_failed`;
}
