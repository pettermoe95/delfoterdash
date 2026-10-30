import { QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404, 422];
const MAX_RETRIES = 6;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (failureCount > MAX_RETRIES) {
                    return false;
                }
                if (
                    isAxiosError(error) &&
                    HTTP_STATUS_TO_NOT_RETRY.includes(
                        error.response?.status ?? 0
                    )
                ) {
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
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (!isAxiosError(error)) {
                return;
            }
            if (error.response?.status === 401) {
                // window.location.replace("/logout");
            }
        },
    }),
});
