import {
    DragDropContext,
    getThemeSpacing,
    ThemeContext,
} from '@brilliant/components';
import type { AnyD3Scale } from '@visx/scale';
import { Line } from '@visx/shape';
import type { AnyScaleBand } from '@visx/shape/lib/types';
import { useContext } from 'react';
import type { AxisGraphLayout } from '../../../Common/layout';
import { GraphLegend } from '../../../Common/Legend/Legend';
import type { GraphTooltipData } from '../../../Common/Tooltip/GraphTooltip';
import { GraphTooltipContext } from '../../../Common/Tooltip/GraphTooltip';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries2D,
} from '../../../Common/types';
import { GraphUtil } from '../../../Common/utils';
import { getGraphTypeDisplayConfig, getLegendColor } from '../../../Theme';

type AxisGraphTooltipProps = {
    layout: AxisGraphLayout;
    data: GraphDataSeries2D<DiscreteDimension, ContinuousDimension>;
    flipAxis?: boolean;
    showLineIndicator?: boolean;
    xScale: AnyScaleBand;
    yScale: AnyD3Scale;
    tooltipLabelFormatter?: (
        xValue: string | undefined,
        unit: string
    ) => string;
    locale?: string;
    showDecimals?: boolean;
};

/**
 * Manager for axis graph tooltips
 */
