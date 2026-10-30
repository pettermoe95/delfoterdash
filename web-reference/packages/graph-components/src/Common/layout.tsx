import { useIsMobile } from '@brilliant/components';
import { useMeasure } from 'react-use';
import type { UseMeasureRef } from 'react-use/lib/useMeasure';

// ===================================== //
//           Responsive Graph            //
// ===================================== //

type ResponsiveGraphProps = {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
};

/**
 * Return type for responsive graphs
 */
export type GraphLayout = {
    // Size of graph container
    outerWidth: number;
    outerHeight: number;
    // Size of inner container (padded)
    width: number;
    height: number;
    // Commonly used positions (of inner container)
    top: number;
    left: number;
    bottom: number;
    right: number;
};

// Return type for hooks (reference for container and layout)
type ResponsiveGraphReturnType<T extends Element> = {
    layoutRef: UseMeasureRef<T>;
    layout: GraphLayout;
};

/**
 * Utility hook for responsive size. Handles scaling within container bounds automatically.
 * Returns a reference that must be set on parent container to enable responsive behavior.
 * @param config Optional config for min/max size preferences
 * @returns ccontainer reference and graph layout
 */
export function useResponsiveGraphLayout<T extends Element = HTMLDivElement>(
    config?: ResponsiveGraphProps
): ResponsiveGraphReturnType<T> {
    // Use measure to keep track of parent bounds
    const [layoutRef, bounds] = useMeasure<T>();

    // Constrain width
    let width = bounds.width;
    const defaultMaxWidth = window.innerWidth;
    //if (width === 0) width = config?.maxWidth ?? config?.minWidth ?? defaultMaxWidth;
    width = Math.max(config?.minWidth ?? 0, width);
    width = Math.min(config?.maxWidth ?? defaultMaxWidth, width);

    // Constrain height
    let height = bounds.height;
    const defaultMaxHeight = window.innerHeight;
    // if (height === 0) height = config?.maxHeight ?? config?.minHeight ?? defaultMaxHeight;
    height = Math.max(config?.minHeight ?? 0, height);
    height = Math.min(config?.maxHeight ?? defaultMaxHeight, height);

    // Return layout
    const layout: GraphLayout = {
        outerWidth: width,
        outerHeight: height,
        width: width,
        height: height,
        top: 0,
        left: 0,
        bottom: height,
        right: width,
    };
    return { layoutRef, layout };
}

// ===================================== //
//       Responsive Padded Graph         //
// ===================================== //
//    Expands on responsive graph to     //
//        support inner padding          //
// ===================================== //

type ResponsivePaddedGraphProps = ResponsiveGraphProps & {
    // Padding for each side
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    // When padding is set it is used as default for all sides
    padding?: number;
};

/**
 * Utility hook for responsive padded graphs.
 * Wraps the default handler with logic for padding sizes.
 * @param config Config for padding and min/max sizes
 * @returns container reference and graph layout
 */
export function useResponsivePaddedGraphLayout<
    T extends Element = HTMLDivElement,
>({
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    padding,
    ...responsiveGraphConfig
}: ResponsivePaddedGraphProps): ResponsiveGraphReturnType<T> {
    const { layoutRef, layout: base } = useResponsiveGraphLayout<T>(
        responsiveGraphConfig
    );

    // Padding defaults
    const padL = paddingLeft ?? padding ?? 0;
    const padR = paddingRight ?? padding ?? 0;
    const padB = paddingBottom ?? padding ?? 0;
    const padT = paddingTop ?? padding ?? 0;

    // Create graph layout with values
    const innerWidth = Math.max(base.width - padL - padR, 0);
    const innerHeight = Math.max(base.height - padT - padB, 0);
    const layout: GraphLayout = {
        outerWidth: base.width,
        outerHeight: base.height,
        width: innerWidth,
        height: innerHeight,
        left: padL,
        top: padT,
        right: base.right - padR,
        bottom: base.height - padB,
    };

    return { layoutRef, layout };
}

// ===================================== //
//       Responsive Axis Graph           //
// ===================================== //
//       Expands on padded graph to      //
//  enable axis padding and autohiding   //
//     of axis based on graph size       //
// ===================================== //

type AxisGraphProps = ResponsivePaddedGraphProps & {
    // Padding for axis
    axisPaddingLeft?: number;
    axisPaddingRight?: number;
    axisPaddingBottom?: number;
    axisPaddingTop?: number;
    // Autohide axis (graph sizes when axis are hidden)
    // eg. X axis will hide when width is < limit
    hideAxisXLimit?: number;
    hideAxisYLimit?: number;
    // If true will always hide both axis if one should be hidden
    alwaysHideBothAxis?: boolean;
};

export type AxisGraphLayout = GraphLayout & {
    showAxisX: boolean;
    showAxisY: boolean;
};

type ResponsiveAxisGraphReturnType<T extends Element> = {
    layoutRef: UseMeasureRef<T>;
    layout: AxisGraphLayout;
};

/**
 * Utility hook for responsive graph with axis. Enables axis padding to be set
 * separately from standard padding and autohiding of axis if graph is too small.
 * @param props Layout properties (sizing, padding etc.)
 * @returns container ref and axis layout
 */
export function useResponsiveAxisGraphLayout<
    T extends Element = HTMLDivElement,
>({
    // Padding for axis
    axisPaddingLeft,
    axisPaddingRight,
    axisPaddingBottom,
    axisPaddingTop,
    // Autohide axis (graph sizes when axis are hidden)
    hideAxisXLimit,
    hideAxisYLimit,
    alwaysHideBothAxis = false,
    ...paddedProps
}: AxisGraphProps): ResponsiveAxisGraphReturnType<T> {
    // Calculate padding layout using other hook
    const { layoutRef, layout: base } =
        useResponsivePaddedGraphLayout<T>(paddedProps);

    // Check if axis should be hidden
    let hideAxisX =
        hideAxisXLimit !== undefined && base.height < hideAxisXLimit;
    let hideAxisY = hideAxisYLimit !== undefined && base.width < hideAxisYLimit;
    if ((hideAxisX || hideAxisY) && alwaysHideBothAxis) {
        hideAxisX = hideAxisY = true;
    }

    // Additional padding for axis
    const padLeft = hideAxisY ? 0 : (axisPaddingLeft ?? 0);
    const padRight = hideAxisY ? 0 : (axisPaddingRight ?? 0);
    const padBottom = hideAxisX ? 0 : (axisPaddingBottom ?? 0);
    const padTop = hideAxisX ? 0 : (axisPaddingTop ?? 0);

    const isMobile = useIsMobile();

    const calculatedWidth = Math.max(
        base.width - padLeft - padRight,
        isMobile ? 600 : 0
    );
    const calculatedHeight = base.height - padTop - padBottom;

    // Calculate axis layout
    const layout: AxisGraphLayout = {
        ...base,
        width: calculatedWidth,
        height: calculatedHeight,
        left: base.left + padLeft,
        top: base.top + padTop,
        bottom: base.bottom - padBottom,
        right: base.right + padRight,
        showAxisX: !hideAxisX,
        showAxisY: !hideAxisY,
    };
    return { layoutRef, layout };
}
