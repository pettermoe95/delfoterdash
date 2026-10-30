import { darkMode, lightMode } from './Alias';
import { colors } from './Colors';
import { effects } from './Effects';
import { looks } from './Looks';
import { screenBreakpoints as breakpoints } from './Screens';
import { typography } from './Typography';

export const primitives = {
    colors: colors,
    ...typography,
    ...looks,
    ...effects,
    breakpoints,
} as const;

export type TokenPrimitives = typeof primitives;

export const modes = {
    light: lightMode,
    dark: darkMode,
};
