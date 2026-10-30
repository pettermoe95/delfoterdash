import { Tooltip } from '@brilliant/bds-core';
import type { ColorPalette } from '@brilliant/components';
import { primitives } from '@bv/design-tokens';

const { base: _base, ...colors } = primitives.colors;

export function ColorsIndex() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: 16,
                borderRadius: 'var(--border-radius-md)',
            }}
        >
            <PaletteCategory name="primary" />
            <PaletteCategory name="secondary" />
            <PaletteCategory name="dashboard" />
        </div>
    );
}

function PaletteCategory(props: { name: keyof typeof colors }) {
    const category = colors[props.name];
    return (
        <div>
            <h2
                style={{
                    font: 'var(--display-font-sm-regular)',
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                }}
            >
                {props.name}
            </h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                {Object.keys(category).map((key) => (
                    <Palette
                        key={key}
                        name={key}
                        palette={category[key as keyof typeof category]}
                    />
                ))}
            </div>
        </div>
    );
}

function Palette({ name, palette }: { name: string; palette: ColorPalette }) {
    return (
        <div>
            <h3
                style={{
                    font: 'var(--display-font-xs-regular)',
                    color: 'var(--text-secondary)',
                    marginBottom: 4,
                }}
            >
                {name}
            </h3>
            <div
                style={{
                    display: 'flex',
                    gap: 5,
                }}
            >
                {Object.entries(palette).map(([key, color]) => (
                    <Color name={key} color={color} />
                ))}
            </div>
        </div>
    );
}

function Color({ color, name }: { color: string; name: string }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
            }}
        >
            <Tooltip title={color}>
                <div
                    style={{
                        backgroundColor: color,
                        height: 48,
                        width: 48,
                        borderRadius: 5,
                        boxShadow: 'var(--shadow-lg)',
                    }}
                />
            </Tooltip>
            <div>{name}</div>
        </div>
    );
}
