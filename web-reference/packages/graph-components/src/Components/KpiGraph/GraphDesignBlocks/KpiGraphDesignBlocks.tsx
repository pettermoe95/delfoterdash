import type { LocalizeFn } from '@bv/i18n-utils';
import { localizeUnit } from '@bv/i18n-utils';
import type { ReactNode } from 'react';
import { createValueFormatter } from '../../../Utility/numberFormatter';
import styles from '../KpiGraph.module.scss';

interface KpiGraphNumberBlockProps {
    className?: string;
    children?: ReactNode;
    variant?: 'default' | 'important';
}

export const KpiGraphNumberBlock = ({
    className = '',
    children,
}: KpiGraphNumberBlockProps) => {
    return (
        <div
            data-component-name="KpiGraphNumberBlock"
            className={`${className}`}
        >
            {children}
        </div>
    );
};

interface KpiGraphNumberLineBlockProps {
    variant?: 'default' | 'important';
    children?: ReactNode;
    unit?: string;
    localize?: LocalizeFn;
}

export const KpiGraphNumberLineBlock = ({
    variant = 'default',
    children,
    unit,
    localize,
}: KpiGraphNumberLineBlockProps) => {
    return (
        <div
            data-component-name="KpiGraphNumberLineBlock"
            data-variant={variant}
            className={styles.lineBlock}
        >
            {children}
            {unit && (
                <span className={styles.unit}>
                    {localizeUnit(unit, localize)}
                </span>
            )}
        </div>
    );
};

type GoalTargetElementProps = {
    diffToGoal: number;
    diffUnit: string;
    target: number;
    valueFormatter?: (v: number) => string;
    localize?: LocalizeFn;
};

export const GoalTargetElement: React.FC<GoalTargetElementProps> = ({
    diffToGoal,
    diffUnit,
    target,
    valueFormatter,
    localize,
}) => {
    const isPositiveNumber = Math.sign(diffToGoal) === 1;
    const format = valueFormatter || ((v: number) => `${v}`);
    const formattedDiff = `${diffToGoal > 0 ? '+' : ''}${format(diffToGoal)} ${localizeUnit(diffUnit, localize)}`;
    const formattedTarget = `${format(target)} ${localizeUnit(diffUnit, localize)}`;
    return (
        <>
            <span className={styles.target}>
                <span
                    data-indicator={isPositiveNumber ? 'positive' : 'negative'}
                >
                    {formattedDiff}
                </span>
                <span>{` ${localize?.('miscTerms.vsGoalOf') ?? 'vs goal of'} `}</span>
                <span>{formattedTarget}</span>
            </span>
        </>
    );
};

type GoalTargetComparisonProps = {
    diffToPrevious: number;
    percentChange: number;
    period: string;
    compareToSuffix?: string;
    locale?: string;
    showDecimals?: boolean;
};

export const GoalTargetComparison: React.FC<GoalTargetComparisonProps> = ({
    diffToPrevious,
    percentChange,
    period,
    compareToSuffix = 'vs last',
    locale,
    showDecimals = false,
}) => {
    const isPositiveNumber = Math.sign(diffToPrevious) === 1;
    const periodWithFallback = period === undefined ? 'period' : period;
    const percentageFormatter = createValueFormatter({ locale, showDecimals });

    return (
        <>
            {Number.isFinite(percentChange) && (
                <span className={styles.target}>
                    <span
                        data-indicator={
                            isPositiveNumber ? 'positive' : 'negative'
                        }
                    >{`${percentChange >= 0 ? '+' : ''}${percentageFormatter(percentChange)}%`}</span>
                    <span data-suffix="compareToSuffix">{` ${compareToSuffix} ${periodWithFallback}`}</span>
                </span>
            )}
        </>
    );
};
