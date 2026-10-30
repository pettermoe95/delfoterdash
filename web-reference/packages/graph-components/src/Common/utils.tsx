// ===================================== //
//              Utilities                //
// ===================================== //

import { brilliantViewIcons } from '@brilliant/bds-core';
import type { AnyD3Scale } from '@visx/scale';
import { scaleBand, scaleLinear } from '@visx/scale';
import type { ContinuousDimension, DiscreteDimension, Series2D } from '..';
import { formatCompactNumber, formatNumber } from '../Utility/numberFormatter';
import type { AnyDimension, Scalar2D } from './types';

function categorical(
    name: string,
    unit: string,
    categories: string[]
): DiscreteDimension {
    return {
        labels: categories,
        values: categories.map((_, index) => index),
        name: name,
        unit: unit,
    };
}

function continuous(
    name: string,
    unit: string,
    min: number,
    max: number
): ContinuousDimension {
    return {
        name: name,
        unit: unit,
        min: min,
        max: max,
    };
}

/**
 * Finds a datapoint in series given X value.
 * If the point is outside of the series domain, returns
 * the first/last point.
 *
 * If the point is inside the series domain but the exact value
 * is not found, returns a new point that is the linear interpolation
 * between the two nearest points whenever interoplate = true.
 *
 * @param series Series to evaluate
 * @param x X value in the domain to evaluate
 * @param interpolate Whether to interpolate the value
 * @returns A point in the series or undefined if the series is empty.
 */
function getSeries2DValueByX(
    series: Series2D,
    x: number,
    interpolate = false
): Scalar2D | undefined {
    // Sanity check for empty series
    if (series.values.length == 0) {
        return undefined;
    }

    // Iterate to find the exact/nearest points
    let left: Scalar2D | undefined = undefined;
    let right: Scalar2D | undefined = undefined;
    for (const point of series.values) {
        if (point.x === x) {
            return point;
        }
        if (point.x < x) {
            if (left === undefined || point.x > left.x) {
                left = point;
            }
        } else {
            if (right === undefined || point.x < right.x) {
                right = point;
            }
        }
    }

    // Not found
    if (!interpolate || left === undefined || right === undefined) {
        return undefined;
    }

    // Outside of series domain
    if (x < left.x) return left;
    if (x > right.x) return right;
    if (left.x === right.x) return left;

    // Linear interpolation
    const percent = (x - left.x) / (right.x - left.x);

    return {
        x: x,
        y: left.y * (1 - percent) + right.y * percent,
    };
}

/**
 * Wrapper to get 2D value from scalar2D array (non-series types)
 */
function get2DValueByX(
    data: Scalar2D[],
    x: number,
    interpolate = false
): Scalar2D | undefined {
    return getSeries2DValueByX({ values: data }, x, interpolate);
}

/**
 * Returns the domain label for a given value if exists,
 * otherwise converts the numeric value to a string
 * @param domain Domain to get label for
 * @param value Value to get label for
 * @returns String representation
 */
function getDomainLabel(domain: DiscreteDimension, value: number): string {
    const index = domain.values.indexOf(value);
    if (domain.labels !== undefined && domain.labels.length > index) {
        return domain.labels[index] ?? value.toString();
    }
    return value.toString();
}

/**
 * Runs a function for a domain depending on type
 */
function forDimensionType<T = void>(
    domain: AnyDimension,
    continuous: (dim: ContinuousDimension) => T,
    discrete: (dim: DiscreteDimension) => T
): T {
    if ('min' in domain && 'max' in domain) {
        return continuous(domain);
    }
    return discrete(domain);
}

/**
 * Converts any dimension to a D3 scale
 * @param dimension The dimension to convert
 * @param left The start of the output range
 * @param right The end of the output range
 * @returns Any D3 scale (band or linear)
 */
function dimensionToD3Scale(
    dimension: AnyDimension,
    left: number,
    right: number
): AnyD3Scale {
    const scale = forDimensionType<AnyD3Scale>(
        dimension,
        (continuous: ContinuousDimension) => {
            return scaleLinear<number>({
                range: [left, right],
                round: true,
                domain: [continuous.min, continuous.max],
            });
        },
        (discrete: DiscreteDimension) => {
            return scaleBand<number>({
                range: [left, right],
                round: true,
                domain: discrete.values,
                padding: 0.2,
            });
        }
    );
    return scale;
}

/**
 * Converts a number to a pretty value (using K, M shorthands)
 * @param value Value to convert
 * @param precision Maximum fraction digits to display
 * @param suffix Whether to use compact number suffixes
 * @param locale Locale used for formatting
 * @param showDecimals Whether decimals should be shown
 */
function prettyValue(
    value: number,
    precision = 2,
    suffix = true,
    locale?: string,
    showDecimals = true
): string {
    if (!suffix) {
        return formatNumber(value, {
            locale,
            showDecimals,
            fractionDigits: precision,
        });
    }

    return formatCompactNumber(value, {
        locale,
        showDecimals,
        fractionDigits: precision,
    });
}

/**
 * Converts a number to a pretty fixed value.
 * Limits the number of decimals depending on size of number.
 * @param value Value to convert
 * @param locale Locale used for formatting
 * @param showDecimals Whether decimals should be shown
 */
function prettyFixed(
    value: number,
    locale?: string,
    showDecimals = true
): string {
    return formatNumber(value, { locale, showDecimals });
}

/**
 * Truncate number and return it prettyfixed without decimals.
 * @param value Value to truncate
 * @param locale Locale used for formatting
 */
function truncedPrettyFixed(value: number, locale?: string): string {
    const truncatedValue = Math.trunc(value);
    return formatNumber(truncatedValue, { locale, showDecimals: false });
}
/**
 * Give percentage change between two numbers
 * @param oldNumber
 * @param newNumber
 * @returns
 */
function calculatePercentageChange(oldNumber: number, newNumber: number) {
    if (oldNumber === 0) {
        throw new Error('The old number cannot be zero.');
    }
    const change = newNumber - oldNumber;
    const percentageChange = (change / oldNumber) * 100;
    return percentageChange;
}
/**
 *
 * @param percentageChange
 * @returns
 */
function arrowIcon(percentageChange: number) {
    const arrowIcon =
        percentageChange && percentageChange >= 0
            ? brilliantViewIcons['arrow-up']
            : brilliantViewIcons['arrow-down'];
    return arrowIcon;
}

/**
 * Exported utilities.
 * Provides various common graph utility functions
 */
export const GraphUtil = {
    categorical: categorical,
    continuous: continuous,
    domainLabel: getDomainLabel,
    forDimensionType: forDimensionType,
    getSeries2DValueByX: getSeries2DValueByX,
    get2DValueByX: get2DValueByX,
    dimensionToD3Scale: dimensionToD3Scale,
    prettyValue: prettyValue,
    prettyFixed: prettyFixed,
    truncedPrettyFixed: truncedPrettyFixed,
    calculatePercentageChange: calculatePercentageChange,
    getArrowIcon: arrowIcon,
};
