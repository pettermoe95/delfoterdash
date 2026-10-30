import type { GenericData, GenericDataDomainValue } from '@bv/api';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries1D,
    GraphDataSeries2D,
    GraphDataVector1D,
    GraphDataVector2D,
    Series1D,
    Series2D,
} from '@bv/graph-components';

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatLabel(label: string) {
    return capitalizeFirstLetter(label.replace(/_/g, ' ').trim());
}

function sortDomainValues(
    domainValues: GenericDataDomainValue[]
): GenericDataDomainValue[] {
    return domainValues.sort(
        (a: GenericDataDomainValue, b: GenericDataDomainValue) => {
            const len = Math.max(a.data.length, b.data.length);
            for (let i = 0; i < len; i++) {
                const valA = a.data[i]?.sort_value ?? Number.MAX_SAFE_INTEGER;
                const valB = b.data[i]?.sort_value ?? Number.MAX_SAFE_INTEGER;
                if (valA !== valB) {
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        return Number(valA) - Number(valB);
                    } else {
                        return String(valA).localeCompare(String(valB));
                    }
                }
            }
            return 0;
        }
    );
}

export function genericDataToSeries2D(
    data: GenericData
): GraphDataSeries2D<DiscreteDimension, ContinuousDimension> | undefined {
    if (
        !data ||
        !Array.isArray(data.calculations) ||
        !data.domain ||
        !Array.isArray(data.domain.values)
    ) {
        return undefined;
    }

    let yLow: number | undefined = undefined;
    let yHigh: number | undefined = undefined;

    const allSeries: Series2D[] = [];
    data.calculations.forEach((calculation, calculationIndex) => {
        if (!calculation || !Array.isArray(calculation.series)) {
            return;
        }

        calculation.series.forEach((series) => {
            // Automatic series name
            const calcLabel = calculation.label?.trim();
            const labelBase =
                calcLabel &&
                calcLabel.length > 0 &&
                calcLabel.toLowerCase() !== 'no label'
                    ? calcLabel
                    : calculation.aggregate;
            let seriesName = series.label;
            if (calculation.series.length == 1) {
                seriesName = labelBase;
            } else if (
                !seriesName ||
                seriesName.trim().length === 0 ||
                seriesName.toLowerCase() === 'no label'
            ) {
                seriesName = labelBase;
            }
            if (series.values === undefined) {
                return;
            }
            for (const datapoint of series.values) {
                if (yLow === undefined || yHigh === undefined) {
                    yLow = yHigh = datapoint.y;
                    yLow = 0; // TEST zero low
                } else {
                    yLow = Math.min(yLow, datapoint.y);
                    yHigh = Math.max(yHigh, datapoint.y);
                }
            }
            const seriesValues = series.values.map((datapoint) => ({
                x: datapoint.x,
                y: datapoint.y,
            }));
            allSeries.push({
                values: seriesValues,
                name: formatLabel(seriesName),
                unit: calculation.unit_name,
                calculationIndex,
            });
        });
    });

    // Convert to set and back to an array again to remove duplicate unit names.
    const domainYUnit = Array.from(
        new Set(
            data.calculations
                .filter((c) => c?.unit_name != undefined)
                .map((c) => c.unit_name)
        )
    ).join(', ');
    const domainYName = data.calculations
        .filter((c) => c?.label != undefined)
        .map((c) => c.label)
        .join(', ');

    const sortedDomainValues = sortDomainValues([...data.domain.values]);

    return {
        domainX: {
            values: sortedDomainValues.map((v) => v.x),
            labels: sortedDomainValues.map((value) => value.label),
            unit: formatLabel(data.domain.label),
            name: formatLabel(data.domain.label),
        },
        domainY: {
            min: yLow ?? 0,
            max: yHigh ?? 0,
            unit: domainYUnit,
            name: domainYName,
        },
        series: allSeries,
    };
}

export function genericDataToSeries1D(
    data: GenericData
): GraphDataSeries1D<DiscreteDimension> | undefined {
    if (
        !data ||
        !Array.isArray(data.calculations) ||
        !data.domain ||
        !Array.isArray(data.domain.values)
    ) {
        return undefined;
    }

    const sortedDomainValues = sortDomainValues([...data.domain.values]);
    const domainOrder = sortedDomainValues.map((value) => value.x);

    const allSeries: Series1D[] = [];
    data.calculations.forEach((calculation) => {
        if (!calculation || !Array.isArray(calculation.series)) {
            return;
        }

        calculation.series.forEach((series) => {
            // Automatic series name
            const calcLabel = calculation.label?.trim();
            const labelBase =
                calcLabel &&
                calcLabel.length > 0 &&
                calcLabel.toLowerCase() !== 'no label'
                    ? calcLabel
                    : calculation.aggregate;
            const seriesName = `${labelBase}`;
            if (series.values === undefined) {
                return;
            }

            const valuesByX = new Map(
                series.values.map((dataPoint) => [dataPoint.x, dataPoint.y])
            );
            const seriesValues = domainOrder.map((x) => {
                const value = valuesByX.get(x);
                return value ?? 0;
            });

            allSeries.push({
                values: seriesValues,
                name: formatLabel(seriesName),
                unit: calculation.unit_name,
            });
        });
    });

    return {
        domain: {
            values: sortedDomainValues.map((value) => value.x),
            labels: sortedDomainValues.map((value) => value.label),
            unit: formatLabel(data.domain.label),
            name: formatLabel(data.domain.label),
        },

        series: allSeries,
    };
}

export function genericDataToVector2D(
    data: GenericData
): GraphDataVector2D<DiscreteDimension, ContinuousDimension> | undefined {
    const series = genericDataToSeries2D(data);
    return series !== undefined
        ? {
              data: series.series?.[0]?.values ?? [],
              domainX: series.domainX,
              domainY: series.domainY,
          }
        : undefined;
}

export function genericDataToVector1D(
    data: GenericData
): GraphDataVector1D<DiscreteDimension> | undefined {
    if (
        !data ||
        !Array.isArray(data.calculations) ||
        !data.domain ||
        !Array.isArray(data.domain.values)
    ) {
        return undefined;
    }

    const values = data.calculations[0]?.series[0]?.values ?? [];
    const sortedDomain = sortDomainValues([...data.domain.values]);
    const domainOrder = sortedDomain.map((domain) => domain.x);

    const valuesByX = new Map(values.map((dp) => [dp.x, dp.y]));
    const vector = domainOrder.map((x) => valuesByX.get(x) ?? 0);
    const sortValues = sortedDomain.map((domain) =>
        normalizeSortValue(domain.data?.[0]?.sort_value)
    );

    return {
        data: vector,
        domain: {
            values: domainOrder,
            labels: sortedDomain.map((d) => d.label),
            unit: data.calculations[0]?.unit_name ?? '',
            name: formatLabel(data.domain.label),
            sortValues,
        } as DiscreteDimension & {
            sortValues: (number | string | undefined)[];
        },
    };
}

function normalizeSortValue(raw: unknown): number | string | undefined {
    if (typeof raw === 'object' && raw instanceof Date) return raw.getTime();
    if (typeof raw === 'number' || typeof raw === 'string') return raw;
    return undefined;
}
