import type { Theme } from '~/Theme/ThemeDefinition';
import { useContext } from 'react';
import { ThemeContext } from '../Theme/ThemeContext/ThemeContextWrapper';

export type ThemeSpacing = 'xs' | 's' | 'm' | 'l' | 'xl' | 'none';

function wrapSpacing(amount: number) {
    return `calc(var(--spacing) * ${amount})`;
}

export function getThemeSpacing(spacing: ThemeSpacing): string {
    switch (spacing) {
        case 'xs':
            return wrapSpacing(0.25);
        case 's':
            return wrapSpacing(0.5);
        case 'm':
            return wrapSpacing(1);
        case 'l':
            return wrapSpacing(1.5);
        case 'xl':
            return wrapSpacing(2);
        case 'none':
            return 'none';
    }
}

/**
 * Utility hook for using the current theme
 */
export function useTheme(): Theme {
    const theme = useContext(ThemeContext);
    return theme.theme;
}
