import { getActiveThemeSnapshot, ThemeContext } from '@brilliant/components';
import type { LocalizeFn } from '@bv/i18n-utils';
import type { CSSProperties } from 'react';
import { useContext, useMemo } from 'react';
import { useResponsiveGraphLayout } from '../../Common/layout';
import { createValueFormatter } from '../../Utility/numberFormatter';
import {
    GoalTargetComparison,
    GoalTargetElement,
    KpiGraphNumberBlock,
    KpiGraphNumberLineBlock,
} from './GraphDesignBlocks/KpiGraphDesignBlocks';
import ProgressLineResponsive from './GraphProgressLine/ProgressLineResponsive';
import styles from './KpiGraph.module.scss';

interface KpiGraphProps {
    target: number;
    unit: string;
    currentValue: number;
    previousValue: number;
    progressLineData: number[];
    labels?: string[];
    period: string;
    compareToSuffix?: string;
    showComparison?: boolean;
    showGraph?: boolean;
    showGoal?: boolean;
    hasGoal?: boolean;
    localize?: LocalizeFn;
    locale?: string;
    showDecimals?: boolean;
}

type CSSVarProperties = CSSProperties & Record<`--${string}`, string>;

export function KpiGraph({
    target,
    unit,
    currentValue,
    previousValue,
    progressLineData,
    labels = [],
    period,
    compareToSuffix,
    showComparison = true,
    showGraph = true,
    showGoal = true,
    hasGoal = true,
    localize,
    locale,
    showDecimals = false,
}: KpiGraphProps) {
    const { theme } = useContext(ThemeContext);
    const { layoutRef, layout } = useResponsiveGraphLayout();

    const diffToGoal = Math.round((currentValue - target) * 100) / 100;
    const diffUnit = unit === '%' ? 'pp' : unit;
    const diffToPrevious = currentValue - previousValue;
    const percentChange =
        previousValue !== 0 ? (diffToPrevious / previousValue) * 100 : 0;

    const goalVisible = showGoal && hasGoal;
    const curveColor =
        diffToGoal >= 0
            ? theme.colors.graph_positive.stroke
            : theme.colors.graph_negative.stroke;

    const fontSizes = useMemo(() => {
        const widthBase = layout.outerWidth * (showGraph ? 0.12 : 0.18);
        const heightCap = layout.outerHeight * (showGraph ? 0.5 : 0.65);
        const importantSize = Math.max(18, Math.min(widthBase, heightCap));
        const secondarySize = Math.max(12, importantSize * 0.32);
        const unitSize = Math.max(10, importantSize * 0.5);
        return {
            important: Math.round(importantSize),
            secondary: Math.round(secondarySize),
            unit: Math.round(unitSize),
        };
    }, [layout.outerWidth, layout.outerHeight, showGraph]);

    const kpiStyle: CSSVarProperties = {
        '--kpi-important-font-size': `${fontSizes.important}px`,
        '--kpi-secondary-font-size': `${fontSizes.secondary}px`,
        '--kpi-unit-font-size': `${fontSizes.unit}px`,
        '--kpi-target-font-size': `${fontSizes.secondary}px`,
    };

    const valueFormatter = useMemo(
        () => createValueFormatter({ locale, showDecimals }),
        [locale, showDecimals]
    );

    return (
        <div
            ref={layoutRef}
            className={styles.kpiGraphContainer}
            data-layout={layout}
            style={kpiStyle}
        >
            <div data-theme={getActiveThemeSnapshot()}>
                <KpiGraphNumberBlock>
                    <KpiGraphNumberLineBlock
                        variant="important"
                        unit={unit}
                        localize={localize}
                    >
                        {valueFormatter(currentValue)}
                    </KpiGraphNumberLineBlock>
                    {goalVisible && (
                        <KpiGraphNumberLineBlock>
                            <GoalTargetElement
                                diffToGoal={diffToGoal}
                                diffUnit={diffUnit}
                                target={target}
                                valueFormatter={valueFormatter}
                                localize={localize}
                            />
                        </KpiGraphNumberLineBlock>
                    )}
                    {showComparison && (
                        <KpiGraphNumberLineBlock>
                            <GoalTargetComparison
                                diffToPrevious={diffToPrevious}
                                percentChange={percentChange}
                                period={period}
                                compareToSuffix={compareToSuffix}
                                locale={locale}
                                showDecimals={showDecimals}
                            />
                        </KpiGraphNumberLineBlock>
                    )}
                </KpiGraphNumberBlock>
            </div>

            {showGraph && (
                <div data-type="graph-area">
                    {progressLineData.length > 0 && (
                        <ProgressLineResponsive
                            data={progressLineData}
                            targetValue={goalVisible ? target : undefined}
                            strokeColor={curveColor}
                            labels={labels ?? []}
                            currencySuffix={unit}
                            localize={localize}
                            valueFormatter={valueFormatter}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
