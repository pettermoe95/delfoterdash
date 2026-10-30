/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_LOCAL_AUTH_BYPASS?: 'true' | 'false';
    readonly VITE_CI: string;
    readonly VITE_SKIP_ENV_VALIDATION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __COMMIT_HASH__: string;
