import { describe, expect, test } from 'vitest';
import { flattenObject } from './getWriteableCSSTokens';

const testTokens = {
    primary: 'Primary Color',
    background: {
        brand: {
            primary: 'Primary Brand Background',
            secondary: 'Secondary Brand Background',
        },
    },
};

const testCSSArray = {
    primary: 'Primary Color',
    'background-brand-primary': 'Primary Brand Background',
    'background-brand-secondary': 'Secondary Brand Background',
};

const testTokensWithDefaults = {
    ...testTokens,
    secondary: {
        default: 'Secondary Color',
        alt: 'Secondary Alt Color',
    },
};

const testCSSDictionaryWithDefaults = {
    primary: 'Primary Color',
    secondary: 'Secondary Color',
    'secondary-alt': 'Secondary Alt Color',
    'background-brand-primary': 'Primary Brand Background',
    'background-brand-secondary': 'Secondary Brand Background',
};

const testTokensWithAbitraryCasing = {
    ...testTokens,
    secondary: {
        default: 'Secondary Color',
        onBrand: 'Secondary On Brand',
        off_brand: 'Secondary Off Brand',
        SideBrand: 'Secondary Side Brand',
    },
};

const testCSSDictionaryWithArbitraryCasing = {
    ...testCSSArray,
    secondary: 'Secondary Color',
    'secondary-on-brand': 'Secondary On Brand',
    'secondary-off-brand': 'Secondary Off Brand',
    'secondary-side-brand': 'Secondary Side Brand',
};

describe('flattenObject should flatten arbitrary token objects', () => {
    test('Should flatten array with hyphens', () => {
        const flattened = flattenObject(testTokens);
        expect(flattened).toEqual(testCSSArray);
    });
    test('Should use parent key for default tokens', () => {
        const flattened = flattenObject(testTokensWithDefaults);
        expect(flattened).toEqual(testCSSDictionaryWithDefaults);
    });
    test('Should convert key casings to kebab-case', () => {
        const flattened = flattenObject(testTokensWithAbitraryCasing);
        expect(flattened).toEqual(testCSSDictionaryWithArbitraryCasing);
    });
});
