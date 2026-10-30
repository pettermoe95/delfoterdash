import type { bvIconNames } from '@brilliant/bds-core';
import { Icon } from '@brilliant/bds-core';
import { primitives } from '@bv/design-tokens';

export const colorOptions = Object.entries(primitives.colors.dashboard).map(
    ([palette, colors]) => ({
        value: palette as keyof typeof primitives.colors.dashboard,
        label: (
            <div className="flex items-center gap-2">
                <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: colors[500] }}
                />
                {palette[0].toUpperCase() + palette.slice(1)}
            </div>
        ),
    })
);

const iconOptionNames = [
    'analytics',
    'announcement',
    'book-open',
    'dashboard',
    'report',
    'presentation',
] satisfies typeof bvIconNames;

export const iconOptions = iconOptionNames.map((name) => {
    const formattedName = name
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ');
    return {
        value: name,
        label: (
            <div className="flex items-center gap-2">
                <Icon icon={'bv:' + name} />
                <span className="truncate">{formattedName}</span>
            </div>
        ),
    };
});
