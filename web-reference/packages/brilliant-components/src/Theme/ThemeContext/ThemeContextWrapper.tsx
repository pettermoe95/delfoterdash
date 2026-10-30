import clsx from 'clsx';
import type { Context, CSSProperties } from 'react';
import { createContext, useEffect, useState } from 'react';
import type { Theme } from '../ThemeDefinition';
import { defaultTheme, generateThemeStyleVariables } from '../ThemeDefinition';
import styles from './ThemeContextWrapper.module.scss';

export type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

export const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>({
    theme: defaultTheme,
    setTheme: () => {
        return;
    },
});

export type ThemeContextWrapperProps = {
    // Theme props
    defaultTheme: Theme;
    // Container props
    themeRoot?: boolean; // Set to use background and expand to full size
    className?: string;
    children: JSX.Element | JSX.Element[];
};

export function ThemeContextWrapper({ defaultTheme, themeRoot, className, children }: ThemeContextWrapperProps) {
    // State used to disable transitions on changes
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

    // Detect theme change
    const disableTransitions = currentTheme !== theme;
    useEffect(() => {
        setCurrentTheme(theme);
    }, [theme, setCurrentTheme]);

    useEffect(() => {
        const themeStyle = generateThemeStyleVariables(theme);
        Object.keys(themeStyle).forEach((key) => {
            const k = key as keyof CSSProperties;
            document.body.style.setProperty(key, themeStyle[k] as string);
        });
    }, [theme]);

    // Classes for wrapper
    const themeStyle = {
        //...generateThemeStyleVariables(theme),
        backgroundColor: themeRoot ? theme.colors.base_background : 'none',
        color: theme.colors.text.primary,
    };
    const containerClass = clsx({
        [styles.container]: true,
        [styles.themeRoot]: themeRoot,
        [styles.disableTransitions]: disableTransitions,
        className,
    });

    return (
        <ThemeContext.Provider value={{ theme: theme, setTheme: setTheme }}>
            <div className={containerClass} style={themeStyle}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}
