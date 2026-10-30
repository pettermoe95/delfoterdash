import { useGraphLegends } from '../../Common/Legend/Legend';
import type {
    AnySeries,
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries2D,
    Series2D,
} from '../../Common/types';
import type {
    AxisGraphDisplayType,
    AxisGraphSeriesConfig,
    BarSeriesConfig,
    LineSeriesConfig,
    SeriesWithDisplayConfig,
} from './types';

function sortSeriesData<T extends AxisGraphSeriesConfig>(
    seriesData: SeriesWithDisplayConfig<T>,
    metaData: GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
): SeriesWithDisplayConfig<T> {
    return {
        ...seriesData,
        series: {
            ...seriesData.series,
            values: seriesData.series.values.sort(
                (a, b) =>
                    metaData.domainX.values.indexOf(b.x) -
                    metaData.domainX.values.indexOf(a.x)
            ),
        },
    };
}

export function useAxisSeriesAndLegends(
    data: GraphDataSeries2D<DiscreteDimension, ContinuousDimension>,
    displayConfigs: Record<string, AxisGraphSeriesConfig> = {},
    defaultDisplay: AxisGraphSeriesConfig
) {
    // Display config contains the correct color

    const barSeries = getSeriesAndConfigByType<BarSeriesConfig>(
        data.series,
        'bar',
        displayConfigs,
        defaultDisplay
    );

    const lineSeries = getSeriesAndConfigByType<LineSeriesConfig>(
        data.series,
        'line',
        displayConfigs,
        defaultDisplay
    ).map((series) => sortSeriesData(series, data));

    const sortedSeries = [...barSeries, ...lineSeries].sort(
        (a, b) => a.index - b.index
    );

    // Build a complete list of all configured series for legends,
    // including those without data
    const allSeriesForLegends = Object.keys(displayConfigs)
        .map((key) => parseInt(key, 10))
        .sort((a, b) => a - b)
        .map((index) => {
            // Check if this series has data
            const existingSeries = sortedSeries.find((s) => s.index === index);
            if (existingSeries) {
                return existingSeries;
            }
            // Create a placeholder entry for series without data
            const config = getDisplayConfig(
                displayConfigs,
                index,
                defaultDisplay
            );
            return {
                name: config.legendText ?? `Series ${index}`,
                series: { name: '', values: [] },
                display: config,
                hidden: false,
                index,
                relativeIndex: 0,
                displayType: config.displayType,
                legendText: config.legendText,
                color: config.color,
                colors: config.colors,
            };
        });

    const legendMapping = sortedSeries.reduce(
        (acc, item) => {
            acc[item.index] = {
                name: item.display.legendText,
                relativeIndex: item.relativeIndex,
                displayType: item.displayType,
                color: item.display?.color,
                colors: item.display?.colors,
            };
            return acc;
        },
        {} as Record<number, AnySeries>
    );

    const seriesWithDisplayConfig: Series2D[] = data.series.reduce(
        (acc, item, idx) => {
            const seriesWithConfig = sortedSeries[idx];
            acc.push({
                ...item,
                displayType: seriesWithConfig?.displayType,
                relativeIndex: seriesWithConfig?.relativeIndex,
                color: seriesWithConfig?.display?.color,
                colors: seriesWithConfig?.display?.colors,
                legendText: seriesWithConfig?.display.legendText,
            });
            return acc;
        },
        [] as Series2D[]
    );

    const [hidden, Legends] = useGraphLegends({
        series: allSeriesForLegends,
        display: displayConfigs,
    });

    return {
        lineSeries: lineSeries.filter((item) => !hidden.includes(item.index)),
        barSeries: barSeries.filter((item) => !hidden.includes(item.index)),
        legendMapping,
        dataWithMeta: {
            ...data,
            series: seriesWithDisplayConfig,
        },
        Legends,
        hidden,
    };
}

/**
 * Gets all series with a given display type and groups them into an
 * object containing both the data and display configuration.
 * This information is passed down to each renderer.
 */
function getSeriesAndConfigByType<T extends AxisGraphSeriesConfig>(
    series: Series2D[],
    displayType: AxisGraphDisplayType,
    displayConfigs: Record<string, AxisGraphSeriesConfig> = {},
    defaultDisplay: AxisGraphSeriesConfig
): SeriesWithDisplayConfig<T>[] {
    const result = series.reduce((acc, seriesItem, arrayIndex) => {
        // Use calculationIndex if available, otherwise fall back to array position
        const configIndex = seriesItem.calculationIndex ?? arrayIndex;
        const displayConfig = getDisplayConfig(
            displayConfigs,
            configIndex,
            defaultDisplay
        );

        if (displayConfig?.displayType === displayType) {
            acc.push({
                name: seriesItem.name ?? `${displayType} ${acc.length}`,
                series: seriesItem,
                display: displayConfig as T,
                hidden: false,
                index: configIndex,
                relativeIndex: acc.length,
                displayType: displayType,
                legendText: displayConfig.legendText ?? '',
            });
        }
        return acc;
    }, [] as SeriesWithDisplayConfig<T>[]);

    return result;
}

function getDisplayConfig(
    displayConfigs: Record<string, AxisGraphSeriesConfig>,
    index: number,
    defaultDisplay: AxisGraphSeriesConfig
): AxisGraphSeriesConfig {
    const config = displayConfigs?.[index.toString()] ?? undefined;

    return {
        ...defaultDisplay,
        ...(config ?? {}),
    };
}
