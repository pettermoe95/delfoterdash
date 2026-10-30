import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ThemeSpacing } from '../../Theme/util';
import { getThemeSpacing } from '../../Theme/util';

// ===================================== //
//        Grid Layout Components         //
// ===================================== //

type GridProps = HTMLAttributes<HTMLDivElement> & {
    template?: string;
    templateRows?: string;
    templateColumns?: string;
    gap?: ThemeSpacing;
    width?: string;
    height?: string;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
};

export function Grid({
    template,
    templateRows,
    templateColumns,
    gap = 's',
    width = 'auto',
    height = 'auto',
    className,
    children,
    ...rest
}: GridProps) {
    const gridStyle: CSSProperties = {
        display: 'grid',
        gridTemplate: template,
        gridTemplateColumns: templateColumns,
        gridTemplateRows: templateRows,
        width: width,
        height: height,
        gap: getThemeSpacing(gap),
        maxWidth: width,
        maxHeight: height,
        boxSizing: 'border-box',
    };
    return (
        <div className={className} {...rest} style={{ ...gridStyle, ...rest.style }}>
            {children}
        </div>
    );
}
