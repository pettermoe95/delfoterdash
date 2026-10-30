import { Group } from '@visx/group';
import { BarRounded, BarStack, BarStackHorizontal } from '@visx/shape';
import type {
    BarStack as BarStackItem,
    BaseBarStackProps,
} from '@visx/shape/lib/types';
import { useContext, useMemo } from 'react';
import { GraphTooltipContext } from '../../../Common/Tooltip/GraphTooltip';
import { getLegendSvgColor, gradientColors } from '../../../Theme';
import type { BarDisplayProps } from './BarDisplay';

type StackDatum = {
    x: number;
} & Record<number, number>;

/**
 * Handles display of Bar-type data in an Axis Graph.
 * Multiple series are automatically stacked.
 */
export function BarStackDisplay({
    xScale,
    yScale,
    domainX,
    data,
    flipAxis = false,
}: BarDisplayProps) {
    const visibleData = data.filter((data) => !data.hidden);
    const tooltip = useContext(GraphTooltipContext);

    /* Group Series2D data by x domain value */
    const stackData: StackDatum[] = useMemo(() => {
        if (data.length === 0 || domainX.values.length === 0) {
            return [];
        }

        const seriesYByDomain = data.map((seriesItem) => {
            const valuesByDomainX = new Map<number, number>();
            seriesItem.series.values.forEach(({ x, y }) => {
                valuesByDomainX.set(x, y);
            });

            return {
                index: seriesItem.index,
                valuesByDomainX,
            };
        });

        return domainX.values.map((domainValue) => {
            const entry: StackDatum = { x: domainValue };

            seriesYByDomain.forEach(({ index, valuesByDomainX }) => {
                entry[index] = valuesByDomainX.get(domainValue) ?? 0;
            });

            return entry;
        });
    }, [domainX.values, data]);

    const commonBarStackProps: BaseBarStackProps<StackDatum, number> = {
        data: stackData,
        keys: visibleData.map((d) => d.index),
        color: (key) => {
            const series = visibleData.find((d) => d.index === key);

            // TODO - check if this makes sense
            if (series) {
                return getLegendSvgColor(series, gradientColors);
            } else {
                throw new Error(`No series found for key: ${key}`);
            }
        },
        xScale: flipAxis ? yScale : xScale,
        yScale: flipAxis ? xScale : yScale,
        offset: 'diverging',
    };

    const getX = (datum: StackDatum) => datum.x;

    if (flipAxis) {
        return (
            <Group>
                <BarStackHorizontal {...commonBarStackProps} y={getX}>
                    {(barStacks) =>
                        renderStacks(barStacks, tooltip.domainValue, flipAxis)
                    }
                </BarStackHorizontal>
            </Group>
        );
    }

    return (
        <Group>
            <BarStack {...commonBarStackProps} x={getX}>
                {(barStacks) =>
                    renderStacks(barStacks, tooltip.domainValue, flipAxis)
                }
            </BarStack>
        </Group>
    );
}

function renderStacks(
    barStacks: BarStackItem<StackDatum, number>[],
    hoverDomainValue: number | undefined,
    flipAxis: boolean
) {
    return barStacks.map((stack, stackIndex) => {
        return stack.bars.map((bar) => {
            const barY = flipAxis ? -(bar.y + bar.height) : bar.y;
            const hoverOthers =
                hoverDomainValue !== undefined &&
                hoverDomainValue !== bar.bar.data.x;
            const top = stackIndex == barStacks.length - 1;
            return (
                <BarRounded
                    key={`bar-stack-${stack.index}-${bar.index}`}
                    x={bar.x}
                    y={barY}
                    height={Math.abs(bar.height)}
                    width={Math.abs(bar.width)}
                    radius={4}
                    fill={bar.color}
                    top={!flipAxis && top}
                    right={flipAxis && top}
                    opacity={hoverOthers ? 0.5 : 1}
                    filter={hoverOthers ? 'grayscale(100%)' : ''}
                />
            );
        });
    });
}
