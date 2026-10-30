import { z } from 'zod';

const clientEnvSchema = z
    .object({
        apiBaseUrl: z.string().default('https://dev.brilliantview.no/api'),
        localAuthBypass: z.enum(['true', 'false']).default('false'),
    })
    .transform((env) => ({
        ...env,
        wsBaseUrl: env.apiBaseUrl.replace('http', 'ws'),
    }));

type ClientEnvInput = z.input<typeof clientEnvSchema>;

const envMapping = {
    apiBaseUrl: import.meta.env.VITE_API_URL,
    localAuthBypass: import.meta.env.VITE_LOCAL_AUTH_BYPASS,
} satisfies ClientEnvInput;

const skipValidation =
    !!import.meta.env.VITE_CI || !!import.meta.env.VITE_SKIP_ENV_VALIDATION;

export const env = skipValidation
    ? envMapping
    : clientEnvSchema.parse(envMapping);

export const isDev = import.meta.env.DEV;

// Production builds must use real authentication, even if the flag is set.
export const isLocalAuthBypass =
    import.meta.env.DEV && env.localAuthBypass === 'true';
