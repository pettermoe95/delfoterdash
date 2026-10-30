import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';
import type { BasicTableRenderProps } from '../types';

export type TableContextValue<T> = BasicTableRenderProps<T> & {
    virtual?: boolean;
    height?: number;
};

const TableContext = createContext<TableContextValue<unknown> | null>(null);

export function TableProvider<T>({
    children,
    value,
}: PropsWithChildren<{ value: TableContextValue<T> }>) {
    return (
        <TableContext.Provider value={value as TableContextValue<unknown>}>
            {children}
        </TableContext.Provider>
    );
}

export function useTableContext() {
    const context = useContext(TableContext);

    if (context == null) {
        throw new Error('useTableContext must be used within a TableProvider');
    }

    return context;
}
