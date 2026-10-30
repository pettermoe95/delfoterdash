import { ThemeContext } from '@brilliant/components';
import type { LocalizeFn } from '@bv/i18n-utils';
import type { SharedAxisProps } from '@visx/axis';
import { AxisBottom, AxisLeft } from '@visx/axis';
import type { AnyD3Scale } from '@visx/scale';
import { useContext } from 'react';
import type { AxisGraphLayout } from '../../..';
import type {
    ContinuousDimension,
    DiscreteDimension,
} from '../../../Common/types';
import { formatAxisTick, useLabelConfig } from './utils';

type AxisGraphAxisProps = {
    layout: AxisGraphLayout;
    domainX: DiscreteDimension;
    domainY: ContinuousDimension;
    xScale: AnyD3Scale;
    yScale: AnyD3Scale;
    hideX?: boolean;
    hideY?: boolean;
    flipAxis?: boolean;
    localize?: LocalizeFn;
};

/**
 * Component that handles rendering of X and Y axis for the AxisGraph
 */
export function AxisGraphAxis({
    layout,
    domainX,
    domainY,
    xScale,
    yScale,
    hideX = false,
    hideY = false,
    flipAxis = false,
    localize,
}: AxisGraphAxisProps) {
    const { theme } = useContext(ThemeContext);

    const {
        xTickFormatter,
        xTickLabelProps,
        xNumTicks,
        xTickValues,
        yTickLabelProps,
        yNumTicks,
        labelProps,
        xAxisLabel,
    } = useLabelConfig(domainX, layout, flipAxis, localize);

    // Common for both axis
    const sharedProps: SharedAxisProps<AnyD3Scale> = {
        scale: xScale,
        stroke: theme.colors.text.primary,
        tickStroke: theme.colors.text.primary,
        labelProps: labelProps,
    };

    // Axis setup X
    const xProps: SharedAxisProps<AnyD3Scale> = {
        scale: xScale,
        top: layout.height,
        tickLabelProps: xTickLabelProps,
        tickFormat: xTickFormatter,
        numTicks: xNumTicks,
        tickValues: xTickValues,
        label: xAxisLabel,
        labelOffset: flipAxis ? 40 : 5,
    };

    // Axis setup Y
    const yProps: SharedAxisProps<AnyD3Scale> = {
        scale: yScale,
        top: flipAxis ? layout.height : 0,
        tickLabelProps: yTickLabelProps,
        tickFormat: (y: number) => domainY.label?.(y) ?? formatAxisTick(y),
        numTicks: yNumTicks,
        label: domainY.unit,
    };

    function getLabelKey(label: string): string {
        switch (label) {
            case 'Year':
                return 'time.year';
            case 'Month':
                return 'time.month';
            case 'Week':
                return 'time.week';
            case 'Day of week':
                return 'time.dayOfWeek';
            case 'Year, quarter':
                return 'time.yearQuarter';
            case 'Year, month':
                return 'time.yearMonth';
            case 'Year, week':
                return 'time.yearWeek';
            case 'Day of year':
                return 'time.yearDay';
            default:
                return '';
        }
    }

    const label = xProps.label ?? '';
    const labelKey = getLabelKey(label);
    const localizedLabel = localize?.(labelKey) ?? '';
    if (localizedLabel !== labelKey && localizedLabel !== '') {
        xProps.label = localizedLabel;
    }

    const zeroLineMidPoint = Number(yScale(0));

    // Render
    return (
        <>
            {layout.showAxisX && !hideX && (
                <AxisBottom
                    {...sharedProps}
                    {...(flipAxis ? yProps : xProps)}
                />
            )}
            {layout.showAxisY && !hideY && (
                <AxisLeft {...sharedProps} {...(flipAxis ? xProps : yProps)} />
            )}
            {domainY.min < 0 && (
                <ZeroLine
                    layout={layout}
                    midPoint={zeroLineMidPoint}
                    flipAxis={flipAxis}
                />
            )}
        </>
    );
}

type ZeroLineProps = { midPoint: number } & Pick<
    AxisGraphAxisProps,
    'layout' | 'flipAxis'
>;
function ZeroLine({ layout, midPoint, flipAxis }: ZeroLineProps) {
    const { theme } = useContext(ThemeContext);
    const zeroMarkerProps = flipAxis
        ? { x1: midPoint, x2: midPoint, y1: 0, y2: layout.height }
        : { x1: 0, x2: layout.width, y1: midPoint, y2: midPoint };

    return (
        <line
            {...zeroMarkerProps}
            stroke={theme.colors.text.secondary}
            strokeDasharray="2, 4"
            strokeWidth={2}
        />
    );
}
