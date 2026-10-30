import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ThemeSpacing } from '../../Theme/util';
import { getThemeSpacing } from '../../Theme/util';

// ===================================== //
//        Flex Layout Components         //
// ===================================== //

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-evenly' | 'space-around';
type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch';

type AllFlexProps = HTMLAttributes<HTMLDivElement> & {
    direction?: FlexDirection;
    justify?: FlexJustify;
    align?: FlexAlign;
    gap?: ThemeSpacing;
    padding?: ThemeSpacing;
    wrap?: boolean;
    flex?: string | number;
    grow?: boolean;
    children?: ReactNode;
    width?: number | string;
    height?: number | string;
    style?: CSSProperties;
    className?: string;
};

/**
 * Utility component for flex layouts (only used internally)
 * Prefer to use Row and Column for readability
 * @param props flex properties
 * @returns flex div with children content
 */
function Flex({
    direction = 'row',
    justify = 'flex-start',
    align = 'center',
    gap = 's',
    padding = 'none',
    wrap = false,
    flex = 'none',
    width,
    height,
    style,
    className,
    children,
    ...rest
}: AllFlexProps) {
    // Theme for gap
    const flexStyle: CSSProperties = {
        display: 'flex',
        flexDirection: direction,
        justifyContent: justify,
        justifyItems: justify,
        alignContent: align,
        alignItems: align,
        gap: getThemeSpacing(gap),
        padding: getThemeSpacing(padding),
        boxSizing: 'border-box',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        flex: flex,
        width: width,
        minWidth: width,
        maxWidth: width,
        height: height,
        minHeight: height,
        maxHeight: height,
    };

    return (
        <div className={clsx(className)} style={{ ...flexStyle, ...style }} {...rest}>
            {children}
        </div>
    );
}

// ===================================== //
//            Row and Column             //
// ===================================== //

// These are exposed to use as components

type FlexProps = HTMLAttributes<HTMLDivElement> & {
    reverse?: boolean;
    justify?: FlexJustify;
    align?: FlexAlign;
    gap?: ThemeSpacing;
    padding?: ThemeSpacing;
    flex?: number | string;
    wrap?: boolean;
    grow?: boolean;
    width?: string | number;
    height?: string | number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
};
export function Row(props: FlexProps) {
    return Flex({
        ...props,
        direction: props.reverse ? 'row-reverse' : 'row',
    });
}
export function Column(props: FlexProps) {
    return Flex({
        ...props,
        direction: props.reverse ? 'column-reverse' : 'column',
    });
}

// Gap utility

type GapProps = {
    size: ThemeSpacing;
};

export function Gap({ size }: GapProps) {
    const gap = getThemeSpacing(size);
    return <div style={{ width: gap, height: gap }} />;
}
