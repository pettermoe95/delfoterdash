import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@brilliant/bds-core';
import { primitives } from '@bv/design-tokens';
import type { HTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { DashboardColor } from '../Dashboard';
import ChartTypeBarsButton, {
    ChartColorSelectButton,
    ChartTypeLineButton,
} from './ChartTypeButtons';
import style from './SerieTypeAndColorPicker.module.scss';

type SerieCurveType = 'step' | 'curve';

interface SerieDisplayOptions {
    // Keep the supported types visible while allowing other string values.
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    color?: DashboardColor | string;
    displayType?: 'bar' | 'line' | string;
    curveType?: SerieCurveType | string;
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
    lineOptions?: { curveType?: SerieCurveType };
}

const EMPTY_DISPLAY_OPTIONS: SerieDisplayOptions = {};
const INDEXED_COLORS = Object.keys(
    primitives.colors.dashboard
) as DashboardColor[];
const getIndexedColor = (index: number): DashboardColor =>
    INDEXED_COLORS[index] ?? 'blue';

function isDashboardColor(color: unknown): color is DashboardColor {
    return typeof color === 'string' && color in primitives.colors.dashboard;
}

interface SerieColorPickerProps extends HTMLAttributes<HTMLDivElement> {
    index?: number;
    displayOptions?: SerieDisplayOptions;
    hideTypeOptions?: boolean;
    onChangeHandler?: (values: {
        color: DashboardColor | undefined;
        displayType: 'bar' | 'line';
        curveType: SerieCurveType;
        open?: boolean;
        index?: number;
    }) => void;
    onTypeChangeHandler?: (displayType: 'bar' | 'line', index: number) => void;
    onLineChangeHandler?: (curveType: SerieCurveType, index: number) => void;
    onColorChangeHandler?: (color: DashboardColor, index: number) => void;
    onOpenChangeHandler?: (open: boolean) => void;
}

const SerieTypeAndColorPicker = ({
    onChangeHandler,
    onOpenChangeHandler,
    displayOptions: displayOptionsProp,
    index = 0,
    hideTypeOptions = false,
    onTypeChangeHandler,
    onLineChangeHandler,
    onColorChangeHandler,
}: SerieColorPickerProps) => {
    const displayOptions = displayOptionsProp ?? EMPTY_DISPLAY_OPTIONS;
    const colorOptions: { value: DashboardColor; label: string }[] =
        INDEXED_COLORS.map((palette) => ({
            value: palette,
            label: palette[0]?.toUpperCase() + palette.slice(1),
        }));

    const [serieColor, setSerieColor] = useState<DashboardColor | undefined>(
        isDashboardColor(displayOptions.color)
            ? displayOptions.color
            : getIndexedColor(index)
    );
    const [chartType, setChartType] = useState<'bar' | 'line'>(
        displayOptions.displayType === 'line' ? 'line' : 'bar'
    );
    const [lineType, setLineType] = useState<SerieCurveType>(
        displayOptions.curveType === 'curve' ? 'curve' : 'step'
    );
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const onChangeHandlerRef = useRef(onChangeHandler);

    useEffect(() => {
        onChangeHandlerRef.current = onChangeHandler;
    }, [onChangeHandler]);

    // Initialize the serieColor, chartType and lineType based on displayOptions or indexedColors
    useEffect(() => {
        setSerieColor(
            isDashboardColor(displayOptions.color)
                ? displayOptions.color
                : getIndexedColor(index)
        );
        setChartType(displayOptions.displayType === 'line' ? 'line' : 'bar');
        setLineType(displayOptions.curveType === 'curve' ? 'curve' : 'step');
    }, [displayOptions, index]);

    const selectColorHandler = (color: DashboardColor, index: number) => {
        setSerieColor(color);
        onColorChangeHandler?.(color, index);
        onChangeHandler?.({
            index,
            color,
            displayType: chartType,
            curveType: lineType,
        });
    };

    const selectChartTypeHandler = (
        displayType: 'bar' | 'line',
        index: number,
        curveType?: SerieCurveType
    ) => {
        setChartType(displayType);
        onTypeChangeHandler?.(displayType, index);

        if (displayType === 'line') {
            const nextCurve = curveType ?? lineType;
            setLineType(nextCurve);
            onLineChangeHandler?.(nextCurve, index);
        }
        onChangeHandler?.({
            index,
            color: serieColor,
            displayType,
            curveType: curveType ?? lineType,
        });
    };

    const isSelectedColor = (color: DashboardColor, index: number) => {
        if (color === serieColor) {
            return true;
        } else if (color !== serieColor && serieColor === undefined) {
            return color === getIndexedColor(index);
        }
        return false;
    };

    const isSelectedType = (type: 'bar' | 'line') => {
        return type === chartType;
    };

    useEffect(() => {
        onChangeHandlerRef.current?.({
            color: serieColor || getIndexedColor(index),
            displayType: chartType,
            curveType: lineType,
            open: isModalOpen,
            index,
        });
    }, [chartType, index, isModalOpen, lineType, serieColor]);

    return (
        <div
            data-component-name="serie-color-picker"
            className={style.serieTypeAndColorPicker}
        >
            <DropdownMenu
                open={isModalOpen}
                onOpenChange={(setOpen) => {
                    setIsModalOpen(setOpen);
                    onOpenChangeHandler?.(setOpen);
                }}
            >
                <DropdownMenuTrigger asChild>
                    <button
                        className={style.chartTypeButton}
                        aria-label={'Select type and color'}
                    >
                        {hideTypeOptions ? (
                            <div className={style.colorOnlyTrigger}>
                                <span
                                    className={style.colorOnlySwatch}
                                    style={{
                                        backgroundColor:
                                            primitives.colors.dashboard[
                                                serieColor ||
                                                    getIndexedColor(index)
                                            ][600],
                                    }}
                                />
                            </div>
                        ) : chartType === 'bar' ? (
                            <ChartTypeBarsButton
                                title="Bars"
                                color={serieColor || getIndexedColor(index)}
                                gradient={`gradientBar-${index}`}
                                gradientUrl={`url(#gradientBar-${index})`}
                            />
                        ) : (
                            <ChartTypeLineButton
                                title="Line"
                                color={serieColor || getIndexedColor(index)}
                                gradient={`gradientLine-${index}`}
                                gradientUrl={`url(#gradientLine-${index})`}
                            />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className={style.menuContent}>
                        {!hideTypeOptions && (
                            <>
                                <div data-name="type">
                                    <button
                                        aria-label={'Bars'}
                                        className={style.chartTypeButton}
                                        data-selected={isSelectedType('bar')}
                                        onClick={() =>
                                            selectChartTypeHandler('bar', index)
                                        }
                                    >
                                        <ChartTypeBarsButton
                                            title="Bars"
                                            color={
                                                serieColor ||
                                                getIndexedColor(index)
                                            }
                                            gradient={'gradientBar'}
                                            gradientUrl={'url(#gradientBar)'}
                                        />
                                    </button>
                                    <button
                                        aria-label={'Line'}
                                        className={style.chartTypeButton}
                                        data-selected={isSelectedType('line')}
                                        onClick={() =>
                                            selectChartTypeHandler(
                                                'line',
                                                index
                                            )
                                        }
                                    >
                                        <ChartTypeLineButton
                                            title="Line"
                                            color={
                                                serieColor ||
                                                getIndexedColor(index)
                                            }
                                            gradient={'gradientLine'}
                                            gradientUrl={'url(#gradientLine)'}
                                        />
                                    </button>
                                </div>
                                <hr />
                            </>
                        )}
                        <div data-name="color">
                            {colorOptions.map((option) => {
                                return (
                                    <ChartColorSelectButton
                                        color={option.value}
                                        selected={isSelectedColor(
                                            option.value,
                                            index
                                        )}
                                        key={option.value}
                                        selectColorHandler={(color) => {
                                            selectColorHandler(color, index);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SerieTypeAndColorPicker;
export { SerieTypeAndColorPicker };
