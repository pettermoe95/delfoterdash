import {
    pickColorBasedOnTheme,
    ThemeContext,
    useIsMobile,
} from '@brilliant/components';
import type { LocalizeFn } from '@bv/i18n-utils';
import { ClipPath } from '@visx/clip-path';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Arc, Line } from '@visx/shape';
import { Text } from '@visx/text';
import React, { useContext, useId, useMemo, useState } from 'react';
import { useTween } from 'react-use';
import type { ContinuousDimension, GraphDataScalar1D } from '../..';
import { GraphUtil, useResponsiveGraphLayout } from '../..';
import type {
    CalculationTarget,
    CommonGaugeProgressCylinderGraphDisplay,
    CommonGaugeProgressCylinderGraphDisplayConfig,
} from '../../Common/DisplayConfig';
import { Graph } from '../../Common/Graph';
import { GraphLegend } from '../../Common/Legend/Legend';
import type { GraphTooltipContextType } from '../../Common/Tooltip/GraphTooltip';
import { useLimitTheme } from '../../Theme';
import { customColorOverride, getChangeColor } from '../../Utility/graphColors';
import { formatNumber } from '../../Utility/numberFormatter';
import { getGaugeLayout, wrapComparisonLabel } from './utils';

type GaugeGraphProps = {
    data: GraphDataScalar1D<ContinuousDimension>;
    target?: number;
    limitLow?: number;
    limitHigh?: number;
    display?: CommonGaugeProgressCylinderGraphDisplayConfig<CommonGaugeProgressCylinderGraphDisplay>;
    localize?: LocalizeFn;
    locale?: string;
    showDecimals?: boolean;
};