export function AxisGraphTooltip({
    layout,
    data,
    xScale,
    yScale,
    showLineIndicator,
    flipAxis = false,
    tooltipLabelFormatter,
    locale,
    showDecimals = false,
}: AxisGraphTooltipProps) {
    const { theme } = useContext(ThemeContext);
    const tooltip = useContext(GraphTooltipContext);
    const { drag } = useContext(DragDropContext); // Disable tooltip when drag & drop

    function getLegendProps(
        series: GraphDataSeries2D<
            DiscreteDimension,
            ContinuousDimension
        >['series'][number]
    ) {
        const color = getLegendColor(series);
        const { icon, offIcon } = getGraphTypeDisplayConfig(series);

        return {
            color,
            legendIcon: icon,
            offIcon,
        };
    }

    /**
     * Snaps an absolute screen position to a relative position
     * For discrete dimensions the position is snapped to each
     * categorical band position
     * */
    function snapToDomain(absX: number, absY: number) {
        const relative = tooltip.toRelative(absX, absY);
        const snapPositionsX = xScale.domain().map((d) => xScale(d) ?? 0);
        let snapX = relative.x;
        let snapY = relative.y;

        // Find closest domain position to snap to
        let centerX = relative.x - xScale.bandwidth() / 2;
        if (flipAxis) {
            centerX = -relative.y;
        }
        const domainIndex = snapPositionsX.reduce(
            (prevIdx: number, curr: number, currIdx: number) => {
                const snapPosition = snapPositionsX[prevIdx] ?? 0;
                if (
                    Math.abs(curr - centerX) < Math.abs(snapPosition - centerX)
                ) {
                    return currIdx;
                }
                return prevIdx;
            },
            0
        );
        const clippedIndex = Math.min(
            Math.max(domainIndex, 0),
            data.domainX.values.length - 1
        );
        const clippedSnapPosition = snapPositionsX[clippedIndex] ?? 0;
        if (flipAxis) {
            snapY = -clippedSnapPosition - xScale.bandwidth() / 2;
        } else {
            snapX = clippedSnapPosition + xScale.bandwidth() / 2;
        }

        const domainValue = data.domainX.values[clippedIndex];
        // Set domain value
        tooltip.setDomainValue(domainValue);

        // SnapY uses maximum value in domain
        const snapValues: number[] = data.series.map((series) => {
            return series.values[clippedIndex]?.y ?? data.domainY.min;
        });
        const max: number | undefined = snapValues.reduce(
            (a, b) => Math.max(a ?? 0, b),
            snapValues[0]
        );
        if (flipAxis) {
            snapX = Number(yScale(max ?? 0));
        } else {
            snapY = Number(yScale(max ?? 0));
        }

        return {
            x: snapX,
            y: snapY,
            domainValue,
        };
    }

    /**
     * Converts series and domain into a nice
     * list of tooltip data with title/legends
     */
    function getTooltipData(
        domainValue: number | undefined
    ): GraphTooltipData[] {
        if (domainValue === undefined) {
            return [];
        }
        let domainLabel: string | undefined = undefined;
        const domainIndex = data.domainX.values.indexOf(domainValue); // Assumes unique domain values
        const unit = data.domainX.unit;
        if (
            data.domainX.labels !== undefined &&
            data.domainX.labels.length > domainIndex &&
            domainIndex >= 0
        ) {
            if (tooltipLabelFormatter && unit) {
                domainLabel = tooltipLabelFormatter(
                    data.domainX.labels[domainIndex],
                    unit
                );
            } else {
                domainLabel = data.domainX.labels[domainIndex];
            }
        } else {
            domainLabel = `${data.domainX.unit ?? data.domainX.name} ${domainValue.toFixed(0)}`;
        }

        const header: GraphTooltipData = {
            key: 'header',
            content: (
                <b
                    style={{
                        textAlign: 'center',
                        marginBottom: getThemeSpacing('s'),
                    }}
                    key="header"
                >
                    {domainLabel}
                </b>
            ),
        };
        return [
            header,
            ...data.series.map((series, index) => {
                const key = `tooltip_series_${index}`;
                const value = series.values.find((v) => v.x == domainValue);
                const configProps = getLegendProps(series);

                const formatted =
                    value?.y !== undefined
                        ? `${GraphUtil.prettyFixed(
                              value.y,
                              locale,
                              showDecimals
                          )} ${series.unit ?? ''}`
                        : 'No data';
                return {
                    key: key,
                    content: (
                        <GraphLegend
                            value={formatted}
                            key={key}
                            {...configProps}
                        />
                    ),
                };
            }),
        ];
    }

    /**
     * Small line underneath the X domain in discrete X-axis graphs
     */
    function domainIndicator() {
        if (tooltip.domainValue !== undefined) {
            const fill = theme.colors.text.primary;
            const y = layout.height + 5;
            const left = xScale(tooltip.domainValue) ?? 0;
            const right = left + xScale.bandwidth();

            // Positioning
            let from = { x: left, y: y };
            let to = { x: right, y: y };
            if (flipAxis) {
                from = { x: -4, y: -left };
                to = { x: -4, y: -right };
            }

            return (
                <Line
                    from={from}
                    to={to}
                    stroke={fill}
                    strokeWidth={3}
                    strokeLinecap="round"
                    z={1}
                />
            );
        }
        return <></>;
    }

    // Show tooltip
    function onMouseMove(e: React.MouseEvent<SVGRectElement>) {
        if (drag !== undefined) {
            return;
        }
        const snap = snapToDomain(e.clientX, e.clientY);
        const cursor = tooltip.toRelative(e.clientX, e.clientY);
        const cursorOffset = 12; // keep tooltip just above the pointer
        tooltip.showRelative(
            snap.x,
            cursor.y - cursorOffset,
            getTooltipData(snap.domainValue)
        );
    }

    // Hide tooltip
    function onMouseLeave() {
        tooltip.hideAll();
    }

    return (
        <>
            {/* Cursor target covering entire graph */}
            <rect
                width={layout.width}
                height={layout.height}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                fill="transparent"
            />
            {/* Additional tooltip indications for axis graph */}
            {tooltip.visible && (
                <>
                    {/* Vertical line indicator for continuous graphs */}
                    {showLineIndicator && !flipAxis && (
                        <Line
                            from={{
                                x: Number(tooltip.position.relative.x),
                                y: 0,
                            }}
                            to={{
                                x: Number(tooltip.position.relative.x),
                                y: layout.height,
                            }}
                            strokeDasharray="4 3"
                            stroke={theme.colors.text.secondary}
                            strokeWidth={1}
                            pointerEvents="none"
                        />
                    )}
                    {/* Horizontal line indicator for continuous graphs */}
                    {showLineIndicator && flipAxis && (
                        <Line
                            from={{
                                x: 0,
                                y: Number(tooltip.position.relative.y),
                            }}
                            to={{
                                x: layout.width,
                                y: Number(tooltip.position.relative.y),
                            }}
                            strokeDasharray="5 3"
                            stroke={theme.colors.text.secondary}
                            strokeWidth={1}
                            pointerEvents="none"
                        />
                    )}
                    {/* Domain indicator for discrete X axis */}
                    {domainIndicator()}
                </>
            )}
        </>
    );
}
