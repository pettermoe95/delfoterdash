import { getThemeSpacing, ThemeContext } from '@brilliant/components';
import { Group } from '@visx/group';
import { Line, Polygon } from '@visx/shape';
import { useCallback, useContext, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries2D,
} from '../..';
import { useResponsivePaddedGraphLayout } from '../..';
import { Graph } from '../../Common/Graph';
import { GraphLegend } from '../../Common/Legend/Legend';
import type {
    GraphTooltipContextType,
    GraphTooltipData,
} from '../../Common/Tooltip/GraphTooltip';
import { GraphUtil } from '../../Common/utils';
import type { FunnelGraphSeriesConfig, FunnelStep } from './types';
import {
    getDisplayConfig,
    getStepColor,
    isSeriesDisplayConfig,
    splitTimePeriodLabel,
    stripTimePeriodSuffix,
    sumSeriesValues,
} from './utils';

export type FunnelGraphProps = {
    data: GraphDataSeries2D<DiscreteDimension, ContinuousDimension>;
    display?: FunnelGraphSeriesConfig | Record<string, FunnelGraphSeriesConfig>;
    locale?: string;
    showDecimals?: boolean;
};

export function FunnelGraph({
    display,
    data,
    locale,
    showDecimals = false,
}: FunnelGraphProps) {
    const { theme } = useContext(ThemeContext);
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const rootDisplay = isSeriesDisplayConfig(display) ? display : undefined;
    const showLabelTimePeriod = rootDisplay?.showLabelTimePeriod === true;
    const { layoutRef, layout } = useResponsivePaddedGraphLayout({
        padding: 16,
        paddingLeft: 140,
        paddingTop: 25,
        paddingBottom: 25,
    });

    const steps: FunnelStep[] = useMemo(() => {
        return data.series.map((series, index) => {
            const seriesDisplay = getDisplayConfig(display, series, index);
            const displayLabel =
                typeof seriesDisplay?.legendText === 'string'
                    ? seriesDisplay.legendText
                    : undefined;
            const rawLabel = displayLabel ?? series.name ?? '';
            const rawLabelTrimmed = rawLabel.trim();
            const trimmed = showLabelTimePeriod
                ? rawLabelTrimmed
                : stripTimePeriodSuffix(rawLabelTrimmed);
            const label =
                trimmed.length > 0 && trimmed.toLowerCase() !== 'no label'
                    ? trimmed
                    : `Step ${index + 1}`;
            const labelParts = showLabelTimePeriod
                ? splitTimePeriodLabel(label)
                : { concept: label };
            const tooltipLabelParts = showLabelTimePeriod
                ? splitTimePeriodLabel(rawLabelTrimmed)
                : { concept: stripTimePeriodSuffix(rawLabelTrimmed) };
            const tooltipMain =
                tooltipLabelParts.concept.length > 0 &&
                tooltipLabelParts.concept.toLowerCase() !== 'no label'
                    ? tooltipLabelParts.concept
                    : `Step ${index + 1}`;
            const tooltipFullLabel =
                showLabelTimePeriod && tooltipLabelParts.timePeriod
                    ? `${tooltipMain} ${tooltipLabelParts.timePeriod}`
                    : tooltipMain;

            return {
                label: labelParts.concept,
                periodLabel: labelParts.timePeriod,
                fullLabel: tooltipFullLabel,
                value: sumSeriesValues(series),
                color: getStepColor(series, index, display),
                unit: series.unit,
                seriesIndex: index,
            };
        });
    }, [data.series, display, showLabelTimePeriod]);

    const maxValue = steps.reduce((max, step) => Math.max(max, step.value), 0);
    const hasSteps = steps.length > 0;
    const hasValues = maxValue > 0;

    const gap = hasSteps ? Math.min(12, layout.height * 0.04) : 0;
    const stepHeight = hasSteps
        ? (layout.height - gap * (steps.length - 1)) / steps.length
        : 0;

    const widths = hasSteps
        ? steps.map((step) =>
              hasValues
                  ? Math.max(0, (step.value / maxValue) * layout.width)
                  : 0
          )
        : [];

    const axisX = layout.left - 12;
    const axisLabelX = axisX - 10;
    const axisTickLength = 6;

    const showTooltip = useCallback(
        (
            step: FunnelStep,
            index: number,
            position: { x: number; y: number }
        ) => {
            const formattedValue =
                step.value !== undefined
                    ? `${GraphUtil.prettyFixed(
                          step.value,
                          locale,
                          showDecimals
                      )} ${step.unit ?? ''}`
                    : 'No data';
            const content: GraphTooltipData = {
                key: 'funnel-tooltip',
                content: (
                    <>
                        <b
                            style={{
                                textAlign: 'center',
                                marginBottom: getThemeSpacing('s'),
                            }}
                        >
                            {step.fullLabel}
                        </b>
                        <GraphLegend
                            value={formattedValue}
                            color={step.color}
                        />
                    </>
                ),
            };

            if (!tooltip) {
                return;
            }
            tooltip.hideAll();
            tooltip.setDomainValue(index);
            tooltip.showRelative(position.x, position.y - 12, [content]);
        },
        [locale, showDecimals, tooltip]
    );

    const hideTooltip = useCallback(() => {
        tooltip?.hideAll();
    }, [tooltip]);

    const handleHover = useCallback(
        (event: MouseEvent<SVGRectElement>) => {
            if (!tooltip || !hasValues) {
                return;
            }
            const relative = tooltip.toRelative(event.clientX, event.clientY);
            const bandSize = stepHeight + gap;
            if (bandSize <= 0) {
                hideTooltip();
                return;
            }
            const index = Math.floor(relative.y / bandSize);
            if (index < 0 || index >= steps.length) {
                hideTooltip();
                return;
            }

            const yWithin = relative.y - index * bandSize;
            if (yWithin < 0 || yWithin > stepHeight) {
                hideTooltip();
                return;
            }

            const step = steps[index];
            if (step) {
                showTooltip(step, index, relative);
            }
        },
        [gap, hasValues, hideTooltip, showTooltip, stepHeight, steps, tooltip]
    );

    if (!hasSteps) {
        return (
            <Graph
                layoutRef={layoutRef}
                layout={layout}
                onTooltipContextChanged={setTooltipContext}
            >
                <rect width={layout.width} height={layout.height} fill="none" />
                <Group>
                    <Line
                        from={{ x: axisX, y: layout.top }}
                        to={{ x: axisX, y: layout.top + layout.height }}
                        stroke={theme.colors.text.secondary}
                        strokeWidth={1}
                    />
                </Group>
            </Graph>
        );
    }

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            onTooltipContextChanged={setTooltipContext}
        >
            <rect width={layout.width} height={layout.height} fill="none" />
            <Group>
                <Line
                    from={{ x: axisX, y: layout.top }}
                    to={{ x: axisX, y: layout.top + layout.height }}
                    stroke={theme.colors.text.secondary}
                    strokeWidth={1}
                />
                {steps.map((step, index) => {
                    const topWidth = widths[index - 1] ?? widths[index] ?? 0;
                    const bottomWidth = widths[index] ?? 0;
                    const y = layout.top + index * (stepHeight + gap);
                    const topX = layout.left + (layout.width - topWidth) / 2;
                    const bottomX =
                        layout.left + (layout.width - bottomWidth) / 2;

                    const points: [number, number][] = [
                        [topX, y],
                        [topX + topWidth, y],
                        [bottomX + bottomWidth, y + stepHeight],
                        [bottomX, y + stepHeight],
                    ];

                    const centerY = y + stepHeight / 2;
                    const centerX = layout.left + layout.width / 2;
                    const isDimmed =
                        tooltip?.domainValue !== undefined &&
                        tooltip.domainValue !== index;
                    const hasPeriodLabel = Boolean(step.periodLabel);
                    const labelLineHeight = 14;
                    const labelMainY = hasPeriodLabel
                        ? centerY - labelLineHeight / 2
                        : centerY;
                    const labelPeriodY = centerY + labelLineHeight / 2;

                    const stepValueLabel = `${GraphUtil.prettyFixed(
                        step.value,
                        locale,
                        showDecimals
                    )}${step.unit ? ` ${step.unit}` : ''}`;

                    return (
                        <Group key={`funnel-step-${step.seriesIndex}`}>
                            <Line
                                from={{ x: axisX, y: centerY }}
                                to={{ x: axisX + axisTickLength, y: centerY }}
                                stroke={theme.colors.text.secondary}
                                strokeWidth={1}
                            />
                            <text
                                x={axisLabelX}
                                y={labelMainY}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fill={theme.colors.text.primary}
                                fontSize={12}
                                pointerEvents="none"
                            >
                                {step.label}
                            </text>
                            {hasPeriodLabel && (
                                <text
                                    x={axisLabelX}
                                    y={labelPeriodY}
                                    textAnchor="end"
                                    alignmentBaseline="middle"
                                    fill={theme.colors.text.secondary}
                                    fontSize={12}
                                    pointerEvents="none"
                                >
                                    {step.periodLabel}
                                </text>
                            )}
                            {hasValues && (
                                <>
                                    <Polygon
                                        points={points}
                                        fill={step.color}
                                        opacity={isDimmed ? 0.5 : 1}
                                        filter={
                                            isDimmed ? 'grayscale(100%)' : ''
                                        }
                                        pointerEvents="none"
                                    />
                                    <text
                                        x={centerX}
                                        y={centerY}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fill={theme.colors.text.primary}
                                        strokeWidth={3}
                                        paintOrder="stroke"
                                        fontSize={14}
                                        fontWeight="bold"
                                        pointerEvents="none"
                                    >
                                        {stepValueLabel}
                                    </text>
                                </>
                            )}
                        </Group>
                    );
                })}
            </Group>
            <rect
                x={layout.left}
                y={layout.top}
                width={layout.width}
                height={layout.height}
                fill="transparent"
                pointerEvents="all"
                onMouseMove={handleHover}
                onMouseLeave={hideTooltip}
            />
        </Graph>
    );
}