export function GaugeGraph({
    data,
    target,
    limitLow,
    limitHigh,
    display,
    localize,
    locale,
    showDecimals = false,
}: GaugeGraphProps) {
    const isMobile = useIsMobile();

    const id = useId();
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const { layoutRef, layout: baseLayout } = useResponsiveGraphLayout();
    const layout = getGaugeLayout(baseLayout, isMobile);

    const compareConfig: CalculationTarget | undefined =
        typeof display?.compare === 'object' && display.compare !== null
            ? display.compare
            : undefined;
    const isShowingComparison = compareConfig?.isShowingComparison ?? true;

    // Value to show a hint for on hover
    const [hoverHint, setHoverHint] = useState<number | undefined>(undefined);

    const { theme } = useContext(ThemeContext);
    const animateIn = useTween('inOutCirc', 500);

    // Layout constants
    const minRadius = 10;
    const maxRadiusFromWidth = layout.width / 2;
    const maxRadiusFromHeight = layout.height - 5;
    const outerRadius = Math.max(
        minRadius,
        Math.min(maxRadiusFromWidth, maxRadiusFromHeight)
    );
    const gaugeThickness = outerRadius * 0.25; // Thin gauge
    const gaugeRoundness = gaugeThickness * 0.1;
    const innerRadius = Math.max(outerRadius - gaugeThickness, 0);

    // Clamp target to range
    const saneTarget =
        target !== undefined
            ? Math.min(data.domain.max, Math.max(data.domain.min, target))
            : undefined;

    // Origin
    const gaugeOriginX = layout.left + layout.width / 2;
    const gaugeOriginY = layout.bottom - layout.height / 2 + outerRadius / 2;

    // Font scaling
    const fontSize = useMemo(
        () => Math.max(10, innerRadius * 0.2),
        [innerRadius]
    );

    // Scale from domain values to radians
    const scaleRad = useMemo(
        () =>
            scaleLinear<number>({
                range: [-Math.PI / 2, Math.PI / 2],
                domain: [data.domain.min, data.domain.max],
            }),
        [data]
    );
    // Utility to scale to degrees (for some styling)
    const scaleDeg = (val: number) => (scaleRad(val) * 180) / Math.PI;

    // Make SVG gauge arc
    function makeGaugeArc(props?: Record<string, unknown>) {
        return (
            <Arc
                cornerRadius={gaugeRoundness}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={-Math.PI / 2}
                endAngle={Math.PI / 2}
                {...props}
            />
        );
    }

    const { colors } = useLimitTheme({
        value: data.value,
        limits: { limitHigh, limitLow },
    });

    // Fill inside gauge
    const gaugeFill = (
        <Arc
            innerRadius={innerRadius - 1}
            outerRadius={outerRadius + 1}
            startAngle={scaleRad(data.domain.min)}
            endAngle={scaleRad(
                Math.min(data.value, data.domain.max) * animateIn
            )}
            fill={customColorOverride(display?.color, colors).fill}
            stroke={customColorOverride(display?.color, colors).stroke}
            strokeWidth={hoverHint !== undefined ? 3 : 0}
            cornerRadius={gaugeRoundness}
            onMouseMove={handleGaugeHover}
            onMouseLeave={handleGaugeLeave}
            shapeRendering="crisp-edges"
        />
    );

    // Setting text color under the gauge graph
    const gaugeTextColor = pickColorBasedOnTheme(
        colors.text_lightmode,
        colors.text_darkmode
    );

    /**
     * Handler for hover hint
     */
    function handleGaugeHover(e: React.MouseEvent<SVGPathElement>) {
        // Calculate the angle to the mouse
        const coords = localPoint(e) ?? { x: 0, y: 0 };
        const angle = Math.atan2(
            layout.bottom - coords.y,
            gaugeOriginX - coords.x
        );
        const percent = angle / Math.PI;
        const value =
            percent * data.domain.max + (1 - percent) * data.domain.min;
        setHoverHint(value);

        const fixedPretty = GraphUtil.prettyFixed(
            data.value,
            locale,
            showDecimals
        );
        const prettyValue = `${fixedPretty} ${data.domain.unit ?? data.domain.name ?? ''}`;
        tooltip?.showRelative(
            layout.width / 2,
            gaugeOriginY - innerRadius - gaugeThickness,
            [
                {
                    key: 'gauge',
                    content: (
                        <GraphLegend
                            color={
                                customColorOverride(display?.color, colors).fill
                            }
                            value={prettyValue}
                        />
                    ),
                },
            ]
        );
    }

    function handleGaugeLeave() {
        setHoverHint(undefined);
        tooltip?.hideAll();
    }

    /* Target on the left/right side should be aligned accordingly, whereas middle values are center aligned */
    function calculateTargetTextAnchor(angle: number) {
        if (angle > Math.PI / 4) return 'start';
        if (angle < -Math.PI / 4) return 'end';
        return 'middle';
    }

    const diffUnit = (data.domain.unit === '%' ? 'pp' : data.domain.unit) ?? '';

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            onTooltipContextChanged={setTooltipContext}
        >
            {/* Gauge meter */}
            <Group top={gaugeOriginY} left={layout.left + layout.width / 2}>
                {/* Main Gauge */}
                {makeGaugeArc({
                    fill: theme.colors.background.secondary,
                    onMouseMove: handleGaugeHover,
                    onMouseLeave: handleGaugeLeave,
                })}
                <ClipPath id={`gauge-bg-clip-${id}`}>{makeGaugeArc()}</ClipPath>
                {gaugeFill}

                {/*
                    Target indicator (translation to a target angle)
                */}
                {saneTarget && target && (
                    <Group
                        transform={`rotate(${scaleDeg(saneTarget)}) translate(0, ${-outerRadius})`}
                    >
                        {/* Text label */}
                        <Group
                            top={isMobile ? -fontSize * 1.2 : -fontSize * 0.45}
                        >
                            <Text
                                textAnchor={calculateTargetTextAnchor(
                                    scaleDeg(saneTarget)
                                )}
                                verticalAnchor="middle"
                                fontSize={
                                    isMobile ? fontSize * 0.68 : fontSize * 0.55
                                }
                                transform={`rotate(${-scaleDeg(saneTarget)})`}
                                fontWeight="bold"
                                fill={theme.colors.text.primary}
                            >
                                {data.graphConfig?.format == 'raw'
                                    ? target.toPrecision(4)
                                    : `${GraphUtil.prettyValue(
                                          target,
                                          2,
                                          true,
                                          locale,
                                          showDecimals
                                      )} ${data.domain.unit ?? ''}`}
                            </Text>
                        </Group>
                        {/* Target indicator */}
                        <Group>
                            <Line
                                from={{ x: 0, y: -gaugeThickness * 0.1 }}
                                to={{ x: 0, y: gaugeThickness * 1.1 }}
                                stroke={theme.colors.text.primary}
                                strokeWidth={fontSize * 0.1}
                                pointerEvents="none"
                                shapeRendering="crisp-edges"
                                strokeLinecap="round"
                            />
                        </Group>
                    </Group>
                )}

                {/* Center text with value */}
                {fontSize > 9 && (
                    <Group top={-innerRadius / 1.6}>
                        <Text
                            textAnchor="middle"
                            verticalAnchor="start"
                            fontSize={fontSize * 1.4}
                            fontWeight="500"
                            fill={theme.colors.text.primary}
                        >
                            {data.graphConfig?.format == 'raw'
                                ? data.value.toPrecision(4)
                                : `${GraphUtil.prettyValue(
                                      data.value,
                                      2,
                                      true,
                                      locale,
                                      showDecimals
                                  )} ${data.domain.unit ?? ''}`}
                        </Text>

                        {target && (
                            <Group top={fontSize * 2} left={-6}>
                                <Text
                                    textAnchor="end"
                                    verticalAnchor="middle"
                                    fontSize={
                                        isMobile
                                            ? fontSize * 0.68
                                            : fontSize * 0.55
                                    }
                                    fontWeight="500"
                                    fill={gaugeTextColor}
                                >
                                    {`${GraphUtil.prettyValue(
                                        data.value - target,
                                        2,
                                        true,
                                        locale,
                                        showDecimals
                                    )} ${diffUnit}`}
                                </Text>
                                <Text
                                    textAnchor="start"
                                    verticalAnchor="middle"
                                    fontSize={
                                        isMobile
                                            ? fontSize * 0.68
                                            : fontSize * 0.55
                                    }
                                    fontWeight="500"
                                    fill={theme.colors.text.secondary}
                                    dx={6} // Adds slight spacing for better alignment
                                >
                                    {localize?.('miscTerms.vsGoal') ??
                                        'vs goal'}
                                </Text>
                            </Group>
                        )}
                        {data.compareValue && isShowingComparison && (
                            <Group top={fontSize * 2.8} left={-6}>
                                {(() => {
                                    const percentageChange =
                                        GraphUtil.calculatePercentageChange(
                                            data.compareValue,
                                            data.value
                                        );
                                    const difference =
                                        data.value - data.compareValue;
                                    const changeColor =
                                        getChangeColor(difference);

                                    const compareConfig =
                                        typeof data.graphConfig?.compare ===
                                            'object' &&
                                        data.graphConfig.compare !== null
                                            ? data.graphConfig.compare
                                            : undefined;

                                    return (
                                        <>
                                            <Text
                                                textAnchor="end"
                                                verticalAnchor="middle"
                                                fontSize={
                                                    isMobile
                                                        ? fontSize * 0.68
                                                        : fontSize * 0.55
                                                }
                                                fontWeight="500"
                                                fill={changeColor}
                                            >
                                                {compareConfig?.compareMethod ===
                                                'subtract'
                                                    ? `${GraphUtil.prettyValue(
                                                          difference,
                                                          2,
                                                          true,
                                                          locale,
                                                          showDecimals
                                                      )} ${diffUnit}`
                                                    : `${formatNumber(
                                                          percentageChange,
                                                          {
                                                              locale,
                                                              showDecimals,
                                                          }
                                                      )}${compareConfig?.measurement ?? ''}`}
                                            </Text>
                                            {(() => {
                                                const compareText =
                                                    compareConfig?.compareText ??
                                                    'vs last period';
                                                const lines =
                                                    typeof compareText ===
                                                    'string'
                                                        ? wrapComparisonLabel(
                                                              compareText,
                                                              Math.max(
                                                                  8,
                                                                  Math.floor(
                                                                      Math.max(
                                                                          50,
                                                                          outerRadius *
                                                                              0.9
                                                                      ) /
                                                                          ((isMobile
                                                                              ? fontSize *
                                                                                0.68
                                                                              : fontSize *
                                                                                0.55) *
                                                                              0.58)
                                                                  )
                                                              )
                                                          )
                                                        : ['vs last period'];
                                                const baseDy = 0;
                                                const lineHeight = isMobile
                                                    ? fontSize * 0.58
                                                    : fontSize * 0.5;

                                                return lines.map(
                                                    (line, index) => (
                                                        <Text
                                                            key={`${line}-${index}`}
                                                            textAnchor="start"
                                                            verticalAnchor="middle"
                                                            fontSize={
                                                                isMobile
                                                                    ? fontSize *
                                                                      0.68
                                                                    : fontSize *
                                                                      0.55
                                                            }
                                                            fontWeight="500"
                                                            fill={
                                                                theme.colors
                                                                    .text
                                                                    .secondary
                                                            }
                                                            dx={6}
                                                            dy={
                                                                baseDy +
                                                                index *
                                                                    lineHeight
                                                            }
                                                        >
                                                            {line}
                                                        </Text>
                                                    )
                                                );
                                            })()}
                                        </>
                                    );
                                })()}
                            </Group>
                        )}
                    </Group>
                )}
            </Group>
        </Graph>
    );
}
