import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@bv/design-tokens/tokens.css';

// Graphs, see 'Graph/main.ts'
export * from './Components';

// Data types
export type {
    // Dims
    DiscreteDimension,
    ContinuousDimension,
    // Graph data
    GraphDataScalar1D,
    GraphDataVector1D,
    GraphDataSeries1D,
    GraphDataScalar2D,
    GraphDataVector2D,
    GraphDataSeries2D,
    // Series
    Series1D,
    Series2D,
    AnyDimension,
    AnySeries,
    // Scalars
    Scalar1D,
    Scalar2D,
} from './Common/types';
export type {
    AxisGraphDisplayConfig,
    CalculationTarget,
    CalendarGraphDisplayConfig,
    CommonGaugeProgressCylinderGraphDisplay,
    CommonGaugeProgressCylinderGraphDisplayConfig,
    PieGraphDisplayConfig,
    ProgressGraphDisplayConfig,
    TableGraphDisplayConfig,
} from './Common/DisplayConfig';

// Utility
export { GraphUtil } from './Common/utils';
export * from './Utility/mock_data';
// Layout
export type { GraphLayout, AxisGraphLayout } from './Common/layout';
export {
    useResponsiveGraphLayout,
    useResponsivePaddedGraphLayout,
    useResponsiveAxisGraphLayout,
} from './Common/layout';
