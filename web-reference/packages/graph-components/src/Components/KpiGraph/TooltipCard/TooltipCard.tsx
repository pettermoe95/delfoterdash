import { getActiveThemeSnapshot } from '@brilliant/components';
import type { LocalizeFn } from '@bv/i18n-utils';
import { localizeUnit } from '@bv/i18n-utils';
import React from 'react';
import { defaultValueFormatter } from '../../../Utility/numberFormatter';
import styles from './TooltipCard.module.scss';

export interface TooltipCardProps {
    label: string;
    value: number;
    valueFormatter?: (value: number) => string;
    className?: string;
    style?: React.CSSProperties; // positional overrides (left/top) etc.
    /** Optional custom icon (defaults to TrendIcon) */
    icon?: React.ReactNode;
    currencySuffix?: string; // e.g. 'kr'
    /** Controls fade in visibility */
    visible?: boolean;
    color?: string;
    localize?: LocalizeFn;
}

const TrendIcon: React.FC<{ color?: string; size?: number }> = ({
    // default uses success primary token (falls back to previous hex if tokens not loaded)
    color = 'var(--text-success-primary, #06763C)',
    size = 16,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
    >
        <path
            d="M2 11.5L6.5 6.5L9.5 9.5L14 4"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const TooltipCard: React.FC<TooltipCardProps> = ({
    label,
    value,
    valueFormatter = defaultValueFormatter,
    className,
    style,
    icon,
    color,
    currencySuffix = 'kr',
    visible = true,
    localize,
}) => {
    return (
        <div
            data-theme={getActiveThemeSnapshot()}
            className={[styles.card, visible && styles.visible, className]
                .filter(Boolean)
                .join(' ')}
            style={style}
        >
            <h4 className={styles.title}>{label}</h4>
            <div className={styles.row}>
                {icon ?? <TrendIcon color={color} />}
                <span>
                    {valueFormatter(value)}{' '}
                    {localizeUnit(currencySuffix, localize)}
                </span>
            </div>
        </div>
    );
};

export default TooltipCard;
