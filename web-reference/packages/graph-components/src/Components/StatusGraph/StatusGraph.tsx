import { brilliantViewIcons, Icon } from '@brilliant/bds-core';
import type { GraphColorVariation } from '@brilliant/components';
import { ThemeContext } from '@brilliant/components';
import { curveCatmullRom } from '@visx/curve';
import { Group } from '@visx/group';
import { scalePoint } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';
import { Text } from '@visx/text';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Graph } from '../../Common/Graph';
import type { AxisGraphLayout } from '../../Common/layout';
import { useResponsiveAxisGraphLayout } from '../../Common/layout';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataScalar1D,
    GraphDataVector2D,
    Scalar2D,
} from '../../Common/types';
import { GraphUtil } from '../../Common/utils';
import { useLimitTheme } from '../../Theme';
import type { GraphLimits } from '../../Theme/types';
import { getChangeColor } from '../../Utility/graphColors';
import type { StatusGraphType } from './utils';
import { getStatusGraphText } from './utils';

type StatusGraphProps = {
    current: GraphDataScalar1D<ContinuousDimension>;
    history?: GraphDataVector2D<DiscreteDimension, ContinuousDimension>;
    hideGraph?: boolean;
    limits?: GraphLimits;
    targetChange?: {
        percentageChange?: number;
        measurement?: string;
        type?: StatusGraphType;
    };
};

export function StatusGraph({
    current,
    history,
    limits,
    targetChange,
}: StatusGraphProps) {
    const { layoutRef, layout } = useResponsiveAxisGraphLayout({
        padding: 0,
    });

    const { colors: limitTheme } = useLimitTheme({
        value: current.value,
        limits,
    });
    const comparison = targetChange !== undefined; // should graph compare or show status with history
    const showHistory = !comparison && history && history.data.length > 0;

    return (
        <Graph layoutRef={layoutRef} layout={layout}>
            {showHistory ? (
                <AreaGraph data={history} layout={layout} theme={limitTheme} />
            ) : (
                <g></g>
            )}
            <StatusDisplay
                scalar={current}
                layout={layout}
                showHistory={showHistory}
                targetChange={targetChange}
                xDomainUnit={history?.domainX.unit}
            />
        </Graph>
    );
}

type AreaGraphProps = {
    data: GraphDataVector2D<DiscreteDimension, ContinuousDimension>;
    layout: AxisGraphLayout;
    theme: GraphColorVariation;
};

function AreaGraph({ data, layout, theme }: AreaGraphProps) {
    const xScale = useMemo(() => {
        return scalePoint<number>({
            range: [0, layout.width],
            domain: data.domainX.values,
        });
    }, [data, layout.width]);

    const yScale = useMemo(() => {
        return GraphUtil.dimensionToD3Scale(
            data.domainY,
            layout.height * 0.6,
            0
        );
    }, [data, layout.height]);

    function getX(value: Scalar2D) {
        const origin = xScale.bandwidth() / 2;
        return origin + (xScale(value.x) ?? 0);
    }

    function getY(value: Scalar2D) {
        return Number(yScale(value.y ?? 0));
    }

    return (
        <Group top={layout.top + layout.height * 0.4} left={layout.left}>
            <LinePath<Scalar2D>
                data={data.data}
                x={getX}
                y={getY}
                stroke={theme.stroke}
                strokeWidth={2}
                shapeRendering="geometricPrecision"
                curve={curveCatmullRom}
                pointerEvents="none"
                opacity={0.25}
            />
            <AreaClosed<Scalar2D>
                data={data.data}
                x={getX}
                y={getY}
                yScale={yScale}
                fill={theme.fill}
                shapeRendering="geometricPrecision"
                curve={curveCatmullRom}
                pointerEvents="none"
                opacity={0.25}
            />
        </Group>
    );
}
type StatusDisplayProps = {
    scalar: GraphDataScalar1D<ContinuousDimension>;
    layout: AxisGraphLayout;
    showHistory?: boolean;
    targetChange?: {
        percentageChange?: number;
        measurement?: string;
        type?: StatusGraphType;
    };
    xDomainUnit?: string;
};

function StatusDisplay({
    scalar,
    layout,
    targetChange,
    xDomainUnit,
}: StatusDisplayProps) {
    const baseYCoordinate = layout.height / 2;
    const baseYOffset = 16;
    const { theme } = useContext(ThemeContext);

    const [textWidth, setTextWidth] = useState(0);
    const percentTextRef = useRef<SVGTextElement>(null);

    const baseX = 32;
    const baseY = baseYCoordinate - baseYOffset;

    const displayValue = parseFloat(
        [Math.floor(scalar.value * 100) / 100, scalar.domain.unit]
            .filter(Boolean)
            .join(' ')
    );

    const percentageColor = getChangeColor(
        targetChange?.percentageChange,
        targetChange?.type
    );
    const arrowIcon =
        targetChange?.percentageChange && targetChange.percentageChange >= 0
            ? brilliantViewIcons['arrow-up']
            : brilliantViewIcons['arrow-down'];

    const measurement = targetChange?.measurement
        ? targetChange.measurement
        : '';

    const formattedDisplayValue =
        displayValue >= 100000
            ? `${GraphUtil.prettyValue(displayValue)} ${measurement}`
            : `${GraphUtil.truncedPrettyFixed(displayValue)} ${measurement}`;

    const percentageText = targetChange?.percentageChange
        ? `${GraphUtil.prettyValue(Math.abs(targetChange.percentageChange), 1)}%`
        : '';

    const compareText =
        targetChange && targetChange.percentageChange != 0
            ? getStatusGraphText(targetChange.type ?? '', xDomainUnit)
            : scalar.domain.name;

    useEffect(() => {
        if (percentTextRef.current) {
            const bbox = percentTextRef.current.getBBox();
            setTextWidth(bbox.width);
        }
    }, [percentageText]);

    const showPercentAndText = targetChange?.type === 'targetvalue';

    return (
        <Group top={layout.top} left={layout.left}>
            <Text
                x={baseX}
                y={baseY}
                textAnchor="start"
                verticalAnchor="middle"
                fill={theme.colors.text.primary}
                fontSize={36}
                scaleToFit="shrink-only"
                fontWeight={600}
            >
                {formattedDisplayValue}
            </Text>
            {targetChange && percentageText && !showPercentAndText && (
                <Icon
                    icon={arrowIcon}
                    fontWeight={500}
                    color={percentageColor}
                    height={10}
                    width={10}
                    x={baseX}
                    y={baseYCoordinate + baseYOffset + 5 / 2}
                    style={{
                        overflow: 'visible',
                    }}
                />
            )}
            <Text
                innerTextRef={percentTextRef}
                x={showPercentAndText ? baseX : baseX + 15}
                y={baseYCoordinate + baseYOffset + 10}
                textAnchor="start"
                verticalAnchor="middle"
                fill={percentageColor}
                fontSize={18}
                fontWeight={500}
            >
                {percentageText}
            </Text>
            <Text
                x={
                    targetChange && percentageText
                        ? showPercentAndText
                            ? textWidth + baseX + 5
                            : textWidth + baseX + 20
                        : baseX
                }
                y={baseYCoordinate + baseYOffset + 10}
                textAnchor="start"
                verticalAnchor="middle"
                fill={theme.colors.text.primary}
                fontSize={18}
                fontWeight={500}
            >
                {compareText}
            </Text>
        </Group>
    );
}
