import {
    defaultTheme,
    setGlobalActiveTheme,
    ThemeContextWrapper,
} from '@brilliant/components';
import type { PropsWithChildren } from 'react';

export function ThemeProvider({ children }: PropsWithChildren) {
    setGlobalActiveTheme('light');
    return (
        <ThemeContextWrapper defaultTheme={defaultTheme} themeRoot={true}>
            <div data-theme="light">{children}</div>
        </ThemeContextWrapper>
    );
}
