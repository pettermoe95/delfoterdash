/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_ADMIN_REDIRECT_URI: string;
    readonly VITE_CI: string;
    readonly VITE_SKIP_ENV_VALIDATION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __COMMIT_HASH__: string;
