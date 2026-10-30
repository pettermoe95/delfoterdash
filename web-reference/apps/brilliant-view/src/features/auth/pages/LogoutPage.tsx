import { apiService } from '~/api/service';
import { queryClient } from '~/config/queryClient';
import { ACCOUNT_QUERY_KEY } from '~/features/auth';
import { clearStoredOwnedByFilter } from '~/site/dashboard/dashboardFilterUtils';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        apiService
            .postData('auth/logout', {})
            .catch((error) => console.error('Could not log out: ', error));
        clearStoredOwnedByFilter();
        queryClient.removeQueries({
            queryKey: ACCOUNT_QUERY_KEY,
            exact: true,
        });
        navigate('/');
    }, [navigate]);

    return null;
}
