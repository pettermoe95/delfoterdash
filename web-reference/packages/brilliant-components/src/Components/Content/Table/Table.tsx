import type { PropsWithChildren } from 'react';
import styles from './Table.module.scss';
import { HeaderCell, TableCell, TableHead, TableRow } from './Table.components';
import { TableProvider } from './Table.context';

type TableProps = PropsWithChildren<{
    stickyHeader?: boolean;
    highlightOnHover?: boolean;
}>;

export function Table({ children, stickyHeader, highlightOnHover }: TableProps) {
    return (
        <TableProvider value={{ stickyHeader, highlightOnHover }}>
            <table className={styles.Table}>{children}</table>
        </TableProvider>
    );
}

Table.Thead = TableHead;
Table.Tr = TableRow;
Table.Th = HeaderCell;
Table.Td = TableCell;
