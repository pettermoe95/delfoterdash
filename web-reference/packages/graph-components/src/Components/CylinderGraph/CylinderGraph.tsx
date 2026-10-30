import { ThemeContext } from '@brilliant/components';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useContext, useState } from 'react';
import type { ContinuousDimension, GraphDataScalar1D } from '../..';
import { GraphUtil, useResponsivePaddedGraphLayout } from '../..';
import type { CommonGaugeProgressCylinderGraphDisplay } from '../../Common/DisplayConfig';
import { Graph } from '../../Common/Graph';
import { GraphLegend } from '../../Common/Legend/Legend';
import type { GraphTooltipContextType } from '../../Common/Tooltip/GraphTooltip';
import { useLimitTheme } from '../../Theme';
import { customColorOverride } from '../../Utility/graphColors';

type CylinderGraphProps = {
    data: GraphDataScalar1D<ContinuousDimension>;
    target?: number;
    limitLow?: number;
    limitHigh?: number;
    display?: CommonGaugeProgressCylinderGraphDisplay;
    locale?: string;
    showDecimals?: boolean;
};

export function CylinderGraph({
    data,
    target,
    limitLow,
    limitHigh,
    display,
    locale,
    showDecimals = false,
}: CylinderGraphProps) {
    const { theme } = useContext(ThemeContext);
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const { layoutRef, layout } = useResponsivePaddedGraphLayout({
        paddingLeft: 35,
        paddingTop: 35,
        paddingBottom: 35,
    });

    const range = Math.max(1, data.domain.max - data.domain.min);
    const progress = (data.value - data.domain.min) / range;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    const targetProgress =
        target !== undefined ? (target - data.domain.min) / range : undefined;
    const clampedTargetProgress =
        targetProgress !== undefined
            ? Math.min(1, Math.max(0, targetProgress))
            : undefined;

    const { colors } = useLimitTheme({
        value: data.value,
        limits: { limitHigh, limitLow },
    });

    const displayColors = customColorOverride(display?.color, colors);

    const preferredBarWidth = Math.min(layout.width * 0.55, 64);
    const barWidth = Math.max(Math.min(layout.width, preferredBarWidth), 24);

    const barX = layout.left;
    const barY = layout.top;
    const barHeight = layout.height;
    const barRadius = Math.min(barWidth * 0.5, 10);
    const labelOffset = Math.min(Math.max(layout.width * 0.06, 8), 16);
    const baseFontSize = Math.max(
        10,
        Math.min(layout.width, layout.height) * 0.11
    );
    const labelFontSize = baseFontSize * 0.55;

    const fillHeight = barHeight * clampedProgress;
    const fillY = barY + barHeight - fillHeight;

    const targetY =
        clampedTargetProgress !== undefined
            ? barY + barHeight - barHeight * clampedTargetProgress
            : undefined;
    const labelXRight = barX + barWidth + labelOffset;
    const hideValueLabel =
        target !== undefined && Math.abs(target - data.value) / range <= 0.05;
    const labelMaxY = barY + barHeight - labelFontSize * 0.4;
    const labelMinY = barY + labelFontSize * 0.9;
    const valueLabelY = Math.min(
        labelMaxY,
        Math.max(labelMinY, fillY + labelFontSize * 0)
    );
    const targetLabelY =
        targetY !== undefined
            ? Math.min(
                  labelMaxY,
                  Math.max(labelMinY, targetY + labelFontSize * 0) // position of target label
              )
            : undefined;
    const valueLabel =
        `${GraphUtil.prettyFixed(data.value, locale, showDecimals)} ${data.domain.unit ?? data.domain.name ?? ''}`.trim();
    const targetLabel =
        target !== undefined
            ? `${GraphUtil.prettyFixed(target, locale, showDecimals)} ${data.domain.unit ?? data.domain.name ?? ''}`.trim()
            : undefined;

    function handleBarHover() {
        const prettyValue = `${GraphUtil.prettyFixed(
            data.value,
            locale,
            showDecimals
        )} ${data.domain.unit ?? data.domain.name ?? ''}`;
        tooltip?.showRelative(barX + barWidth / 2, fillY, [
            {
                key: 'cylinder',
                content: (
                    <GraphLegend
                        color={displayColors.fill}
                        value={prettyValue}
                    />
                ),
            },
        ]);
    }

    function handleBarLeave() {
        tooltip?.hideAll();
    }

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            onTooltipContextChanged={setTooltipContext}
        >
            <rect
                width={layout.width}
                height={layout.height}
                fill="transparent"
                onMouseLeave={handleBarLeave}
            />
            <Group>
                <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx={barRadius}
                    ry={barRadius}
                    fill={theme.colors.background.secondary}
                />
                <rect
                    x={barX}
                    y={fillY}
                    width={barWidth}
                    height={fillHeight}
                    rx={barRadius}
                    ry={barRadius}
                    fill={displayColors.fill}
                    stroke={displayColors.stroke}
                    strokeWidth={1}
                    onMouseMove={handleBarHover}
                    onMouseLeave={handleBarLeave}
                />
                {targetY !== undefined && (
                    <Line
                        from={{ x: barX - 4, y: targetY }}
                        to={{ x: barX + barWidth + 4, y: targetY }}
                        stroke={theme.colors.text.primary}
                        strokeWidth={2}
                        pointerEvents="none"
                        shapeRendering="crisp-edges"
                        strokeLinecap="round"
                    />
                )}
                {!hideValueLabel && (
                    <Text
                        x={labelXRight}
                        y={valueLabelY}
                        fill={theme.colors.text.primary}
                        fontSize={labelFontSize}
                        fontWeight="bold"
                        verticalAnchor="middle"
                    >
                        {valueLabel}
                    </Text>
                )}
                {targetLabelY !== undefined && targetLabel && (
                    <Text
                        x={labelXRight}
                        y={targetLabelY}
                        fill={theme.colors.text.secondary}
                        fontSize={labelFontSize}
                        fontWeight="bold"
                        textAnchor="start"
                        verticalAnchor="middle"
                    >
                        {targetLabel}
                    </Text>
                )}
            </Group>
        </Graph>
    );
}
