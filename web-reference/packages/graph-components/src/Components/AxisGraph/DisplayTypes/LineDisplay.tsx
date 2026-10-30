import { curveCatmullRom, curveLinear, curveStep } from '@visx/curve';
import { Group } from '@visx/group';
import type { AnyD3Scale } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
import type { AnyScaleBand } from '@visx/shape/lib/types';
import { useContext } from 'react';
import type { AxisGraphLayout } from '../../../Common/layout.js';
import { GraphTooltipContext } from '../../../Common/Tooltip/GraphTooltip.js';
import type { DiscreteDimension, Scalar2D } from '../../../Common/types.js';
import { GraphUtil } from '../../../Common/utils.js';
import { getLegendColor } from '../../../Theme';
import type {
    LineCurveType,
    LineSeriesConfig,
    SeriesWithDisplayConfig,
} from '../types.js';

type LineDisplayProps = {
    xScale: AnyScaleBand;
    yScale: AnyD3Scale;
    layout: AxisGraphLayout;
    domainX: DiscreteDimension;
    flipAxis: boolean;
    data: SeriesWithDisplayConfig<LineSeriesConfig>[];
};

function getCurveFactory(type: LineCurveType) {
    switch (type) {
        case 'linear':
            return curveLinear;
        case 'step':
            return curveStep;
        case 'catmullRom':
            return curveCatmullRom;
    }
}

/**
 * Handles display of line-type data in an Axis Graph.
 */
export function LineDisplay({
    xScale,
    yScale,
    data,
    flipAxis,
}: LineDisplayProps) {
    const tooltip = useContext(GraphTooltipContext);

    function getX(value: Scalar2D) {
        if (flipAxis) {
            return Number(yScale(value.y ?? 0));
        }
        const origin = xScale.bandwidth() / 2;
        return origin + (xScale(value.x) ?? 0);
    }

    function getY(value: Scalar2D) {
        if (flipAxis) {
            const origin = -xScale.bandwidth() / 2;
            return origin - (xScale(value.x) ?? 0);
        }
        return Number(yScale(value.y ?? 0));
    }

    function createTooltip(series: SeriesWithDisplayConfig<LineSeriesConfig>) {
        if (tooltip.domainValue !== undefined) {
            const fill = getLegendColor({
                relativeIndex:
                    series.display.legendIndex ?? series.relativeIndex,
                displayType: series.display.displayType,
                color: series.display.color,
            });
            const value = GraphUtil.getSeries2DValueByX(
                series.series,
                tooltip.domainValue,
                true
            );
            if (value !== undefined) {
                // TODO may need to transform this to use curve factory Y position
                // if its not guaranteed to pass through point
                const x = getX(value);
                const y = getY(value);
                return (
                    <Circle
                        cx={x}
                        cy={y}
                        r={4}
                        fill="white"
                        strokeWidth={3}
                        stroke={fill}
                        pointerEvents="none"
                        key={`tooltip_hint_${series.index}`}
                    />
                );
            }
        }
        return <></>;
    }

    function createSeries(series: SeriesWithDisplayConfig<LineSeriesConfig>) {
        if (series.hidden) return <></>;
        const fill = getLegendColor({
            relativeIndex: series.display.legendIndex ?? series.relativeIndex,
            displayType: 'line', //series.display.displayType,
            color: series.display.color,
        });

        return (
            <Group key={series.index}>
                <LinePath<Scalar2D>
                    key={`line_${series.index}`}
                    data={series.series.values}
                    x={getX}
                    y={getY}
                    stroke={fill}
                    strokeWidth={3}
                    strokeOpacity={1}
                    shapeRendering="geometricPrecision"
                    curve={getCurveFactory(
                        series.display.curveType ?? 'linear'
                    )}
                    pointerEvents="none"
                    z={1}
                />
                {tooltip.visible && createTooltip(series)}
            </Group>
        );
    }
    return (
        <>
            <Group>{data.map((series) => createSeries(series))}</Group>
        </>
    );
}
