import type { LocalizeFn } from '@bv/i18n-utils';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { withTooltip } from '@visx/tooltip';
import type { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { defaultValueFormatter } from '../../../Utility/numberFormatter';
import { TooltipPortal } from '../../TooltipPortal/TooltipPortal';
import TooltipCard from '../TooltipCard/TooltipCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProgressLineProps = {
    data: number[]; // y values
    /** Optional labels (e.g. month names) aligned by index with data */
    labels?: string[];
    dates?: Date[];
    width: number | string; // Can be a percentage or fixed width
    height: number | string; // Can be a percentage or fixed height
    targetValue?: number;
    strokeColor?: string;
    targetColor?: string;
    /** Format numeric value (default nb-NO with space group). */
    valueFormatter?: (value: number) => string;
    /** Optional className for outer wrapper */
    className?: string;
    /** Optional custom renderer for the tooltip card */
    renderTooltip?: (ctx: {
        index: number;
        value: number;
        label: string;
    }) => React.ReactNode;
    currencySuffix?: string;
    localize?: LocalizeFn;
};

export interface TooltipData {
    index: number;
    value: number;
    label: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProgressLineBase: React.FC<
    ProgressLineProps & WithTooltipProvidedProps<TooltipData>
> = ({
    data,
    labels,
    width,
    height,
    targetValue,
    strokeColor = '#367D30',
    targetColor = '#ccc',
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    valueFormatter = defaultValueFormatter,
    className,
    renderTooltip,
    currencySuffix = 'kr',
    localize,
}) => {
    const margin = { top: 0, bottom: 0, left: 8, right: 8 };
    const parsedWidth = typeof width === 'string' ? parseFloat(width) : width;
    const parsedHeight =
        typeof height === 'string' ? parseFloat(height) : height;
    const innerWidth = parsedWidth - margin.left - margin.right;
    const innerHeight = parsedHeight - margin.top - margin.bottom;

    const xScale = scaleLinear({
        domain: [0, data.length - 1],
        range: [0, innerWidth],
    });

    const domainValues =
        typeof targetValue === 'number' ? [...data, targetValue] : data;
    const yScale = scaleLinear({
        domain: [Math.min(...domainValues), Math.max(...domainValues)],
        range: [innerHeight, 0],
        nice: true,
    });

    const lastIndexRef = useRef<number | null>(null);
    const lastChangeTsRef = useRef<number>(0);

    const handleTooltip = useCallback(
        (
            event:
                | React.TouchEvent<SVGRectElement>
                | React.MouseEvent<SVGRectElement>
        ) => {
            const { x } = localPoint(event) || { x: 0 };
            const xVal = xScale.invert(x);
            // Use round for more intuitive hover on last datapoint
            const index = Math.round(xVal);
            const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

            // Simple hysteresis: if index toggles back-and-forth quickly by 1, keep previous for a short window
            const now = performance.now();
            if (
                lastIndexRef.current !== null &&
                Math.abs(clampedIndex - lastIndexRef.current) === 1 &&
                now - lastChangeTsRef.current < 50
            ) {
                return;
            }

            const value = data[clampedIndex];
            const label = labels ? (labels[clampedIndex] ?? '') : '';

            if (value !== undefined) {
                showTooltip({
                    tooltipData: { index: clampedIndex, value, label },
                    tooltipLeft: xScale(clampedIndex),
                    tooltipTop: yScale(value),
                });
                if (lastIndexRef.current !== clampedIndex) {
                    lastIndexRef.current = clampedIndex;
                    lastChangeTsRef.current = now;
                }
            }
        },
        [xScale, yScale, data, showTooltip, labels]
    );

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    // Track scroll/resize to reposition portal tooltip
    const [, forceRerender] = useState(0);
    useLayoutEffect(() => {
        if (!tooltipData) return; // only while visible
        const handle = () => forceRerender((n) => n + 1);
        window.addEventListener('scroll', handle, true);
        window.addEventListener('resize', handle);
        return () => {
            window.removeEventListener('scroll', handle, true);
            window.removeEventListener('resize', handle);
        };
    }, [tooltipData]);

    if (data.length < 2) return null;

    return (
        <div
            ref={wrapperRef}
            style={{ position: 'relative', width: '100%', height: '100%' }} // Testing relative sizes
            className={className}
        >
            <svg width="100%" height="100%">
                <Group top={margin.top} left={margin.left}>
                    {/* Area fill */}
                    <AreaClosed<number>
                        data={data}
                        x={(_d, i) => xScale(i)}
                        y={(d) => yScale(d)}
                        yScale={yScale}
                        fill="url(#progress-fill)"
                        curve={curveMonotoneX}
                    />
                    {/* Line path */}
                    <LinePath<number>
                        data={data}
                        x={(_d, i) => xScale(i)}
                        y={(d) => yScale(d)}
                        stroke={strokeColor}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />
                    {/* Target line */}
                    {typeof targetValue === 'number' && (
                        <Line
                            from={{ x: 0, y: yScale(targetValue) }}
                            to={{ x: parsedWidth, y: yScale(targetValue) }}
                            stroke={targetColor}
                            strokeDasharray="4,2"
                            strokeWidth={1}
                        />
                    )}
                    {/* Interaction layer */}
                    <Bar
                        x={0}
                        y={0}
                        width={innerWidth + 2}
                        height={innerHeight}
                        fill="transparent"
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={hideTooltip}
                    />
                    {/* Tooltip marker */}
                    {tooltipData && (
                        <circle
                            cx={tooltipLeft}
                            cy={tooltipTop}
                            r={4}
                            fill={strokeColor}
                            stroke="white"
                            strokeWidth={2}
                            pointerEvents="none" /* prevent capturing mouse causing leave/enter flicker */
                        />
                    )}
                </Group>
                {/* Area gradient */}
                <defs>
                    <linearGradient
                        id="progress-fill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor={strokeColor}
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="100%"
                            stopColor={strokeColor}
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>
            </svg>

            {/* Custom tooltip card via portal to escape clipping */}
            {tooltipData &&
                wrapperRef.current &&
                (() => {
                    const rect = wrapperRef.current.getBoundingClientRect();
                    const globalX = rect.left + tooltipLeft;
                    const globalY = rect.top + tooltipTop;
                    const content = renderTooltip ? (
                        renderTooltip(tooltipData)
                    ) : (
                        <TooltipCard
                            label={tooltipData.label}
                            value={tooltipData.value}
                            valueFormatter={valueFormatter}
                            currencySuffix={currencySuffix}
                            visible={!!tooltipData}
                            color={strokeColor}
                            style={{
                                transform: `translate(${globalX}px, ${globalY}px) translate(-50%, calc(-100% - 8px))`,
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                            }}
                            localize={localize}
                        />
                    );
                    return <TooltipPortal>{content}</TooltipPortal>;
                })()}
        </div>
    );
};

export const ProgressLine = withTooltip<ProgressLineProps, TooltipData>(
    ProgressLineBase
);
