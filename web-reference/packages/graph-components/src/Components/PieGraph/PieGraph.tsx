import {
    getThemeSpacing,
    ThemeContext,
    useIsMobile,
} from '@brilliant/components';
import type { LocalizeFn } from '@bv/i18n-utils';
import { localizeUnit } from '@bv/i18n-utils';
import { Group } from '@visx/group';
import { Arc, Pie } from '@visx/shape';
import type { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import type { MouseEvent } from 'react';
import { useCallback, useContext, useId, useMemo, useState } from 'react';
import { Graph } from '../../Common/Graph';
import { useResponsivePaddedGraphLayout } from '../../Common/layout';
import { GraphLegend, useGraphLegends } from '../../Common/Legend/Legend';
import type { GraphTooltipContextType } from '../../Common/Tooltip/GraphTooltip';
import type {
    DiscreteDimension,
    GraphDataScalar1D,
    GraphDataVector1D,
} from '../../Common/types';
import { GraphUtil } from '../../Common/utils';
import { getLegendColorByIndex } from '../../Theme';

const MOBILE_PIE_CONTENT_MIN_HEIGHT = 250;
const MOBILE_PIE_LEGEND_MAX_HEIGHT = 100;
const MOBILE_PIE_TOTAL_MIN_HEIGHT =
    MOBILE_PIE_CONTENT_MIN_HEIGHT + MOBILE_PIE_LEGEND_MAX_HEIGHT;

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };
const MAX_SLICES = 10;
const OTHERS_PERCENT = 0.05;

type PieGraphDisplay = { colors?: string[] };

export type PieGraphProps = {
    data: GraphDataVector1D<DiscreteDimension>;
    margin?: typeof defaultMargin;
    display?: PieGraphDisplay;
    showLabels?: boolean;
    type: 'pie' | 'donut';
    showLegends?: boolean;
    metric?: GraphDataScalar1D<DiscreteDimension>;
    localize?: LocalizeFn;
    locale?: string;
    showDecimals?: boolean;
};

type PieDatum = {
    label: string;
    value: number;
    unit: string;
    sortValue?: string | number;
    rawIndex: number;
    children?: PieDatum[];
    colorOverride?: string;
    colorIndex?: number;
};

const isNumeric = (value: unknown): value is number | string =>
    value !== null && value !== undefined && !Number.isNaN(Number(value));

const normalizeLabel = (raw: unknown): string => {
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'number' || typeof raw === 'boolean') {
        return String(raw);
    }
    return '';
};

