import { ThemeContext } from '@brilliant/components';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useContext, useId, useState } from 'react';
import { Graph } from '../../Common/Graph';
import { useResponsiveGraphLayout } from '../../Common/layout';
import { GraphLegend } from '../../Common/Legend/Legend';
import type { GraphTooltipContextType } from '../../Common/Tooltip/GraphTooltip';
import type {
    ContinuousDimension,
    GraphDataScalar1D,
} from '../../Common/types';
import { useLimitTheme } from '../../Theme';

type ProgressGraphProps = {
    data: GraphDataScalar1D<ContinuousDimension>;
    target?: number;
    limitLow?: number;
    limitHigh?: number;
    gradientColors?: [string, string]; // Optional override
    labels?: string[];
};

export function ProgressGraph({
    data,
    target,
    limitLow,
    limitHigh,
    gradientColors,
}: ProgressGraphProps) {
    const id = useId();

    const { theme } = useContext(ThemeContext);
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const { layoutRef, layout } = useResponsiveGraphLayout();

    // Value to show hint for on hover
    const [_hoverHint, setHoverHint] = useState<number | undefined>(undefined);

    //   const animateIn = useTween("inOutCirc", 500);

    const { colors } = useLimitTheme({
        value: data.value,
        limits: { limitHigh, limitLow },
    });
    const textOffset = 15;
    const barHeight = 20;
    const barOriginY = (layout.height - barHeight + textOffset * 1.75) / 2.0;
    const barRadius = barHeight * 0.25;
    const progress = (data.value - data.domain.min) / data.domain.max;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    const targetProgress =
        target && (target - data.domain.min) / data.domain.max;
    const clampedTargetProgress =
        targetProgress && Math.min(1, Math.max(0, targetProgress));

    function makeBar(props?: Record<string, unknown>) {
        return (
            <rect
                x={0}
                y={0}
                width={layout.width}
                height={barHeight}
                rx={barRadius}
                ry={barRadius}
                onMouseMove={handleBarHover}
                {...props}
            />
        );
    }

    /**
     * Handler for hover hint
     */
    function handleBarHover(_: React.MouseEvent<SVGPathElement>) {
        const prettyValue = `${data.value.toFixed(2)} ${data.domain.unit ?? data.domain.name}`;
        tooltip?.showRelative(
            layout.width * clampedProgress - barRadius / 3.0,
            barOriginY + textOffset - 5,
            [
                {
                    key: 'progress',
                    content: (
                        <GraphLegend
                            color={colors.stroke}
                            value={prettyValue}
                        />
                    ),
                },
            ]
        );
    }

    function handleBarLeave() {
        setHoverHint(undefined);
        tooltip?.hideAll();
    }

    const gradient =
        gradientColors !== undefined ? (
            <linearGradient id={`progress_gradient_${id}`}>
                <stop style={{ stopColor: gradientColors[0] }} offset="0%" />
                <stop style={{ stopColor: gradientColors[1] }} offset="100%" />
            </linearGradient>
        ) : (
            <></>
        );

    const barFill =
        gradientColors == undefined
            ? colors.fill
            : `url(#progress_gradient_${id})`;

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            onTooltipContextChanged={setTooltipContext}
        >
            {/* Mouse handling */}
            <rect
                width={layout.width}
                height={layout.height}
                fill="transparent"
                onMouseLeave={handleBarLeave}
            />

            {/* Override color (gradient) */}
            {gradient}

            {/* Progress meter */}
            <Group top={barOriginY} left={layout.left}>
                {/* Main progress bar */}
                {makeBar({
                    fill: theme.colors.background.secondary,
                })}
                {makeBar({
                    fill: barFill,
                    width: layout.width * clampedProgress,
                })}

                {/* Labels */}
                <Group top={-textOffset}>
                    <Text
                        fill={theme.colors.text.primary}
                        fontWeight="bold"
                        fontSize={18}
                    >
                        {(progress * 100).toFixed(0) + '%'}
                    </Text>
                    {layout.width > 150 && (
                        <Text
                            fill={theme.colors.text.primary}
                            x={50}
                            fontSize={14}
                            clipPath={`url(#fade-text-clip-${id})`}
                        >
                            {data.domain.name}
                        </Text>
                    )}
                </Group>

                {/* Target indicator */}
                {clampedTargetProgress && (
                    <Group
                        transform={`translate(${clampedTargetProgress * layout.width}, 0)`}
                    >
                        <Line
                            from={{ x: 0, y: -barHeight * 0.2 }}
                            to={{ x: 0, y: barHeight * 1.2 }}
                            stroke={theme.colors.text.primary}
                            strokeWidth={2.5}
                            pointerEvents="none"
                            shapeRendering="crisp-edges"
                            strokeLinecap="round"
                        />
                    </Group>
                )}
            </Group>
        </Graph>
    );
}
