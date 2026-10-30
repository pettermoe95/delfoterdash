import { QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const HTTP_STATUS_TO_NOT_RETRY = [400, 403, 404, 422];
const MAX_RETRIES = 6;
const MAX_RETRIES_401 = 4;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (
                    isAxiosError(error) &&
                    HTTP_STATUS_TO_NOT_RETRY.includes(
                        error.response?.status ?? 0
                    )
                ) {
                    return false;
                }
                if (isAxiosError(error) && error.response?.status === 401) {
                    return failureCount <= MAX_RETRIES_401;
                }
                if (failureCount > MAX_RETRIES) {
                    return false;
                }
                if (
                    error instanceof Error &&
                    error.message === 'Unprocessable Entity'
                ) {
                    return false;
                }
                return true;
            },
            retryDelay: (attemptIndex) =>
                Math.min(500 * 2 ** attemptIndex, 10000), // mainly for 401
        },
    },
    queryCache: new QueryCache({
        onError: (error, query) => {
            if (!isAxiosError(error)) {
                return;
            }
            if (error.response?.status === 401) {
                if (query.meta?.skipUnauthorizedRedirect) {
                    return;
                }
                window.location.replace('/logout');
            }
        },
    }),
});