export function PieGraph({
    data,
    metric,
    margin: marginProp = defaultMargin,
    display = {},
    showLabels,
    showLegends = false,
    type = 'pie',
    localize,
    locale,
    showDecimals = false,
}: PieGraphProps) {
    const isMobile = useIsMobile();
    const mergedMargin = useMemo(() => {
        return {
            ...defaultMargin,
            ...marginProp,
        };
    }, [marginProp]);
    const chartMargin = useMemo(() => {
        if (!isMobile) return mergedMargin;
        return {
            ...mergedMargin,
            top: Math.min(mergedMargin.top, 8),
        };
    }, [isMobile, mergedMargin]);
    const minGraphHeight = isMobile
        ? showLegends
            ? MOBILE_PIE_TOTAL_MIN_HEIGHT
            : MOBILE_PIE_CONTENT_MIN_HEIGHT
        : undefined;
    const { layoutRef, layout } = useResponsivePaddedGraphLayout({
        minHeight: minGraphHeight,
    });
    const [tooltip, setTooltipContext] = useState<GraphTooltipContextType>();
    const { theme } = useContext(ThemeContext);
    const id = useId();

    const chartData = useChartData(data);
    const processedData = useMemo<PieDatum[]>(() => {
        if (chartData.length <= 1) return chartData;

        const allNumeric = chartData.every((d) => isNumeric(d.sortValue));
        if (allNumeric) {
            return chartData
                .slice()
                .sort((a, b) => Number(a.sortValue) - Number(b.sortValue))
                .map((d, i) => ({ ...d, colorIndex: i }));
        }

        const sortedByValue = chartData
            .slice()
            .sort((a, b) => b.value - a.value);

        const topEntries = sortedByValue.slice(0, MAX_SLICES);
        const otherEntries = sortedByValue.slice(MAX_SLICES);

        if (!otherEntries.length) {
            return topEntries.map((d, i) => ({ ...d, colorIndex: i }));
        }

        const totalTop = topEntries.reduce((s, d) => s + d.value, 0);
        const totalRest = otherEntries.reduce((s, d) => s + d.value, 0);
        const total = totalTop + totalRest;
        if (total <= 0) return topEntries;

        const desiredOthersValue = total * OTHERS_PERCENT;

        const scaledTop = topEntries.map((d, i) => ({
            ...d,
            value: d.value,
            colorIndex: i,
        }));

        const othersDatum: PieDatum = {
            label: 'Other',
            value: desiredOthersValue,
            unit: scaledTop[0]?.unit ?? data.domain?.unit ?? '',
            children: otherEntries.map((d, i) => ({
                ...d,
                colorIndex: scaledTop.length + i,
            })),
            rawIndex: Number.MAX_SAFE_INTEGER,
            colorIndex: scaledTop.length,
        };

        return [...scaledTop, othersDatum];
    }, [chartData, data.domain?.unit]);

    const getPieColor = useCallback(
        (datum: PieDatum, fallback: number, customColors: string[] = []) => {
            if (datum.colorOverride) return datum.colorOverride;

            const colorIndex = datum.colorIndex ?? fallback;
            const colors = customColors ?? [];

            if (colors[colorIndex]) return colors[colorIndex];

            return (
                getLegendColorByIndex({
                    relativeIndex: colorIndex,
                    displayType: 'default',
                    color: colors[colorIndex],
                }) ||
                getLegendColorByIndex({
                    relativeIndex: 0,
                    displayType: 'default',
                })
            );
        },
        []
    );
    const legendSeries = useMemo(
        () =>
            processedData.map((item, idx) => ({
                name: localizeUnit(item.label, localize),
                relativeIndex: idx,
                color: getPieColor(item, idx, display.colors),
                values: [item.value],
                tooltip: item.children
                    ?.map(
                        (child) =>
                            `${child.label}: ${GraphUtil.prettyFixed(
                                child.value,
                                locale,
                                showDecimals
                            )} ${child.unit}`
                    )
                    .join('\n'),
            })),
        [
            processedData,
            display.colors,
            getPieColor,
            localize,
            locale,
            showDecimals,
        ]
    );

    const [hidden, Legends] = useGraphLegends({ series: legendSeries });
    const visibleData = useMemo(
        () => processedData.filter((_, i) => !hidden.includes(i)),
        [processedData, hidden]
    );

    // --- Geometry ---
    const innerWidth = layout.width - chartMargin.left - chartMargin.right;
    const innerHeight = layout.height - chartMargin.top - chartMargin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const donutThickness = radius * 0.25;
    const innerRadius = type === 'donut' ? radius - donutThickness : 0;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    // --- Tooltip ---
    const showTooltip = useCallback(
        (
            index: number,
            datum: PieDatum,
            color: string,
            x: number,
            y: number
        ) => {
            tooltip?.hideAll();
            tooltip?.setDomainValue(index);

            const hasChildren = datum.children?.length;
            const viewportWidth =
                typeof window !== 'undefined' ? window.innerWidth : 1200;
            const viewportHeight =
                typeof window !== 'undefined' ? window.innerHeight : 800;
            const padding = 32;
            const maxWidth = Math.min(
                1200,
                Math.max(400, viewportWidth - padding)
            );
            const maxHeight = Math.min(
                600,
                Math.max(400, viewportHeight - padding)
            );
            const content = hasChildren ? (
                <div
                    className="flex max-h-full w-full flex-col"
                    style={{
                        gap: getThemeSpacing('s'),
                        minWidth: '320px',
                        width: 'fit-content',
                        maxWidth: `${maxWidth}px`,
                        maxHeight: `${maxHeight}px`,
                        overflow: 'auto',
                    }}
                >
                    <b
                        style={{
                            textAlign: 'center',
                            marginBottom: getThemeSpacing('s'),
                        }}
                    >
                        {datum.label}
                    </b>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemeSpacing('xs'),
                            overflowX: 'hidden',
                        }}
                    >
                        {datum.children!.map((child) => (
                            <GraphLegend
                                key={`${child.rawIndex}-${child.label}`}
                                name={child.label}
                                value={
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        {GraphUtil.prettyFixed(
                                            child.value,
                                            locale,
                                            showDecimals
                                        )}{' '}
                                        {child.unit}
                                    </span>
                                }
                                color={getLegendColorByIndex({
                                    relativeIndex:
                                        child.colorIndex ?? child.rawIndex,
                                    displayType: 'default',
                                    color: display.colors?.[
                                        child.colorIndex ?? child.rawIndex
                                    ],
                                })}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <b
                        style={{
                            textAlign: 'center',
                            marginBottom: getThemeSpacing('s'),
                        }}
                    >
                        {localizeUnit(datum.label, localize)}
                    </b>
                    <GraphLegend
                        value={`${GraphUtil.prettyFixed(
                            datum.value,
                            locale,
                            showDecimals
                        )} ${localizeUnit(datum.unit, localize)}`}
                        color={color}
                    />
                </>
            );

            tooltip?.showRelative(
                centerX + x + chartMargin.left,
                centerY + y + chartMargin.top,
                [{ key: `pie-tooltip-${id}`, content }]
            );
        },
        [
            tooltip,
            centerX,
            centerY,
            chartMargin.left,
            chartMargin.top,
            id,
            display.colors,
            localize,
            locale,
            showDecimals,
        ]
    );

    const displayMetric = metric && type === 'donut';

    const legendHeader = showLegends ? (
        isMobile ? (
            <div
                style={{
                    maxHeight: MOBILE_PIE_LEGEND_MAX_HEIGHT,
                    overflowY: 'auto',
                    paddingRight: getThemeSpacing('xs'),
                    marginBottom: getThemeSpacing('xs'),
                }}
            >
                {Legends}
            </div>
        ) : (
            Legends
        )
    ) : undefined;

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            header={legendHeader}
            onTooltipContextChanged={setTooltipContext}
            minHeight={minGraphHeight}
        >
            <Group
                top={centerY + chartMargin.top}
                left={centerX + chartMargin.left}
            >
                <Pie
                    data={visibleData}
                    outerRadius={radius}
                    innerRadius={innerRadius}
                    padAngle={type === 'donut' ? 0.04 : 0}
                    pieSort={null}
                    pieValue={(d) => d.value}
                >
                    {(pie) =>
                        pie.arcs.map((arc, i) => {
                            const [cx, cy] = pie.path.centroid(arc);
                            const color =
                                getPieColor(arc.data, i, display.colors) ??
                                '#BADA55';
                            const showLabel = shouldDisplayLabel(
                                arc,
                                showLabels
                            );
                            const dimOthers =
                                tooltip?.domainValue !== undefined &&
                                tooltip.domainValue !== arc.index;
                            return (
                                <Group
                                    key={`arc-${arc.data.label}-${i}`}
                                    onMouseEnter={() =>
                                        showTooltip(
                                            arc.index,
                                            arc.data,
                                            color,
                                            cx,
                                            cy
                                        )
                                    }
                                    onMouseLeave={(
                                        event: MouseEvent<SVGGElement>
                                    ) => {
                                        const relatedTarget =
                                            event.relatedTarget as Node | null;
                                        if (
                                            tooltip?.containsNode?.(
                                                relatedTarget
                                            )
                                        ) {
                                            return;
                                        }
                                        tooltip?.hideAll?.();
                                    }}
                                >
                                    <Arc
                                        cornerRadius={type === 'donut' ? 2 : 0}
                                        innerRadius={innerRadius}
                                        outerRadius={radius}
                                        startAngle={arc.startAngle}
                                        endAngle={arc.endAngle}
                                        fill={color}
                                        opacity={dimOthers ? 0.5 : 1}
                                        filter={
                                            dimOthers ? 'grayscale(100%)' : ''
                                        }
                                        stroke={color}
                                    />
                                    {showLabel && (
                                        <text
                                            fill="white"
                                            x={cx}
                                            y={cy}
                                            dy=".33em"
                                            fontSize={12}
                                            textAnchor="middle"
                                            pointerEvents="none"
                                        >
                                            {localizeUnit(
                                                arc.data.label,
                                                localize
                                            )}
                                        </text>
                                    )}
                                </Group>
                            );
                        })
                    }
                </Pie>
            </Group>

            {displayMetric ? (
                <Group
                    top={innerHeight / 2 + chartMargin.top}
                    left={centerX + chartMargin.left}
                >
                    <text
                        y={-12}
                        textAnchor="middle"
                        fontSize="14px"
                        fill={theme.colors.text.primary}
                        style={{ textTransform: 'uppercase' }}
                    >
                        {metric.domain.name}
                    </text>
                    <text
                        y={16}
                        textAnchor="middle"
                        fontSize="20px"
                        fontWeight={700}
                        fill={theme.colors.text.secondary}
                    >
                        {metric.value} {metric.domain.unit}
                    </text>
                </Group>
            ) : (
                <></>
            )}
        </Graph>
    );
}

function useChartData(data: PieGraphProps['data']): PieDatum[] {
    return useMemo(() => {
        const labels = data.domain?.labels ?? [];
        const values = data.data ?? [];
        const sortValues =
            (data.domain as { sortValues?: unknown[] })?.sortValues ?? [];
        const unit = data.domain?.unit ?? '';
        const length = Math.max(labels.length, values.length);

        const result: PieDatum[] = [];
        for (let i = 0; i < length; i++) {
            const label = normalizeLabel(labels[i]);
            const value = values[i];
            if (value == null || !label) continue;

            const sortValue = isNumeric(sortValues[i])
                ? (sortValues[i] as string | number)
                : undefined;

            result.push({
                label,
                value,
                unit,
                sortValue,
                rawIndex: i,
            });
        }
        return result;
    }, [data]);
}

function shouldDisplayLabel(arc: PieArcDatum<unknown>, showLabels = false) {
    return showLabels && arc.endAngle - arc.startAngle >= 0.1;
}
