import type { ReactNode } from 'react';

declare module '@remix-run/router' {
    import type {
        AgnosticIndexRouteObject as AgnosticIndexRouteObjectOriginal,
        AgnosticNonIndexRouteObject as AgnosticNonIndexRouteObjectOriginal,
    } from '@remix-run/router/dist';

    type Handle = {
        crumb?: ReactNode;
    };

    export interface AgnosticIndexRouteObject
        extends AgnosticIndexRouteObjectOriginal {
        handle: Handle;
    }

    export interface AgnosticNonIndexRouteObject
        extends AgnosticNonIndexRouteObjectOriginal {
        handle: Handle;
    }

    export * from '@remix-run/router/dist';
}
