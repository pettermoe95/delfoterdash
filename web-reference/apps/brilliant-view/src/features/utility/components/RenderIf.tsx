import type { ReactNode } from 'react';

type RenderIfProps = {
    children: ReactNode;
    condition: boolean | (() => boolean);
    else?: ReactNode;
};

export function RenderIf(props: RenderIfProps) {
    const shouldRender =
        typeof props.condition === 'function'
            ? props.condition()
            : props.condition;
    if (!shouldRender) return <>{props.else ?? null}</>;
    return <>{props.children}</>;
}
