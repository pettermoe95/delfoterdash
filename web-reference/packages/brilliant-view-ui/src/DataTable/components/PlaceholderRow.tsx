import { Icon } from '@brilliant/bds-core';
import { CellContent } from '../cells';
import type { DataTableProps } from '../types';

const defaultStrings: Record<string, string> = {
    'table.loading': 'Loading data',
    'table.noDataMessage': 'No data available!',
};

export function PlaceholderRow<T>({
    isLoading,
    noDataMessage,
    localizeFn,
}: Pick<DataTableProps<T>, 'isLoading' | 'noDataMessage' | 'localizeFn'>) {
    const localize =
        localizeFn ?? ((key: string) => defaultStrings[key] ?? key);
    return (
        <tr>
            <td className="relative table-cell px-sm py-lg" colSpan={100}>
                <CellContent>
                    {isLoading ? (
                        <>
                            <Icon icon="bv:loading" className="animate-spin" />
                            <span>{localize('table.loading')}</span>
                        </>
                    ) : (
                        (noDataMessage ?? localize('table.noDataMessage'))
                    )}
                </CellContent>
            </td>
        </tr>
    );
}
