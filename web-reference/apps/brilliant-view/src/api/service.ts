import { createAPIService } from '@bv/api';
import { env, isDev } from '~/config/env';

export const apiService = createAPIService({
    baseUrl: isDev ? '/api' : env.apiBaseUrl,
});
