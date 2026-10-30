import { TextField } from '@brilliant/bds-core';
import { primitives } from '@bv/design-tokens';
import { flattenObject } from '@bv/design-tokens/util';
import { DataTable } from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { ColorItem } from './ColorCell';
import { ColorCell } from './ColorCell';

const flattenedColors = flattenObject(primitives.colors);

const colorItems = Object.entries(flattenedColors).map(([key, color]) => ({
    id: key,
    name: key,
    color,
})) satisfies ColorItem[];

const columnHelper = createColumnHelper<ColorItem>();
const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('color', { header: 'Color Code' }),
    columnHelper.accessor('color', {
        id: 'color-display',
        header: 'Color Preview',
        cell: ColorCell,
    }),
];

export function ColorsTable() {
    const [search, setSearch] = useState<string>('');

    const filteredColors = useMemo(() => {
        if (!search.length) return colorItems;
        return colorItems.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="flex flex-col gap-sm">
            <div style={{ maxWidth: '350px' }}>
                <TextField
                    label=""
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    name="search"
                    size="sm"
                    leftIcon="bv:search"
                    placeholder="Filter colors by name"
                />
            </div>
            <div className="rounded-md border border-primary bg-primary p-2">
                <DataTable data={filteredColors} columns={columns} sortable />
            </div>
        </div>
    );
}
