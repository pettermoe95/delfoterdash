import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import styles from './TableCell.module.scss';

type TableCellProps = PropsWithChildren<{
    variant?: 'body' | 'footer';
    align?: 'left' | 'right';
    isDomainColumn?: boolean;
}>;

export function TableCell({
    children,
    variant = 'body',
    align = 'right',
    isDomainColumn = false,
}: TableCellProps) {
    const alignClass = align === 'left' ? styles.alignLeft : styles.alignRight;
    return (
        <td
            className={clsx(
                styles.tableCell,
                alignClass,
                isDomainColumn && styles.domainCell,
                variant === 'body' && styles.bodyCell,
                variant === 'footer' && styles.footer
            )}
        >
            {children}
        </td>
    );
}
