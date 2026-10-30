export type ThemeName = 'light' | 'dark';

let activeThemeSnapshot: ThemeName = 'light';

export function setGlobalActiveTheme(theme: ThemeName) {
    activeThemeSnapshot = theme;
}

export function getActiveThemeSnapshot(): ThemeName {
    return activeThemeSnapshot;
}

export function pickColorBasedOnTheme(lightColor: string, darkColor: string) {
    return activeThemeSnapshot === 'dark' ? darkColor : lightColor;
}
