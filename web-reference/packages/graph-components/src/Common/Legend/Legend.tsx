import { Icon, Tooltip } from '@brilliant/bds-core';
import { Column, Row, ThemeContext } from '@brilliant/components';
import type { CSSProperties, ReactNode } from 'react';
import { useContext, useState } from 'react';
import type {
    AxisGraphSeriesConfig,
    SeriesWithDisplayConfig,
} from '../../Components/AxisGraph/types';
import { colorConfig, getGraphLegendConfig } from '../../Theme/Config/config';
import type { AnySeries, Series1D, Series2D } from '../types';
import styles from './Legend.module.scss';

type GraphLegendProps = {
    hidden?: boolean;
    color?: string;
    borderColor?: string;
    name?: string;
    value?: string | ReactNode;
    legendIcon?: string;
    offIcon?: string;
    onClick?: () => void;
    tooltip?: string;
};

/**
 * A single graph legend
 */
export function GraphLegend({
    hidden = false,
    color,
    name,
    value,
    legendIcon,
    offIcon,
    onClick,
    borderColor = 'transparent',
    tooltip,
}: GraphLegendProps) {
    const { theme } = useContext(ThemeContext);

    const customColor =
        color !== undefined && color in colorConfig
            ? colorConfig[color as keyof typeof colorConfig][600]
            : color;

    const circleStyle: CSSProperties = {
        borderRadius: '5px',
        width: '0.85rem',
        height: '0.85rem',
        color: color !== undefined ? customColor : 'currentColor',
        border: borderColor && `0px solid ${borderColor}`,
        borderColor: color ?? theme.colors.text.primary,
    };
    const nameStyle: CSSProperties = {
        whiteSpace: 'nowrap',
        color: theme.colors.text.secondary,
        fontSize: '0.85rem',
    };
    const legendRow = (
        <Row gap="xs" onClick={onClick} className={styles.legend_container}>
            {hidden && (
                <Icon
                    color={color}
                    icon={offIcon ?? 'mdi:circle-off-outline'}
                    style={circleStyle}
                />
            )}
            {!hidden && color && (
                <Icon
                    color={color}
                    icon={legendIcon ?? 'mdi:circle'}
                    style={circleStyle}
                />
            )}
            {name && <div style={nameStyle}>{name}</div>}
            {value}
        </Row>
    );

    if (tooltip) {
        return (
            <Tooltip
                title={name ?? ''}
                description={tooltip}
                side="top"
                align="start"
                triggerAsChild={false}
            >
                {legendRow}
            </Tooltip>
        );
    }

    return legendRow;
}

export type GraphType =
    | 'axis'
    | 'calendar'
    | 'gauge'
    | 'pie'
    | 'progress'
    | 'status'
    | 'business-logo';

type LegendConfigProps = Pick<
    GraphLegendProps,
    'color' | 'legendIcon' | 'offIcon'
>;

type GraphLegendsProps = {
    series: (Series1D | Series2D | AnySeries)[];
    display?: Record<number, AxisGraphSeriesConfig>;
    vertical?: boolean;
    type?: GraphType;
};

function hasSeriesDisplayConfig(
    series: Series1D | Series2D | AnySeries
): series is SeriesWithDisplayConfig<AxisGraphSeriesConfig> {
    return (
        typeof series === 'object' &&
        series !== null &&
        'display' in series &&
        'legendText' in series &&
        'series' in series &&
        'hidden' in series &&
        'index' in series &&
        'relativeIndex' in series
    );
}

/**
 * Utility for rendering all legends for a list of series
 */
export function useGraphLegends({
    series,
    display,
    vertical = false,
    colorScale,
}: GraphLegendsProps & { colorScale?: (name: string) => string }): [
    number[],
    ReactNode,
] {
    const [hidden, setHidden] = useState<number[]>([]);

    const legends = series.map((ser, index) => {
        const configProps: LegendConfigProps = hasSeriesDisplayConfig(ser)
            ? getGraphLegendConfig(ser)
            : {};

        const autoColor =
            ser.color !== undefined && ser.color.length > 0
                ? ser.color
                : ser.name && colorScale
                  ? colorScale(ser.name)
                  : undefined;

        const legendColor =
            ser.color !== undefined
                ? ser.color
                : (autoColor ?? configProps.color);

        const displayConfig = display?.[index];
        const legendName = displayConfig?.legendText ?? ser.name;

        return (
            <GraphLegend
                hidden={hidden.includes(index)}
                key={index}
                name={legendName}
                {...configProps}
                color={legendColor}
                tooltip={ser.tooltip}
                onClick={() => {
                    if (hidden.includes(index)) {
                        // Unhide
                        setHidden(hidden.filter((h) => h !== index));
                    } else {
                        // Hide
                        setHidden([...hidden, index]);
                    }
                }}
            />
        );
    });

    const Legends = vertical ? (
        <Column gap="s" width="100%" align="flex-start">
            {legends}
        </Column>
    ) : (
        <Row gap="s" wrap={true}>
            {legends}
        </Row>
    );

    return [hidden, Legends];
}
