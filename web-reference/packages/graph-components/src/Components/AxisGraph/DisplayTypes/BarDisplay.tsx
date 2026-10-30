import { Group } from '@visx/group';
import type { AnyD3Scale } from '@visx/scale';
import { scaleBand } from '@visx/scale';
import { BarRounded } from '@visx/shape';
import type { AnyScaleBand } from '@visx/shape/lib/types';
import { useContext } from 'react';
import type { AxisGraphLayout } from '../../..';
import { GraphTooltipContext } from '../../../Common/Tooltip/GraphTooltip';
import type { DiscreteDimension, Scalar2D } from '../../../Common/types';
import { getLegendSvgColor, gradientColors } from '../../../Theme';
import type { BarSeriesConfig, SeriesWithDisplayConfig } from '../types';

export type BarDisplayProps = {
    xScale: AnyScaleBand;
    yScale: AnyD3Scale;
    layout: AxisGraphLayout;
    domainX: DiscreteDimension;
    flipAxis?: boolean;
    data: SeriesWithDisplayConfig<BarSeriesConfig>[];
};

/**
 * Handles display of Bar-type data in an Axis Graph.
 * Multiple series are automatically grouped.
 */
export function BarDisplay({
    xScale,
    yScale,
    domainX,
    data,
    flipAxis = false,
}: BarDisplayProps) {
    const animateIn = 1; //useTween('elastic', 400);
    const visibleData = data.filter((data) => !data.hidden);
    const tooltip = useContext(GraphTooltipContext);

    // Bar group scale
    const xScaleGroup = scaleBand<number>({
        range: [0, xScale.bandwidth()],
        domain: visibleData.map((_, i) => i),
        round: true,
        padding: 0,
    });

    function makeBar(
        key: string,
        color: string,
        positionX: number,
        barWidth: number,
        value: Scalar2D
    ) {
        const zeroY = Number(yScale(0));
        const valueY = Number(yScale(value.y));
        const barHeight = Math.abs(valueY - zeroY) * animateIn;
        let posY = value.y > 0 ? zeroY - barHeight : zeroY;
        let posX = positionX;
        if (flipAxis) {
            posY = (value.y > 0 ? zeroY + barHeight : zeroY) * -1;
            posX = -xScaleGroup.bandwidth() - positionX;
        }
        const hoverOthers =
            tooltip.domainValue !== undefined &&
            tooltip.domainValue !== value.x;
        const borderRadiusProps =
            value.y < 0
                ? { bottom: true, top: false }
                : { bottom: false, top: true };

        return (
            <Group transform={flipAxis ? 'rotate(90)' : ''} key={key}>
                <BarRounded
                    x={posX}
                    y={posY}
                    width={barWidth}
                    height={barHeight}
                    radius={Math.min(8, barWidth / 5)}
                    fill={color}
                    opacity={hoverOthers ? 0.5 : 1}
                    filter={hoverOthers ? 'grayscale(100%)' : ''}
                    //style={{ transition: '.2s' }}
                    {...borderRadiusProps}
                    pointerEvents="none"
                />
            </Group>
        );
    }

    function makeBarGroup(x: number, idx: number) {
        const groupX = xScale(x) ?? 0;
        const barW = xScaleGroup.bandwidth();
        return (
            <Group key={idx}>
                {visibleData.map((series, seriesIndex) => {
                    const fill = getLegendSvgColor(series, gradientColors);
                    const value = series.series.values.find((v) => v.x == x);
                    const barX = xScaleGroup(seriesIndex) ?? 0;
                    const key = `bar-${x}-${series.index}`;
                    return (
                        value && makeBar(key, fill, groupX + barX, barW, value)
                    );
                })}
            </Group>
        );
    }

    return <>{domainX.values.map((x, idx) => makeBarGroup(x, idx))}</>;
}
