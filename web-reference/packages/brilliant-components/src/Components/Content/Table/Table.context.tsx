import type { PropsWithChildren } from 'react';
import React from 'react';

export type TableContextValue = {
    stickyHeader: boolean | undefined;
    highlightOnHover: boolean | undefined;
};

const TableContext = React.createContext<TableContextValue>({
    stickyHeader: undefined,
    highlightOnHover: undefined,
});

export function useTableContext() {
    return React.useContext(TableContext);
}

export function TableProvider({ children, value }: PropsWithChildren<{ value: TableContextValue }>) {
    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
