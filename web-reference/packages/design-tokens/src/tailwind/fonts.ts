import { PluginCreator } from 'tailwindcss/types/config';
import { Tokens } from '../tokens/Alias';
import { typography } from '../tokens/Typography';
import { flattenObject } from '../util/getWriteableCSSTokens';

export function buildFontsPlugin(): PluginCreator {
    const entries = (
        [
            ['display', typography.display.font],
            ['text', typography.text.font],
            ['graph', typography.graph.font],
        ] as const
    ).flatMap(([prefix, fontMap]) =>
        createFontConfigEntries(`.bv-${prefix}-font`, fontMap)
    );
    const cssEntriesMap = Object.fromEntries(entries);

    return ({ addUtilities }) => addUtilities(cssEntriesMap);
}

function createFontConfigEntries(prefix: string, fontMap: Tokens) {
    const flattenedMap = flattenObject(fontMap);
    return Object.entries(flattenedMap).map(
        ([key, value]) =>
            [
                `${prefix}-${key}`,
                {
                    font: value,
                },
            ] as const
    );
}
