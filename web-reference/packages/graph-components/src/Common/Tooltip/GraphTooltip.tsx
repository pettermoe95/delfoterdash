import { Column, DragDropContext, ThemeContext } from '@brilliant/components';
import { Group } from '@visx/group';
import { Line, Polygon } from '@visx/shape';
import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import {
    createContext,
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { GraphLayout } from '../layout';
import styles from './GraphTooltip.module.scss';

// Data element for tooltip
export type GraphTooltipData = {
    key: string;
    content: ReactNode;
};

type TooltipPoint = {
    x: number;
    y: number;
};

type TooltipPosition = {
    // Absolute screen position
    absolute: TooltipPoint;
    // Relative position within SVG
    relative: TooltipPoint;
};

// Context available to graphs
export type GraphTooltipContextType = {
    // Tooltips can set using either relative or absolute positioning
    showRelative(x: number, y: number, data: GraphTooltipData[]): void;
    showAbsolute(x: number, y: number, data: GraphTooltipData[]): void;
    setDomainValue(value: number | undefined): void;
    toRelative(x: number, y: number): TooltipPoint;
    hideAll(): void;
    hide(key: string): void;
    position: TooltipPosition;
    // A value in the domain (set by external graph components)
    domainValue: number | undefined;
    visible: boolean;
    containsNode(node: Node | null): boolean;
};

// Default empty context
export const GraphTooltipContext = createContext<GraphTooltipContextType>({
    showRelative() {
        return;
    },
    showAbsolute() {
        return;
    },
    toRelative() {
        return { x: 0, y: 0 };
    },
    setDomainValue() {
        return;
    },
    hideAll() {
        return;
    },
    hide() {
        return;
    },
    position: {
        relative: { x: 0, y: 0 },
        absolute: { x: 0, y: 0 },
    },
    domainValue: undefined,
    visible: false,
    containsNode() {
        return false;
    },
});

type GraphTooltipWrapperProps = {
    svgRef: React.RefObject<SVGSVGElement>;
    onContextChanged?: (tooltipContext: GraphTooltipContextType) => void;
    layout: GraphLayout;
    children?: ReactNode;
};

/**
 * Handles rendering of tooltips and provides the tooltip context.
 * Enables each graph to individually request tooltips using either
 * an absolute or relative position.
 */
export function GraphTooltipWrapper({
    svgRef,
    layout,
    onContextChanged,
    children,
}: GraphTooltipWrapperProps) {
    const { theme } = useContext(ThemeContext);
    const { drag } = useContext(DragDropContext); // Disable tooltip when drag & drop
    const [tooltipData, setTooltipData] = useState<GraphTooltipData[]>([]);
    const [domainValue, setDomainValue] = useState<number | undefined>(
        undefined
    );
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [collisionOffset, setCollisionOffset] = useState({ x: 0, y: 0 });
    const hideTimeoutRef = useRef<number | null>(null);
    const [, setPinnedState] = useState(false);
    const isPinnedRef = useRef(false);
    const [hasScroll, setHasScroll] = useState(false);
    const setPinned = useCallback((value: boolean) => {
        isPinnedRef.current = value;
        setPinnedState(value);
    }, []);
    const [position, setPosition] = useState<TooltipPosition>({
        relative: { x: 0, y: 0 },
        absolute: { x: 0, y: 0 },
    });
    const isVisible = tooltipData.length > 0;

    const absoluteToRelative = useCallback(
        (x: number, y: number): TooltipPoint => {
            // Convert absolute position to relative
            let relX = x;
            let relY = y;
            const bounds = svgRef.current?.getBoundingClientRect();
            if (bounds !== undefined) {
                relX = x - (bounds?.x ?? 0);
                relY = y - (bounds?.y ?? 0);
            }
            return {
                x: relX - layout.left,
                y: relY - layout.top,
            };
        },
        [svgRef, layout.left, layout.top]
    );

    const relativeToAbsolute = useCallback(
        (x: number, y: number): TooltipPoint => {
            // Convert relative position to absolute
            let absX = x;
            let absY = y;
            const bounds = svgRef.current?.getBoundingClientRect();
            if (bounds !== undefined) {
                absX = x + (bounds?.x ?? 0) + layout.left;
                absY = y + (bounds?.y ?? 0) + layout.top;
            }
            return {
                x: absX,
                y: absY,
            };
        },
        [svgRef, layout.left, layout.top]
    );

    const clearHideTimeout = useCallback(() => {
        if (hideTimeoutRef.current !== null) {
            if (typeof window !== 'undefined') {
                window.clearTimeout(hideTimeoutRef.current);
            }
            hideTimeoutRef.current = null;
        }
    }, []);

    const hideAllImmediate = useCallback(() => {
        clearHideTimeout();
        setPinned(false);
        setDomainValue(undefined);
        setTooltipData([]);
    }, [clearHideTimeout, setPinned]);

    const scheduleHideAll = useCallback(
        (delay = 150) => {
            if (isPinnedRef.current) return;
            if (delay <= 0 || typeof window === 'undefined') {
                hideAllImmediate();
                return;
            }
            clearHideTimeout();
            hideTimeoutRef.current = window.setTimeout(() => {
                hideTimeoutRef.current = null;
                if (isPinnedRef.current) return;
                hideAllImmediate();
            }, delay);
        },
        [clearHideTimeout, hideAllImmediate]
    );

    const cancelHide = useCallback(() => {
        clearHideTimeout();
    }, [clearHideTimeout]);

    const containsNode = useCallback((node: Node | null) => {
        if (!node) return false;
        const tooltipElement = tooltipRef.current;
        if (!tooltipElement) return false;
        return tooltipElement.contains(node);
    }, []);

    const showRelative = useCallback(
        (x: number, y: number, data: GraphTooltipData[]) => {
            if (drag !== undefined) {
                return;
            }
            cancelHide();
            if (isPinnedRef.current) {
                setPinned(false);
            }
            const newKeys = data.map((data) => data.key);
            const oldData = tooltipData.filter(
                (data) => !newKeys.includes(data.key)
            );
            setTooltipData([...oldData, ...data]);
            setPosition({
                ...position,
                relative: { x: x, y: y },
                absolute: relativeToAbsolute(x, y),
            });
        },
        [cancelHide, drag, position, relativeToAbsolute, setPinned, tooltipData]
    );

    const showAbsolute = useCallback(
        (x: number, y: number, data: GraphTooltipData[]) => {
            if (drag !== undefined) {
                return;
            }
            cancelHide();
            if (isPinnedRef.current) {
                setPinned(false);
            }
            setTooltipData([...tooltipData, ...data]);
            setPosition({
                ...position,
                relative: absoluteToRelative(x, y),
                absolute: {
                    x: x,
                    y: y,
                },
            });
        },
        [absoluteToRelative, cancelHide, drag, position, setPinned, tooltipData]
    );

    const providedContext: GraphTooltipContextType = useMemo(() => {
        const context: GraphTooltipContextType = {
            showRelative: showRelative,
            showAbsolute: showAbsolute,
            toRelative: absoluteToRelative,
            setDomainValue: setDomainValue,
            hideAll() {
                scheduleHideAll();
            },
            hide(key: string) {
                cancelHide();
                const dataRemaining = tooltipData.filter(
                    (data) => data.key !== key
                );
                if (dataRemaining.length <= 1) {
                    scheduleHideAll();
                } else {
                    setTooltipData(dataRemaining);
                }
            },
            position: position,
            domainValue: domainValue,
            visible: isVisible,
            containsNode: containsNode,
        };
        return context;
    }, [
        absoluteToRelative,
        containsNode,
        domainValue,
        cancelHide,
        scheduleHideAll,
        isVisible,
        position,
        showAbsolute,
        showRelative,
        tooltipData,
    ]);

    useLayoutEffect(() => {
        if (!isVisible) {
            if (collisionOffset.x !== 0 || collisionOffset.y !== 0) {
                setCollisionOffset({ x: 0, y: 0 });
            }
            if (hasScroll) {
                setHasScroll(false);
            }
            return;
        }

        if (typeof window === 'undefined') return;

        const tooltipElement = tooltipRef.current;
        if (!tooltipElement) return;

        const rect = tooltipElement.getBoundingClientRect();
        const padding = 8;
        const viewportRight = window.innerWidth - padding;
        const viewportBottom = window.innerHeight - padding;

        let offsetX = 0;
        let offsetY = 0;

        if (rect.right > viewportRight) {
            offsetX = viewportRight - rect.right;
        }
        if (rect.left + offsetX < padding) {
            offsetX += padding - (rect.left + offsetX);
        }

        if (rect.bottom > viewportBottom) {
            offsetY = viewportBottom - rect.bottom;
        }
        if (rect.top + offsetY < padding) {
            offsetY += padding - (rect.top + offsetY);
        }

        if (offsetX !== collisionOffset.x || offsetY !== collisionOffset.y) {
            setCollisionOffset({ x: offsetX, y: offsetY });
        }

        const detectScrollable = () => {
            const wrapperElement = wrapperRef.current;
            if (!wrapperElement) return false;

            const elements: HTMLElement[] = [
                wrapperElement,
                ...Array.from(
                    wrapperElement.querySelectorAll<HTMLElement>('*')
                ),
            ];

            for (const element of elements) {
                const style = window.getComputedStyle(element);
                const overflowY = style.overflowY;
                const overflowX = style.overflowX;
                const allowsScrollY =
                    overflowY === 'auto' || overflowY === 'scroll';
                const allowsScrollX =
                    overflowX === 'auto' || overflowX === 'scroll';

                if (
                    (allowsScrollY &&
                        element.scrollHeight > element.clientHeight + 1) ||
                    (allowsScrollX &&
                        element.scrollWidth > element.clientWidth + 1)
                ) {
                    return true;
                }
            }

            return false;
        };

        const scrollable = detectScrollable();
        if (scrollable !== hasScroll) {
            setHasScroll(scrollable);
        }
    }, [
        collisionOffset.x,
        collisionOffset.y,
        hasScroll,
        isVisible,
        position.absolute.x,
        position.absolute.y,
        tooltipData,
    ]);

    // Alert parent of context change. This enables state to propagate
    // upwards as well, so you can use tooltip in top level component instead of just children
    useEffect(() => {
        onContextChanged?.(providedContext);
    }, [onContextChanged, providedContext]);

    useEffect(() => {
        return () => {
            clearHideTimeout();
        };
    }, [clearHideTimeout]);

    const arrowLeft = {
        x: 0,
        y: -5,
    };
    const arrowRight = {
        x: 10,
        y: -5,
    };
    const arrowBottom = {
        x: 5,
        y: 0,
    };
    const tooltipArrowPoints: [number, number][] = [
        [arrowLeft.x, arrowLeft.y],
        [arrowBottom.x, arrowBottom.y],
        [arrowRight.x, arrowRight.y],
    ];

    const absoluteTooltipStyle: CSSProperties = {
        position: 'fixed',
        transition: 'top .05s, left .05s',
        transitionTimingFunction: 'linear',
        left: position.absolute.x + collisionOffset.x,
        top: position.absolute.y + collisionOffset.y,
    };

    const tooltip = isVisible && (
        <div
            ref={tooltipRef}
            style={absoluteTooltipStyle}
            data-componentname="tooltip"
            className={clsx(styles.tooltip)}
            onPointerEnter={() => {
                setPinned(true);
                cancelHide();
            }}
            onPointerLeave={() => {
                setPinned(false);
                scheduleHideAll(0);
            }}
        >
            <div ref={wrapperRef} className={styles.tooltip_wrapper}>
                <div
                    className={clsx(
                        styles.tooltip_box,
                        hasScroll ? styles.tooltip_box_scrolled : undefined
                    )}
                >
                    <Column width="100%" align="stretch" gap="xs">
                        {tooltipData.map((data) => (
                            <Fragment key={data.key}>{data.content}</Fragment>
                        ))}
                    </Column>
                </div>
                <div className={styles.arrow_container}>
                    <div className={styles.arrow}>
                        <svg width="10px" className={styles.arrow_svg}>
                            <Group top={0} left={0}>
                                <Polygon
                                    points={tooltipArrowPoints}
                                    fill={theme.colors.background.primary}
                                />
                                <Line
                                    from={arrowLeft}
                                    to={arrowBottom}
                                    stroke={theme.colors.border.primary}
                                />
                                <Line
                                    from={arrowRight}
                                    to={arrowBottom}
                                    stroke={theme.colors.border.primary}
                                />
                            </Group>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const id = useId();
    const tooltipInPortal =
        tooltip !== undefined &&
        createPortal(tooltip, document.body, `tooltip-${id}`);

    return (
        <GraphTooltipContext.Provider value={providedContext}>
            {children}
            {tooltipInPortal}
        </GraphTooltipContext.Provider>
    );
}
