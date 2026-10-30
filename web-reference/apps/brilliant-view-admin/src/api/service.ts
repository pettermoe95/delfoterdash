import { createAPIService } from '@bv/api';
import { env } from '~/config/env';

export const apiService = createAPIService({
    baseUrl: env.apiBaseUrl,
});
