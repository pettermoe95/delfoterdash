import type { PropsWithChildren } from 'react';
import styles from './Table.module.scss';
import clsx from 'clsx';
import { useTableContext } from './Table.context';

type TableHeadProps = PropsWithChildren;
export function TableHead({ children }: TableHeadProps) {
    const { stickyHeader } = useTableContext();
    return (
        <thead className={styles.TableHead} data-sticky={stickyHeader}>
            {children}
        </thead>
    );
}

type TableRowProps = PropsWithChildren<{
    header?: boolean;
    active?: boolean;
}>;
export function TableRow({ children, header }: TableRowProps) {
    const { highlightOnHover } = useTableContext();
    return (
        <tr
            className={clsx(
                styles.TableRow,
                header && styles['TableRow--header'],
                !header && highlightOnHover && styles['TableRow--highlight-on-hover'],
            )}
        >
            {children}
        </tr>
    );
}

type HeaderCellProps = PropsWithChildren;
export function HeaderCell({ children }: HeaderCellProps) {
    return <th className={styles.HeaderCell}>{children}</th>;
}

type TableCellProps = PropsWithChildren;
export function TableCell({ children }: TableCellProps) {
    return <td className={styles.TableCell}>{children}</td>;
}
