import clsx from 'clsx';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { ThemeContextWrapper } from '../../Theme/ThemeContext/ThemeContextWrapper';

import styles from './StorybookThemeDecorator.module.scss';
import logo from '../../assets/brilliant_black_transparent_small.png';
import type { Theme, ThemeColors, ThemeLayout, ThemeLook } from '../../Theme/ThemeDefinition';
import { defaultTheme } from '../../Theme/ThemeDefinition';
import { THEME_COLORS } from '../../Theme/Presets/Colors';
import { modernRounded, modernSquared } from '../../Theme/Presets/Looks';
import { defaultLayout, compactLayout } from '../../Theme/Presets/Layout';

export type StorybookThemeDecoratorProps = {
    fixed?: boolean;
    children: JSX.Element | JSX.Element[];
};

const colorMap: Record<string, ThemeColors> = {
    default: THEME_COLORS.light,
    dark: THEME_COLORS.dark,
    'brilliant-green': THEME_COLORS.green,
};

const lookMap: Record<string, ThemeLook> = {
    rounded: modernRounded,
    squared: modernSquared,
};

const layoutMap: Record<string, ThemeLayout> = {
    default: defaultLayout,
    compact: compactLayout,
};

export function StorybookThemeDecorator({ fixed = false, children }: StorybookThemeDecoratorProps) {
    // Local storage to save between stories
    const storedColor = localStorage.getItem('storybook_wrapper_color') ?? 'default';
    const storedLook = localStorage.getItem('storybook_wrapper_look') ?? 'default';
    const storedLayout = localStorage.getItem('storybook_wrapper_layout') ?? 'default';

    // State used to disable transitions on changes
    // eslint-disable-next-line
    const [transparentBackground, setTransparentBackground] = useState<boolean>(false);

    // States for theme changes
    const [themeColor, setThemeColor] = useState<string>(storedColor);
    const [themeLook, setThemeLook] = useState<string>(storedLook);
    const [themeLayout, setThemeLayout] = useState<string>(storedLayout);

    // Set color and save in local storage
    function setAndSaveColor(color: string) {
        localStorage.setItem('storybook_wrapper_color', color);
        setThemeColor(color);
    }

    // Set look and save in local storage
    function setAndSaveLook(look: string) {
        localStorage.setItem('storybook_wrapper_look', look);
        setThemeLook(look);
    }

    // Set layout and save in local storage
    function setAndSaveLayout(layout: string) {
        localStorage.setItem('storybook_wrapper_layout', layout);
        setThemeLayout(layout);
    }

    function makeTheme(color?: string, look?: string, layout?: string): Theme {
        return {
            colors: colorMap[color ?? themeColor] ?? defaultTheme.colors,
            look: lookMap[look ?? themeLook] ?? defaultTheme.look,
            layout: layoutMap[layout ?? themeLayout] ?? defaultTheme.layout,
            general: defaultTheme.general,
        };
    }

    function backgroundButton(color: string) {
        const selected = themeColor === color;
        return (
            <ThemeContextWrapper defaultTheme={makeTheme(color, undefined)}>
                <div>
                    <div
                        className={clsx(styles.background_button, selected && styles.selected)}
                        onClick={() => setAndSaveColor(color)}
                    />
                    {selected && <div className={styles.button_selected} />}
                </div>
            </ThemeContextWrapper>
        );
    }

    function lookButton(look: string): ReactElement {
        const selected = themeLook === look;
        return (
            <ThemeContextWrapper defaultTheme={makeTheme(undefined, look)}>
                <div>
                    <div
                        className={clsx(styles.look_button, selected && styles.selected)}
                        onClick={() => setAndSaveLook(look)}
                    >
                        {look.replaceAll('-', ' ')}
                    </div>
                    {selected && <div className={styles.button_selected} />}
                </div>
            </ThemeContextWrapper>
        );
    }

    function layoutButton(layout: string): ReactElement {
        const selected = themeLayout === layout;
        return (
            <div>
                <div
                    className={clsx(styles.look_button, selected && styles.selected)}
                    onClick={() => setAndSaveLayout(layout)}
                >
                    {layout.replaceAll('-', ' ')}
                </div>
                {selected && <div className={styles.button_selected} />}
            </div>
        );
    }

    return (
        <ThemeContextWrapper
            className={clsx(styles.story_wrapper, transparentBackground && styles.transparent_background)}
            defaultTheme={makeTheme()}
            themeRoot={true}
        >
            <div className={styles.decorator_wrapper}>
                <div className={styles.child_wrapper}>{children}</div>

                <div className={clsx(styles.tools, fixed && styles.fixed)}>
                    {/* Theme Color Selection */}
                    <div className={styles.option_column}>
                        <div className={styles.option_name}>Color</div>
                        <div className={styles.option_row}>
                            {Object.keys(colorMap).map((color) => backgroundButton(color))}
                        </div>
                    </div>

                    <div className={styles.tool_divider} />

                    {/* Theme Look Selection */}
                    <div className={styles.option_column}>
                        <div
                            className={styles.option_name}
                            style={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                            Look
                        </div>
                        <div className={styles.option_row}>{Object.keys(lookMap).map((look) => lookButton(look))}</div>
                    </div>

                    <div className={styles.tool_divider} />

                    {/* Theme Layout Selection */}
                    <div className={styles.option_column}>
                        <div
                            className={styles.option_name}
                            style={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                            Layout
                            <img className={styles.brilliant_logo} src={logo} alt="Brilliant Logo" />
                        </div>
                        <div className={styles.option_row}>
                            {Object.keys(layoutMap).map((look) => layoutButton(look))}
                        </div>
                    </div>
                </div>
            </div>
        </ThemeContextWrapper>
    );
}
