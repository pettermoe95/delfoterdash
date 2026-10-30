import type { LocalizeFn } from '@bv/i18n-utils';
import { Group } from '@visx/group';
import { scaleBand } from '@visx/scale';
import { useEffect, useMemo, useState } from 'react';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries2D,
} from '../..';
import { GraphUtil, useResponsiveAxisGraphLayout } from '../..';
import { Graph } from '../../Common/Graph';
import { BarDisplay } from './DisplayTypes/BarDisplay';
import { BarStackDisplay } from './DisplayTypes/BarStackDisplay';
import { LineDisplay } from './DisplayTypes/LineDisplay';
import { AxisGraphAxis } from './Parts/AxisGraphAxis';
import { AxisGraphTooltip } from './Parts/AxisGraphTooltip';
import type {
    AxisGraphSeriesConfig,
    BarDisplayMode,
    BarSeriesConfig,
} from './types';
import { useAxisSeriesAndLegends } from './useAxisSeriesAndLegends';
import { getAxisGraphMinMax, tooltipLabelFormatter } from './utils';

type AxisGraphProps = {
    data: GraphDataSeries2D<DiscreteDimension, ContinuousDimension>;
    display?: Record<string, AxisGraphSeriesConfig>;
    showXAxis?: boolean;
    showYAxis?: boolean;
    flipAxis?: boolean;
    gradientBg?: boolean;
    defaultDisplay?: AxisGraphSeriesConfig;
    showLegends?: boolean;
    barDisplay?: BarDisplayMode;
    localize?: LocalizeFn;
    locale?: string;
    showDecimals?: boolean;
};

const DEFAULT_DISPLAY: BarSeriesConfig = {
    displayType: 'bar',
    legendIndex: undefined,
};

/**
 * Generic axis graph (XY-graph) that handles various types of content
 * used for many standard graphs (bar charts, line charts, area charts etc.)
 */
export function AxisGraph({
    data,
    display,
    showXAxis = true,
    showYAxis = true,
    flipAxis = false,
    showLegends = true,
    defaultDisplay = DEFAULT_DISPLAY,
    barDisplay = 'group',
    localize,
    locale,
    showDecimals = false,
}: AxisGraphProps) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 1024);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const hideAxisXLimit = showXAxis
        ? isMobile
            ? 95
            : 140
        : Number.MAX_SAFE_INTEGER;
    const hideAxisYLimit = showYAxis ? 180 : Number.MAX_SAFE_INTEGER;

    const { layoutRef, layout } = useResponsiveAxisGraphLayout({
        padding: 5,
        paddingTop: 10,
        paddingBottom: 15,
        axisPaddingBottom: 35,
        axisPaddingLeft: 55,
        axisPaddingTop: 10,
        axisPaddingRight: 5,
        hideAxisXLimit,
        hideAxisYLimit,
        alwaysHideBothAxis: false,
    });

    // ===================================== //
    //           Series Display              //
    // ===================================== //

    const { Legends, lineSeries, barSeries, dataWithMeta } =
        useAxisSeriesAndLegends(data, display, defaultDisplay);

    /**
     * Calculate the smallest y-domain necessary to display all the series within the chart bounds.
     *
     * If either of the original y-domain extremes are large enough they will be used instead.
     */
    const fittedDomainY: ContinuousDimension = useMemo(() => {
        const [dataMin, dataMax] = getAxisGraphMinMax(
            lineSeries,
            barSeries,
            barDisplay
        );
        return {
            ...data.domainY,
            min: Math.min(data.domainY.min, dataMin),
            max: Math.max(data.domainY.max, dataMax),
        };
    }, [data, barDisplay, lineSeries, barSeries]);

    // ===================================== //
    //                Scales                 //
    // ===================================== //

    const xScale = useMemo(() => {
        // Reduce outer padding to minimize whitespace at the edges while
        // keeping a bit of inner padding for grouped bars readability.
        return scaleBand<number>({
            range: [0, flipAxis ? -layout.height : layout.width],
            round: false,
            domain: data.domainX.values,
            padding: 0.2,
            paddingInner: 0.15,
            paddingOuter: 0.2,
            align: 0.5,
        });
    }, [data.domainX, flipAxis, layout]);

    const yScale = useMemo(
        () =>
            GraphUtil.dimensionToD3Scale(
                fittedDomainY,
                flipAxis ? 0 : layout.height,
                flipAxis ? layout.width : 0
            ),
        [fittedDomainY, flipAxis, layout]
    );

    // ===================================== //
    //            Main Rendering             //
    // ===================================== //

    return (
        <Graph
            layoutRef={layoutRef}
            layout={layout}
            header={showLegends && Legends}
        >
            {/* Main Content */}
            <Group top={layout.top} left={layout.left}>
                {/* Display types */}
                {barDisplay === 'group' ? (
                    <BarDisplay
                        xScale={xScale}
                        yScale={yScale}
                        layout={layout}
                        flipAxis={flipAxis}
                        data={barSeries}
                        domainX={data.domainX}
                    />
                ) : (
                    <BarStackDisplay
                        xScale={xScale}
                        yScale={yScale}
                        layout={layout}
                        flipAxis={flipAxis}
                        data={barSeries}
                        domainX={data.domainX}
                    />
                )}
                <LineDisplay
                    xScale={xScale}
                    yScale={yScale}
                    layout={layout}
                    flipAxis={flipAxis}
                    data={lineSeries}
                    domainX={data.domainX}
                />
                {/* Axis */}
                <AxisGraphAxis
                    layout={layout}
                    flipAxis={flipAxis}
                    domainX={data.domainX}
                    domainY={fittedDomainY}
                    xScale={xScale}
                    yScale={yScale}
                    hideX={!showXAxis}
                    hideY={!showYAxis}
                    localize={localize}
                />
                {/* Tooltip handler */}
                <AxisGraphTooltip
                    layout={layout}
                    data={dataWithMeta}
                    xScale={xScale}
                    yScale={yScale}
                    flipAxis={flipAxis}
                    showLineIndicator={lineSeries.length > 0}
                    tooltipLabelFormatter={(value, unit) =>
                        tooltipLabelFormatter(value, unit, localize, locale)
                    }
                    locale={locale}
                    showDecimals={showDecimals}
                />
            </Group>
        </Graph>
    );
}
