import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Column } from '../../../Layout';
import styles from './Card.module.scss';

export type CardProps = {
    above?: ReactNode;
    below?: ReactNode;
    header?: ReactNode;
    width?: string | number;
    height?: string | number;
    flexBasis?: number | string;
    fullContent?: boolean;
    children?: ReactNode;
    noPadding?: boolean;
};

/**
 * Generic card component
 * Size calculations are a bit tricky to support graph sizing within
 * content bounds (graphs require a set size in bounding container).
 */
export function Card({
    above,
    below,
    header,
    children,
    width,
    height,
    flexBasis,
    fullContent = false,
    noPadding,
}: CardProps) {
    const maxHeight = header !== undefined ? `calc(100% - 1em)` : `100%`;
    return (
        <Column align="stretch" width={width} height={height} style={{ flexBasis: flexBasis ?? 'none' }} gap="none">
            {above}
            <div className={styles.card} style={{ flex: 1, padding: noPadding ? 0 : undefined }}>
                {header && <div className={styles.header}>{header}</div>}
                <div
                    className={clsx(styles.content, fullContent && styles.content_full)}
                    style={{ maxHeight: maxHeight }}
                >
                    {children}
                </div>
            </div>
            {below}
        </Column>
    );
}

export function CardTest() {
    return <b>Hello world</b>;
}
