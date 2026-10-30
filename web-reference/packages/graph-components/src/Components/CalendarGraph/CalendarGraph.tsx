import { Row, ThemeContext } from '@brilliant/components';
import { Group } from '@visx/group';
import { scaleBand } from '@visx/scale';
import type { AnyScaleBand } from '@visx/shape/lib/types';
import { Text } from '@visx/text';
import * as datefns from 'date-fns';
import { useCallback, useContext, useMemo, useState } from 'react';
import { GraphUtil, useResponsivePaddedGraphLayout } from '../..';
import { Graph } from '../../Common/Graph';
import { GraphLegend } from '../../Common/Legend/Legend';
import type { GraphTooltipContextType } from '../../Common/Tooltip/GraphTooltip';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataVector2D,
    Scalar2D,
} from '../../Common/types';
import { useLimitTheme } from '../../Theme';

type CalendarGraphProps = {
    data: GraphDataVector2D<DiscreteDimension, ContinuousDimension>;
    limitLow?: number;
    limitHigh?: number;
    hideWeekend?: boolean;
};

export function CalendarGraph({
    data,
    limitLow,
    limitHigh,
    hideWeekend = false,
}: CalendarGraphProps) {
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const { layoutRef, layout } = useResponsivePaddedGraphLayout({
        padding: 10,
    });
    const { theme } = useContext(ThemeContext);

    // Layout dynamic
    const showWeekLabels = layout.height > 200 && layout.width > 220;
    const showDayLabels = layout.width > 220 && layout.height > 200;

    const dates = data.domainX.labels?.map((str) => new Date(str)) ?? [];
    const fromDate = dates[0] ?? datefns.startOfMonth(new Date());
    const toDate = datefns.endOfMonth(fromDate);
    const [weeks, allDays] = useMemo(() => {
        try {
            const weeks = datefns.eachWeekOfInterval(
                {
                    start: fromDate,
                    end: toDate,
                },
                { weekStartsOn: 1 }
            );
            const days = datefns.eachDayOfInterval({
                start: fromDate,
                end: toDate,
            });
            return [weeks, days];
        } catch {
            return [[], []];
        }
    }, [fromDate, toDate]);

    // Adjust sizing based on week/day ratio to ensure square tiles
    const nDays = hideWeekend ? 5 : 7;
    const dayStartX = showWeekLabels ? 25 : 0;
    const dayStartY = showDayLabels ? 10 : 0;
    const aspectSizeX = Math.min(
        layout.width - dayStartX,
        layout.height - dayStartY
    );
    const aspectSizeY = (aspectSizeX / nDays) * weeks.length;
    const originY = (layout.height - aspectSizeY + dayStartY) / 2.0 + dayStartY;
    const originX = (layout.width - aspectSizeX + dayStartX) / 2.0;
    const gridPadding = 0.1;

    // Week
    const weekScale = useMemo(() => {
        return scaleBand<number>({
            range: [originY, aspectSizeY + originY],
            round: false,
            domain: weeks.map((_, idx) => idx),
            padding: gridPadding,
        });
    }, [gridPadding, originY, aspectSizeY, weeks]);

    // Day
    const days = weeks[0]
        ? datefns
              .eachDayOfInterval({
                  start: datefns.startOfWeek(weeks[0], { weekStartsOn: 1 }),
                  end: datefns.endOfWeek(weeks[0], { weekStartsOn: 1 }),
              })
              .filter((day) => !hideWeekend || !datefns.isWeekend(day))
        : [];
    const dayScale = useMemo(() => {
        return scaleBand<number>({
            range: [originX, aspectSizeX + originX],
            round: false,
            domain: hideWeekend ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6],
            padding: gridPadding,
        });
    }, [originX, aspectSizeX, hideWeekend]);

    // Tooltip management
    const showTooltip = useCallback(
        (
            day: Date,
            color: string,
            value: Scalar2D | undefined,
            x: number,
            y: number
        ) => {
            const centerX = x + dayScale.bandwidth() / 2;
            tooltip?.showRelative(centerX, y + 5, [
                {
                    key: 'calendar-tip',
                    content: (
                        <>
                            <b>{datefns.format(day, 'd. MMM, Y')}</b>
                            <Row justify="center" width="100%">
                                <GraphLegend
                                    color={color}
                                    value={value?.y.toFixed(2)}
                                />
                            </Row>
                        </>
                    ),
                },
            ]);
        },
        [dayScale, tooltip]
    );

    // Render day box
    function makeDay(day: Date, dayIndex: number, y: number) {
        if (!datefns.isSameMonth(day, toDate)) {
            return;
        }
        const domainCandidate = allDays.find((domainDate) =>
            datefns.isSameDay(domainDate, day)
        );
        const domainIndex = domainCandidate
            ? allDays.indexOf(domainCandidate)
            : 0;
        const domain =
            domainIndex !== undefined
                ? data.domainX.values[domainIndex]
                : undefined;
        const domainValue =
            domain !== undefined
                ? GraphUtil.get2DValueByX(data.data, domain)
                : undefined; // TODO Memoize?
        return (
            <CalendarDay
                index={dayIndex}
                day={day}
                domainValue={domainValue}
                y={y}
                dayScale={dayScale}
                weekScale={weekScale}
                key={dayIndex}
                showTooltip={showTooltip}
                limitLow={limitLow}
                limitHigh={limitHigh}
            />
        );
    }

    // Render week column
    function makeWeek(week: Date, index: number) {
        const y = weekScale(index) ?? 0;
        const days = datefns
            .eachDayOfInterval({
                start: datefns.startOfWeek(week, { weekStartsOn: 1 }),
                end: datefns.endOfWeek(week, { weekStartsOn: 1 }),
            })
            .filter((day) => !hideWeekend || !datefns.isWeekend(day));
        return (
            <Group
                left={layout.left}
                top={y}
                onMouseLeave={() => tooltip?.hideAll()}
                key={`weeks_${index}`}
            >
                {days.map((day, dayIndex) => makeDay(day, dayIndex, y))}
            </Group>
        );
    }

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            onTooltipContextChanged={setTooltipContext}
        >
            <Group>
                {/* Main Grid */}
                {weeks.map((week, index) => makeWeek(week, index))}

                {/* Week labels */}
                {showWeekLabels &&
                    weeks.map((week, index) => {
                        return (
                            <Text
                                key={`week_${index}`}
                                x={originX - 10}
                                y={
                                    (weekScale(index) ?? 0) +
                                    weekScale.bandwidth() / 2
                                }
                                fill={theme.colors.text.primary}
                                textAnchor="end"
                                verticalAnchor="middle"
                                fontSize={14}
                            >
                                {datefns.getISOWeek(week)}
                            </Text>
                        );
                    })}

                {/* Day labels */}
                {showDayLabels &&
                    days.map((day, index) => {
                        return (
                            <Text
                                key={`day_${index}`}
                                x={
                                    layout.left +
                                    (dayScale(index) ?? 0) +
                                    dayScale.bandwidth() / 2
                                }
                                y={layout.top + originY - 10}
                                fill={theme.colors.text.primary}
                                textAnchor="middle"
                                scaleToFit="shrink-only"
                                fontSize={14}
                            >
                                {datefns.format(day, 'ccc', {
                                    weekStartsOn: 1,
                                })}
                            </Text>
                        );
                    })}
            </Group>
        </Graph>
    );
}

