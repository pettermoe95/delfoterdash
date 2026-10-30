/* eslint-disable @typescript-eslint/consistent-type-imports -- Ambient wildcard modules require import type expressions. */

declare module '*.module.scss' {
    const classes: Record<string, string>;
    export default classes;
}

declare module '*.css';

declare module '*.svg' {
    export const ReactComponent: import('react').FC<
        import('react').SVGProps<SVGSVGElement>
    >;
    const src: string;
    export default src;
}
