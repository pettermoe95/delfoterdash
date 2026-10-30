import type { ThemeContextType } from '@brilliant/components';
import {
    defaultDarkTheme,
    defaultTheme,
    setGlobalActiveTheme,
    ThemeContext,
    ThemeContextWrapper,
} from '@brilliant/components';
import { useActiveTheme, useSyncSystemTheme } from '~/stores/system';
import type { PropsWithChildren } from 'react';
import { useContext, useEffect } from 'react';

export function ThemeProvider({ children }: PropsWithChildren) {
    return (
        <ThemeContextWrapper defaultTheme={defaultDarkTheme} themeRoot={true}>
            <BDSThemeProvider>{children}</BDSThemeProvider>
        </ThemeContextWrapper>
    );
}

function BDSThemeProvider({ children }: PropsWithChildren) {
    useSyncSystemTheme();
    const theme = useActiveTheme();
    const { setTheme } = useContext<ThemeContextType>(ThemeContext);

    useEffect(() => {
        setTheme(theme === 'dark' ? defaultDarkTheme : defaultTheme);
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        setGlobalActiveTheme(theme);
    }, [setTheme, theme]);

    return <div data-theme={theme}>{children}</div>;
}
