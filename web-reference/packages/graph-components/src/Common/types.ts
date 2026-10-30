// ===================================== //
//             Dimensions                //
// ===================================== //

import type {
    CommonGaugeProgressCylinderGraphDisplay,
    CommonGaugeProgressCylinderGraphDisplayConfig,
} from './DisplayConfig';

// Dimensions have an optional name and min/max labels
export type DimensionMeta = {
    name?: string;
    unit?: string;
    minLabel?: string;
    maxLabel?: string;
};

// Discrete domains are just discrete arrays
export type DiscreteDimension = DimensionMeta & {
    labels?: string[];
    values: number[];
};

// Continuous dimensions have a continuous function
// that converts discrete input values to a new value
export type ContinuousDimension = DimensionMeta & {
    label?(value: number): string;
    min: number;
    max: number;
};

// Generic dimension type
export type AnyDimension = DiscreteDimension | ContinuousDimension;

// ===================================== //
//          Chart data parts             //
// ===================================== //

export type Scalar1D = number;
export type Scalar2D = {
    x: number;
    y: number;
};

export type AnySeries = {
    name?: string;
    relativeIndex?: number;
    displayType?: string;
    color?: string;
    colors?: string[];
    legendText?: string;
    unit?: string;
    tooltip?: string;
    /** Original calculation index from the query, used to match series to display configs */
    calculationIndex?: number;
};

export type Series1D = AnySeries & {
    values: Scalar1D[];
};

export type Series2D = AnySeries & {
    values: Scalar2D[];
};

// ===================================== //
//           Scalar graph data           //
// ===================================== //

/**
 * Single domain and single value (1x1). Suitable
 * for graphs like a simple gauge charts or number display
 *
 * Simplified example:
 *  - domain: server_uptime
 *  - value:  99%
 */
export type GraphDataScalar1D<Dim extends AnyDimension> = {
    domain: Dim;
    value: Scalar1D;
    compareValue?: Scalar1D;
    graphConfig?: CommonGaugeProgressCylinderGraphDisplayConfig<CommonGaugeProgressCylinderGraphDisplay>;
};

/**
 * 2D domain and single value (2x1). Suitable for
 * plotting a single point in two dimensions.
 *
 *
 * Simplified example:
 *  - domain: (height, weight)
 *  - value:  an elephant
 */
export type GraphDataScalar2D<
    DimX extends AnyDimension,
    DimY extends AnyDimension,
> = {
    value: Scalar2D;
    domainX: DimX;
    domainY: DimY;
};

// ===================================== //
//           Vector graph data           //
// ===================================== //

/**
 * Single domain and many values (1xN). Suitable for
 * pie charts or gauge charts with multiple fillers.
 *
 * Simplified example:
 *  - domain: company_expenses
 *  - values: (salary, rent, insurance)
 */
export type GraphDataVector1D<Dim extends AnyDimension> = {
    data: Scalar1D[];
    domain: Dim;
};

/**
 * 2D domain with many points (2xN). Suitable for
 * graphs such as pie charts or gauge chart with multiple fillers.
 *
 * Simplified example:
 *  - domain: (days, income)
 *  - values: income for each day
 */
export type GraphDataVector2D<
    DimX extends AnyDimension,
    DimY extends AnyDimension,
> = {
    data: Scalar2D[];
    domainX: DimX;
    domainY: DimY;
};

// ===================================== //
//           Series graph data           //
// ===================================== //

/**
 * Single domain with series (1xSxN). Suitable for
 * plotting e.g a pie chart where each pie is split
 * into subcategories.
 *
 * Simplified example:
 *  - domain: monthly_budget
 *  - series:
 *      - groceries: (vegetables, meat)
 *      - travel: (bus, car, plane)
 *      - hobbies: (games, music)
 */
export type GraphDataSeries1D<Dim extends AnyDimension> = {
    series: Series1D[];
    domain: Dim;
};

/**
 * 2D domain with series (2xSxN). Suitable for
 * line graphs with multiple lines for different
 * categories, or bar charts with groups.
 *
 * Simplified example:
 *  - domain: (cities, total_emissions)
 *  - series:
 *      - new_york: (cars, public_transport, factories)
 *      - london: (cars, public_transport, factories)
 *      - the_south_pole: (released_under_ice_gases)
 */
export type GraphDataSeries2D<
    DimX extends AnyDimension,
    DimY extends AnyDimension,
> = {
    domainX: DimX;
    domainY: DimY;
    series: Series2D[];
};