// ===================================== //
//            Single Day Card            //
// ===================================== //

type CalendarDayProps = {
    index: number;
    y: number;
    day: Date;
    dayScale: AnyScaleBand;
    weekScale: AnyScaleBand;
    domainValue?: Scalar2D;
    limitLow?: number;
    limitHigh?: number;
    showTooltip: (
        day: Date,
        color: string,
        value: Scalar2D | undefined,
        x: number,
        y: number
    ) => void;
};

function CalendarDay({
    index,
    y,
    day,
    dayScale,
    weekScale,
    limitLow,
    limitHigh,
    domainValue,
    showTooltip,
}: CalendarDayProps) {
    const [hover, setHover] = useState(false);
    const { theme } = useContext(ThemeContext);
    const x = dayScale(index) ?? 0;
    const fontSize = Math.min(18, dayScale.bandwidth() * 0.35);
    const showDateLabel = false; //dayScale.bandwidth() > 50;
    const showValueLabel = dayScale.bandwidth() > 30;
    const rx = Math.min(6, dayScale.bandwidth() * 0.1);

    const { colors } = useLimitTheme({
        value: domainValue?.y ?? undefined,
        limits: { limitHigh, limitLow },
    });

    return (
        <Group
            left={x}
            onMouseEnter={() =>
                showTooltip(day, colors.fill, domainValue, x, y)
            }
            key={index}
        >
            {/* Square */}
            <rect
                rx={rx}
                width={dayScale.bandwidth()}
                height={weekScale.bandwidth()}
                fill={colors.fill}
                stroke={hover ? colors.stroke : 'none'}
                strokeWidth={4}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            />

            {/* Value label TODO need a text color for limit theme */}
            {showValueLabel && (
                <Text
                    fill="black"
                    y={weekScale.bandwidth() / 2}
                    x={dayScale.bandwidth() / 2}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    pointerEvents="none"
                    fontSize={fontSize}
                    fontWeight="bold"
                    scaleToFit="shrink-only"
                >
                    {domainValue !== undefined
                        ? GraphUtil.prettyValue(domainValue.y, 1)
                        : ''}
                </Text>
            )}

            {/* Date label */}
            {showDateLabel && (
                <Group left={dayScale.bandwidth() - 22} top={2}>
                    <Text
                        fill={theme.colors.text.secondary}
                        x={10}
                        y={10}
                        textAnchor="middle"
                        verticalAnchor="middle"
                        pointerEvents="none"
                        fontWeight="bold"
                        fontSize={13}
                    >
                        {day.getDate()}
                    </Text>
                </Group>
            )}
        </Group>
    );
}
