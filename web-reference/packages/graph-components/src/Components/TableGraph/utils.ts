import {
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { CellContext, Table } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { DiscreteDimension, GraphDataSeries1D } from '../../Common/types';
import {
    formatValueByUnit,
    isPercentageUnit,
} from '../../Utility/unitFormatter';
import type { DynamicData } from './types';

type RawDataType = GraphDataSeries1D<DiscreteDimension>;

type DynamicTableOptions = {
    data: RawDataType;
    locale?: string;
    showDecimals?: boolean;
};

export function useDynamicTable({
    data,
    locale,
    showDecimals = false,
}: DynamicTableOptions): Table<DynamicData> {
    const tableData = useMemo(() => createTableData(data), [data]);
    const columns = useMemo(
        () => createColumns(data, locale, showDecimals),
        [data, locale, showDecimals]
    );

    return useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
}

const SERIES_COLUMN_KEY_PREFIX = 'series_';
type TableCellValue = string | number | null | undefined;

const getSeriesColumnKey = (index: number) =>
    `${SERIES_COLUMN_KEY_PREFIX}${index}`;

function createTableData(data: RawDataType) {
    return data.domain.values.map<DynamicData>((rowId, idx) => {
        const labelColumnName = data.domain.name ?? 'Label';
        const row: DynamicData = {
            id: String(rowId),
        };
        row[labelColumnName] = data.domain.labels?.[idx] ?? `Row ${idx + 1}`;
        data.series.forEach((series, seriesIdx) => {
            row[getSeriesColumnKey(seriesIdx)] = series.values[idx] ?? '';
        });
        return row;
    });
}

function createColumns(
    data: RawDataType,
    locale?: string,
    showDecimals = false
) {
    const labelColumnName = data.domain.name ?? 'Label';

    return [
        {
            accessorKey: labelColumnName,
            header: labelColumnName,
            footer: () => 'SUM',
            meta: {
                align: 'left',
            },
        },
        ...data.series.map((series, idx) => {
            const columnKey = getSeriesColumnKey(idx);
            return {
                accessorKey: columnKey,
                header: `${series.name ?? ''}`.trim(),
                cell: (info: CellContext<DynamicData, TableCellValue>) =>
                    formatValueByUnit(
                        info.getValue() ?? '',
                        series.unit,
                        false,
                        locale,
                        showDecimals
                    ),
                footer: () => {
                    if (isPercentageUnit(series.unit)) return '';
                    const summaryValue = getSeriesTotalOrAverage(
                        series.values,
                        series.unit
                    );
                    const formatted = formatValueByUnit(
                        summaryValue,
                        series.unit,
                        false,
                        locale,
                        showDecimals
                    );
                    return formatted;
                },
            };
        }),
    ];
}

function getSeriesTotalOrAverage(
    values: (number | null | undefined)[],
    unit: string | undefined
) {
    const validValues = values.filter(
        (v): v is number => typeof v === 'number' && !Number.isNaN(v)
    );

    if (isPercentageUnit(unit)) {
        const sum = validValues.reduce((acc, v) => acc + v, 0);
        return validValues.length > 0 ? sum / validValues.length : 0;
    }

    return validValues.reduce((acc, v) => acc + v, 0);
}

export function getColumnAlign(meta: unknown): 'left' | 'right' {
    if (
        meta &&
        typeof meta === 'object' &&
        'align' in meta &&
        (meta.align === 'left' || meta.align === 'right')
    ) {
        return meta.align;
    }

    return 'right';
}
