import { z } from 'zod';

const clientEnvSchema = z
    .object({
        apiBaseUrl: z.string().default('https://dev.brilliantview.no/api'),
        adminBaseUrl: z.string().default('https://admin.brilliantview.no'),
    })
    .transform((env) => ({
        ...env,
        wsBaseUrl: env.apiBaseUrl.replace('http', 'ws'),
    }));

type ClientEnvInput = z.input<typeof clientEnvSchema>;

const envMapping = {
    apiBaseUrl: import.meta.env.VITE_API_URL,
    adminBaseUrl: import.meta.env.VITE_ADMIN_REDIRECT_URI,
} satisfies ClientEnvInput;

const skipValidation =
    !!import.meta.env.VITE_CI || !!import.meta.env.VITE_SKIP_ENV_VALIDATION;

export const env = skipValidation
    ? envMapping
    : clientEnvSchema.parse(envMapping);

export const isDev = import.meta.env.DEV;
