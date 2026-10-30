import kebabCase from 'lodash/kebabCase.js';
import { Tokens } from '../tokens/Alias';

export function getWriteableCSSTokens(tokens: Tokens): string {
    const cssTokens = flattenObject(tokens);
    const preparedTokens = Object.entries(cssTokens)
        .map(([key, value]) => `\t--${key}: ${value};`)
        .join('\n');
    return preparedTokens;
}

export function flattenObject(
    obj: Tokens,
    parentKey = ''
): Record<string, string> {
    const flattened: Record<string, string> = {};

    for (const key in obj) {
        if (key in obj) {
            const propName = getMaybeDefault(parentKey, key);
            const cssKey = kebabCase(propName);

            if (typeof obj[key] === 'string') {
                flattened[cssKey] = obj[key] as string;
            } else {
                Object.assign(
                    flattened,
                    flattenObject(obj[key] as Tokens, propName)
                );
            }
        }
    }

    return flattened;
}

function getMaybeDefault(parentKey: string, key: string) {
    if (key === 'default') return parentKey;
    if (parentKey.length) return `${parentKey}-${key}`;
    return key;
}
