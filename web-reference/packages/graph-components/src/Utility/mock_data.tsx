// ===================================== //
//            Mock Data Util             //
// ===================================== //

import { bitcoinPrice } from '@visx/mock-data';
import * as datefns from 'date-fns';
import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataScalar1D,
    GraphDataSeries1D,
    GraphDataSeries2D,
    GraphDataVector1D,
    GraphDataVector2D,
    Series1D,
    Series2D,
} from '..';
import { GraphUtil } from '..';

const ONE_MILLION = 1_000_000;

export function mockScalar1D(): GraphDataScalar1D<ContinuousDimension> {
    return {
        domain: {
            name: 'Prosent',
            unit: '%',
            max: 100,
            min: 0,
        },
        value: Math.random() * 100,
    };
}

const mockCategories = ['Banana', 'Apple', 'Orange', 'Pear', 'Grape'];
export function mockPieData(): GraphDataVector1D<DiscreteDimension> {
    const values = mockCategories.map(() =>
        Math.min(Math.ceil(Math.random() * 100), 20)
    );
    return {
        domain: {
            labels: mockCategories,
            values,
            unit: '#',
            name: 'Fruit',
        },
        data: values,
    };
}

export function mockTimeScalar2D(): GraphDataVector2D<
    DiscreteDimension,
    ContinuousDimension
> {
    const date = new Date();
    const days = Array.from(
        { length: datefns.getDaysInMonth(date) },
        (_, idx) => idx
    );
    const dates = days.map((v) =>
        new Date(date.getFullYear(), date.getMonth(), v + 1).getTime()
    );
    return {
        domainX: {
            values: dates,
            name: 'Dates',
        },
        domainY: {
            name: 'Prosent',
            unit: '%',
            max: 100,
            min: 0,
        },
        data: dates.map((d) => {
            return {
                x: d,
                y: Math.random() * 100,
            };
        }),
    };
}

export function mockSeries2D(
    series = 1,
    categories = 5,
    smooth = false
): GraphDataSeries2D<DiscreteDimension, ContinuousDimension> {
    const cats = Array.from(
        { length: categories },
        (_, idx) => `Dag ${idx + 1}`
    );
    const domainX = GraphUtil.categorical('Dag', 'Dag', cats);
    const domainY = GraphUtil.continuous('NOK', 'KR', 0, ONE_MILLION);

    const mockSeries: Series2D[] = Array.from(
        { length: series },
        (_, index) => {
            return {
                name: `Series ${index + 1}`,
                values: domainX.values.map((x) => ({
                    x,
                    y: smooth
                        ? (x / categories) * 0.7 * domainY.max +
                          Math.random() * domainY.max * 0.3
                        : Math.random() * domainY.max,
                })),
            };
        }
    );
    return {
        domainX: domainX,
        domainY: domainY,
        series: mockSeries,
    };
}

const names = [
    'John Henry Smith',
    'Jane Doe',
    'Bob Marley',
    'Sigurd Walder Ivarsen',
    'Bilbo Baggins',
    'Gerard Henry Billows',
];

export function mockAlternatingSeries(
    series = 1,
    categories = 5,
    smooth = false,
    flipThreshold = false
): GraphDataSeries2D<DiscreteDimension, ContinuousDimension> {
    const cats = Array.from(
        { length: categories },
        (_, idx) => names[idx % names.length] ?? ''
    );
    const domainX = GraphUtil.categorical('Dag', 'Dag', cats);
    const domainY = GraphUtil.continuous(
        'NOK',
        'KR',
        -ONE_MILLION,
        ONE_MILLION
    );

    const generateValue = (x: number, index: number, seriesIdx: number) => {
        const threshold = Math.ceil(categories / 2);
        const isBelowThreshold = index < threshold;
        const invertValue =
            flipThreshold && seriesIdx % 2 == 0
                ? !isBelowThreshold
                : isBelowThreshold;
        const baseValue = smooth
            ? (x / categories) * 0.7 * domainY.max +
              Math.random() * domainY.max * 0.3
            : Math.random() * domainY.max;
        return invertValue ? baseValue * -1 : baseValue;
    };

    const mockSeries: Series2D[] = Array.from(
        { length: series },
        (_, seriesIdx) => {
            return {
                name: `Alternating Series ${seriesIdx + 1}`,
                values: domainX.values.map((x, index) => ({
                    x,
                    y: generateValue(x, index, seriesIdx),
                })),
            };
        }
    );

    return {
        domainX,
        domainY,
        series: mockSeries,
    };
}

export function mockSeries2DContinuous(
    series = 1,
    resolution = 5
): GraphDataSeries2D<ContinuousDimension, ContinuousDimension> {
    const domainX = GraphUtil.continuous('Tid', 'Tid', 0, 100);
    const domainY = GraphUtil.continuous('NOK', 'KR', 0, 10_000);
    const percent = Array.from(
        { length: resolution },
        (_, v) => v / (resolution - 1)
    );
    const mockSeries: Series2D[] = Array.from(
        { length: series },
        (_, index) => {
            return {
                name: `Series ${index + 1}`,
                values: percent.map((p) => ({
                    x: domainX.min * (1 - p) + p * domainX.max,
                    y:
                        domainY.min * (1 - p) +
                        p * domainY.max +
                        Math.random() * (domainY.max - domainY.min) * 0.1,
                })),
            };
        }
    );
    return {
        domainX: domainX,
        domainY: domainY,
        series: mockSeries,
    };
}

export function mockBitcoinPrices(
    days = 100
): GraphDataVector2D<DiscreteDimension, ContinuousDimension> {
    const prices = bitcoinPrice.prices.slice(0, days).reverse();
    const dates = prices.map(({ time }) => new Date(time).getTime());
    const values = prices.map((value) => parseInt(value.price));
    return {
        domainX: {
            values: dates,
            name: 'Dates',
        },
        domainY: {
            name: 'Bitcoin',
            unit: bitcoinPrice.currency,
            min: Math.min(...values),
            max: Math.max(...values),
        },
        data: values.map((price, idx) => ({
            x: dates[idx] ?? 0,
            y: price,
        })),
    };
}

const mockColumns = [
    'NormalTime',
    'InvoiceHours',
    'Booked',
    'AvgHourPrice',
    'InvoiceRate',
    'InvoiceBasis',
];
export function mockTabularData(
    rows = 3,
    columns = 6
): GraphDataSeries1D<DiscreteDimension> {
    const rowIds = Array.from(Array(rows).keys()).map((idx) => idx + 1);
    const domain: DiscreteDimension = {
        name: 'Employee',
        values: rowIds,
        labels: rowIds.map((id) => `Person ${id}`),
    };
    const mockSeries: Series1D[] = Array.from(Array(columns).keys()).map(
        (columnIdx) => {
            return {
                name: mockColumns[columnIdx] ?? `Column${columnIdx + 1}`,
                values: rowIds.map(() => Math.ceil(Math.random() * 1000)),
            };
        }
    );
    return {
        domain,
        series: mockSeries,
    };
}
