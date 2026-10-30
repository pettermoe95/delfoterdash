import { SingleSelect, TextField } from '@brilliant/bds-core';
import { modes } from '@bv/design-tokens';
import { flattenObject } from '@bv/design-tokens/util';
import { DataTable } from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { ColorItem } from './ColorCell';
import { ColorCell } from './ColorCell';

const modesMap = flattenObject(modes);
const aliasColorItems = Object.entries(modesMap).map(([key, color]) => ({
    id: key,
    name: key.split('-').slice(1).join('-'),
    color,
    theme: key.split('-')[0],
})) satisfies ColorItem[];

const themeOptions = [
    {
        value: 'light',
        label: '☀️ Light theme',
    },
    {
        value: 'dark',
        label: '🌙 Dark theme',
    },
];
type ThemeKey = (typeof themeOptions)[number]['value'];

type AliasColorItem = (typeof aliasColorItems)[number];

const columnHelper = createColumnHelper<AliasColorItem>();

const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('color', { header: 'Color Code' }),
    columnHelper.accessor('color', {
        id: 'color-display',
        header: 'Color Preview',
        cell: (cell) => ColorCell(cell),
    }),
];

export function AliasTable() {
    const [search, setSearch] = useState<string>('');
    const [theme, setTheme] = useState<ThemeKey>('light');

    const filteredColors = useMemo(() => {
        const themeColors = aliasColorItems.filter(
            (item) => item.theme === theme
        );
        if (!search.length) return themeColors;
        return themeColors.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, theme]);

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between">
                <div className="max-w-xs">
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
                <div className="w-40">
                    <SingleSelect
                        value={theme}
                        onChange={setTheme}
                        options={themeOptions}
                    />
                </div>
            </div>
            <div className="rounded-md border border-primary bg-primary p-2">
                <DataTable data={filteredColors} columns={columns} />
            </div>
        </div>
    );
}
